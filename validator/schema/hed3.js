import zip from 'lodash/zip'
import semver from 'semver'

// TODO: Switch require once upstream bugs are fixed.
// import xpath from 'xml2js-xpath'
// Temporary
import * as xpath from '../../utils/xpath'

import { SchemaParser } from './parser'
import {
  nodeProperty,
  SchemaAttribute,
  schemaAttributeProperty,
  SchemaEntries,
  SchemaEntryManager,
  SchemaProperty,
  SchemaTag,
  SchemaTagManager,
  SchemaUnit,
  SchemaUnitClass,
  SchemaUnitModifier,
  SchemaValueClass,
  SchemaValueTag,
} from './types'
import { generateIssue, IssueError } from '../../common/issues/issues'

const specialTags = require('../../data/json/specialTags.json')

const lc = (str) => str.toLowerCase()

export class Hed3SchemaParser extends SchemaParser {
  /**
   * @type {Map<string, SchemaProperty>}
   */
  properties
  /**
   * @type {Map<string, SchemaAttribute>}
   */
  attributes
  /**
   * The schema's value classes.
   * @type {SchemaEntryManager<SchemaValueClass>}
   */
  valueClasses
  /**
   * The schema's unit classes.
   * @type {SchemaEntryManager<SchemaUnitClass>}
   */
  unitClasses
  /**
   * The schema's unit modifiers.
   * @type {SchemaEntryManager<SchemaUnitModifier>}
   */
  unitModifiers
  /**
   * The schema's tags.
   * @type {SchemaTagManager}
   */
  tags

  constructor(rootElement) {
    super(rootElement)
    this._versionDefinitions = {}
  }

  parse() {
    this.populateDictionaries()
    return new SchemaEntries(this)
  }

  populateDictionaries() {
    this.parseProperties()
    this.parseAttributes()
    this.parseUnitModifiers()
    this.parseUnitClasses()
    this.parseTags()
  }

  static attributeFilter(propertyName) {
    return (element) => {
      const validProperty = propertyName
      if (!element.property) {
        return false
      }
      for (const property of element.property) {
        if (property.name[0]._ === validProperty) {
          return true
        }
      }
      return false
    }
  }

  /**
   * Retrieve all the tags in the schema.
   *
   * @param {string} tagElementName The name of the tag element.
   * @returns {Map<Object, string>} The tag names and XML elements.
   */
  getAllTags(tagElementName = 'node') {
    const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
    const tags = tagElements.map((element) => this.getElementTagName(element))
    return new Map(zip(tagElements, tags))
  }

  // Rewrite starts here.

  parseProperties() {
    const propertyDefinitions = this.getElementsByName('propertyDefinition')
    this.properties = new Map()
    for (const definition of propertyDefinitions) {
      const propertyName = this.getElementTagName(definition)
      if (this._versionDefinitions.categoryProperties?.has(propertyName)) {
        this.properties.set(
          propertyName,
          // TODO: Switch back to class constant once upstream bug is fixed.
          new SchemaProperty(propertyName, 'categoryProperty'),
        )
      } else if (this._versionDefinitions.typeProperties?.has(propertyName)) {
        this.properties.set(
          propertyName,
          // TODO: Switch back to class constant once upstream bug is fixed.
          new SchemaProperty(propertyName, 'typeProperty'),
        )
      } else if (this._versionDefinitions.roleProperties?.has(propertyName)) {
        this.properties.set(
          propertyName,
          // TODO: Switch back to class constant once upstream bug is fixed.
          new SchemaProperty(propertyName, 'roleProperty'),
        )
      }
    }
    this._addCustomProperties()
  }

  parseAttributes() {
    const attributeDefinitions = this.getElementsByName('schemaAttributeDefinition')
    this.attributes = new Map()
    for (const definition of attributeDefinitions) {
      const attributeName = this.getElementTagName(definition)
      const propertyElements = definition.property
      let properties
      if (propertyElements === undefined) {
        properties = []
      } else {
        properties = propertyElements.map((element) => this.properties.get(this.getElementTagName(element)))
      }
      this.attributes.set(attributeName, new SchemaAttribute(attributeName, properties))
    }
    this._addCustomAttributes()
  }

  parseValueClasses() {
    const valueClasses = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('valueClass')
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      valueClasses.set(name, new SchemaValueClass(name, booleanAttributes, valueAttributes))
    }
    this.valueClasses = new SchemaEntryManager(valueClasses)
  }

  parseUnitModifiers() {
    const unitModifiers = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('unitModifier')
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitModifiers.set(name, new SchemaUnitModifier(name, booleanAttributes, valueAttributes))
    }
    this.unitModifiers = new SchemaEntryManager(unitModifiers)
  }

  parseUnitClasses() {
    const unitClasses = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('unitClass')
    const unitClassUnits = this.parseUnits()

    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitClasses.set(name, new SchemaUnitClass(name, booleanAttributes, valueAttributes, unitClassUnits.get(name)))
    }
    this.unitClasses = new SchemaEntryManager(unitClasses)
  }

  parseUnits() {
    const unitClassUnits = new Map()
    const unitClassElements = this.getElementsByName('unitClassDefinition')
    const unitModifiers = this.unitModifiers
    for (const element of unitClassElements) {
      const elementName = this.getElementTagName(element)
      const units = new Map()
      unitClassUnits.set(elementName, units)
      if (element.unit === undefined) {
        continue
      }
      const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions] = this._parseAttributeElements(
        element.unit,
        this.getElementTagName,
      )
      for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
        const booleanAttributes = unitBooleanAttributeDefinitions.get(name)
        units.set(name, new SchemaUnit(name, booleanAttributes, valueAttributes, unitModifiers))
      }
    }
    return unitClassUnits
  }

  // Tag parsing

  /**
   * Parse the schema's tags.
   */
  parseTags() {
    const tags = this.getAllTags()
    const shortTags = this._getShortTags(tags)
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseAttributeElements(
      tags.keys(),
      (element) => shortTags.get(element),
    )

    const tagUnitClassDefinitions = this._processTagUnitClasses(shortTags, valueAttributeDefinitions)
    this._processRecursiveAttributes(shortTags, booleanAttributeDefinitions)

    const tagEntries = this._createSchemaTags(
      booleanAttributeDefinitions,
      valueAttributeDefinitions,
      tagUnitClassDefinitions,
    )

    this._injectTagFields(tags, shortTags, tagEntries)

    const longNameTagEntries = new Map()
    for (const tag of tagEntries.values()) {
      longNameTagEntries.set(lc(tag.longName), tag)
    }

    this.tags = new SchemaTagManager(tagEntries, longNameTagEntries)
  }

  /**
   * Generate the map from tag elements to shortened tag names.
   *
   * @param {Map<Object, string>} tags The map from tag elements to tag strings.
   * @returns {Map<Object, string>} The map from tag elements to shortened tag names.
   * @private
   */
  _getShortTags(tags) {
    const shortTags = new Map()
    for (const tagElement of tags.keys()) {
      const shortKey =
        this.getElementTagName(tagElement) === '#'
          ? this.getParentTagName(tagElement) + '-#'
          : this.getElementTagName(tagElement)
      shortTags.set(tagElement, shortKey)
    }
    return shortTags
  }

  /**
   * Process unit classes in tags.
   *
   * @param {Map<Object, string>} shortTags The map from tag elements to shortened tag names.
   * @param {Map<string, Map<SchemaAttribute, *>>} valueAttributeDefinitions The map from shortened tag names to their value schema attributes.
   * @returns {Map<string, SchemaUnitClass[]>} The map from shortened tag names to their unit classes.
   * @private
   */
  _processTagUnitClasses(shortTags, valueAttributeDefinitions) {
    const tagUnitClassAttribute = this.attributes.get('unitClass')
    const tagUnitClassDefinitions = new Map()

    for (const tagName of shortTags.values()) {
      const valueAttributes = valueAttributeDefinitions.get(tagName)
      if (valueAttributes.has(tagUnitClassAttribute)) {
        tagUnitClassDefinitions.set(
          tagName,
          valueAttributes.get(tagUnitClassAttribute).map((unitClassName) => {
            return this.unitClasses.getEntry(unitClassName)
          }),
        )
        valueAttributes.delete(tagUnitClassAttribute)
      }
    }

    return tagUnitClassDefinitions
  }

  /**
   * Process recursive schema attributes.
   *
   * @param {Map<Object, string>} shortTags The map from tag elements to shortened tag names.
   * @param {Map<string, Set<SchemaAttribute>>} booleanAttributeDefinitions The map from shortened tag names to their boolean schema attributes. Passed by reference.
   * @private
   */
  _processRecursiveAttributes(shortTags, booleanAttributeDefinitions) {
    const recursiveAttributes = this._getRecursiveAttributes()

    for (const [tagElement, tagName] of shortTags) {
      for (const attribute of recursiveAttributes) {
        if (booleanAttributeDefinitions.get(tagName).has(attribute)) {
          for (const childTag of this.getAllChildTags(tagElement)) {
            const childTagName = this.getElementTagName(childTag)
            booleanAttributeDefinitions.get(childTagName).add(attribute)
          }
        }
      }
    }
  }

  /**
   * Create the {@link SchemaTag} objects.
   *
   * @param {Map<string, Set<SchemaAttribute>>} booleanAttributeDefinitions The map from shortened tag names to their boolean schema attributes.
   * @param {Map<string, Map<SchemaAttribute, *>>} valueAttributeDefinitions The map from shortened tag names to their value schema attributes.
   * @param {Map<string, SchemaUnitClass[]>} tagUnitClassDefinitions The map from shortened tag names to their unit classes.
   * @returns {Map<string, SchemaTag>} The map from lowercase shortened tag names to their tag objects.
   * @private
   */
  _createSchemaTags(booleanAttributeDefinitions, valueAttributeDefinitions, tagUnitClassDefinitions) {
    const tagTakesValueAttribute = this.attributes.get('takesValue')
    const tagEntries = new Map()

    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      if (tagEntries.has(name)) {
        IssueError.generateAndThrow('duplicateTagsInSchema')
      }

      const booleanAttributes = booleanAttributeDefinitions.get(name)
      const unitClasses = tagUnitClassDefinitions.get(name)

      if (booleanAttributes.has(tagTakesValueAttribute)) {
        tagEntries.set(lc(name), new SchemaValueTag(name, booleanAttributes, valueAttributes, unitClasses))
      } else {
        tagEntries.set(lc(name), new SchemaTag(name, booleanAttributes, valueAttributes, unitClasses))
      }
    }

    return tagEntries
  }

  /**
   * Inject special tag fields into the {@link SchemaTag} objects.
   *
   * @param {Map<Object, string>} tags The map from tag elements to tag strings.
   * @param {Map<Object, string>} shortTags The map from tag elements to shortened tag names.
   * @param {Map<string, SchemaTag>} tagEntries The map from shortened tag names to tag objects.
   * @private
   */
  _injectTagFields(tags, shortTags, tagEntries) {
    for (const tagElement of tags.keys()) {
      const tagName = shortTags.get(tagElement)
      const parentTagName = shortTags.get(tagElement.$parent)

      if (parentTagName) {
        tagEntries.get(lc(tagName))._parent = tagEntries.get(lc(parentTagName))
      }

      if (this.getElementTagName(tagElement) === '#') {
        tagEntries.get(lc(parentTagName))._valueTag = tagEntries.get(lc(tagName))
      }
    }
  }

  _parseDefinitions(category) {
    const categoryTagName = category + 'Definition'
    const definitionElements = this.getElementsByName(categoryTagName)

    return this._parseAttributeElements(definitionElements, this.getElementTagName)
  }

  _parseAttributeElements(elements, namer) {
    const booleanAttributeDefinitions = new Map()
    const valueAttributeDefinitions = new Map()

    for (const element of elements) {
      const [booleanAttributes, valueAttributes] = this._parseAttributeElement(element)

      const elementName = namer(element)
      booleanAttributeDefinitions.set(elementName, booleanAttributes)
      valueAttributeDefinitions.set(elementName, valueAttributes)
    }

    return [booleanAttributeDefinitions, valueAttributeDefinitions]
  }

  _parseAttributeElement(element) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    const tagAttributes = element.attribute ?? []

    for (const tagAttribute of tagAttributes) {
      const attributeName = this.getElementTagName(tagAttribute)
      if (tagAttribute.value === undefined) {
        booleanAttributes.add(this.attributes.get(attributeName))
        continue
      }
      const values = tagAttribute.value.map((value) => value._)
      valueAttributes.set(this.attributes.get(attributeName), values)
    }

    return [booleanAttributes, valueAttributes]
  }

  _getRecursiveAttributes() {
    const attributeArray = Array.from(this.attributes.values())
    if (semver.lt(this.rootElement.$.version, '8.3.0')) {
      return attributeArray.filter((attribute) =>
        attribute.roleProperties.has(this.properties.get('isInheritedProperty')),
      )
    } else {
      return attributeArray.filter(
        (attribute) => !attribute.roleProperties.has(this.properties.get('annotationProperty')),
      )
    }
  }

  _addCustomAttributes() {
    // No-op
  }

  _addCustomProperties() {
    // No-op
  }
}

export class HedV8SchemaParser extends Hed3SchemaParser {
  constructor(rootElement) {
    super(rootElement)
    this._versionDefinitions = {
      typeProperties: new Set(['boolProperty']),
      categoryProperties: new Set([
        'elementProperty',
        'nodeProperty',
        'schemaAttributeProperty',
        'unitProperty',
        'unitClassProperty',
        'unitModifierProperty',
        'valueClassProperty',
      ]),
      roleProperties: new Set(['recursiveProperty', 'isInheritedProperty', 'annotationProperty']),
    }
  }

  _addCustomAttributes() {
    const isInheritedProperty = this.properties.get('isInheritedProperty')
    const extensionAllowedAttribute = this.attributes.get('extensionAllowed')
    if (this.rootElement.$.library === undefined && semver.lt(this.rootElement.$.version, '8.2.0')) {
      extensionAllowedAttribute._roleProperties.add(isInheritedProperty)
    }
    const inLibraryAttribute = this.attributes.get('inLibrary')
    if (inLibraryAttribute && semver.lt(this.rootElement.$.version, '8.3.0')) {
      inLibraryAttribute._roleProperties.add(isInheritedProperty)
    }
  }

  _addCustomProperties() {
    if (this.rootElement.$.library === undefined && semver.lt(this.rootElement.$.version, '8.2.0')) {
      const recursiveProperty = new SchemaProperty('isInheritedProperty', 'roleProperty')
      this.properties.set('isInheritedProperty', recursiveProperty)
    }
  }
}

export class Hed3PartneredSchemaMerger {
  /**
   * The source of data to be merged.
   * @type {Hed3Schema}
   */
  source
  /**
   * The destination of data to be merged.
   * @type {Hed3Schema}
   */
  destination

  /**
   * Constructor.
   *
   * @param {Hed3Schema} source The source of data to be merged.
   * @param {Hed3Schema} destination The destination of data to be merged.
   */
  constructor(source, destination) {
    this._validate(source, destination)

    this.source = source
    this.destination = destination
  }

  /**
   * Pre-validate the partnered schemas.
   *
   * @param {Hed3Schema} source The source of data to be merged.
   * @param {Hed3Schema} destination The destination of data to be merged.
   * @private
   */
  _validate(source, destination) {
    if (source.generation < 3 || destination.generation < 3) {
      IssueError.generateAndThrow('internalConsistencyError', { message: 'Partnered schemas must be HED-3G schemas' })
    }

    if (source.withStandard !== destination.withStandard) {
      IssueError.generateAndThrow('differentWithStandard', {
        first: source.withStandard,
        second: destination.withStandard,
      })
    }
  }

  /**
   * The source schema's tag collection.
   *
   * @return {SchemaTagManager}
   */
  get sourceTags() {
    return this.source.entries.tags
  }

  /**
   * The destination schema's tag collection.
   *
   * @return {SchemaTagManager}
   */
  get destinationTags() {
    return this.destination.entries.tags
  }

  /**
   * Merge two lazy partnered schemas.
   *
   * @returns {Hed3Schema} The merged partnered schema, for convenience.
   */
  mergeData() {
    this.mergeTags()
    return this.destination
  }

  /**
   * Merge the tags from two lazy partnered schemas.
   */
  mergeTags() {
    for (const tag of this.sourceTags.values()) {
      this._mergeTag(tag)
    }
  }

  /**
   * Merge a tag from one schema to another.
   *
   * @param {SchemaTag} tag The tag to copy.
   * @private
   */
  _mergeTag(tag) {
    if (!tag.getNamedAttributeValue('inLibrary')) {
      return
    }

    const shortName = tag.name
    if (this.destinationTags.hasEntry(shortName.toLowerCase())) {
      IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: shortName })
    }

    const rootedTagShortName = tag.getNamedAttributeValue('rooted')
    if (rootedTagShortName) {
      const parentTag = tag.parent
      if (parentTag?.name?.toLowerCase() !== rootedTagShortName?.toLowerCase()) {
        IssueError.generateAndThrow('internalError', { message: `Node ${shortName} is improperly rooted.` })
      }
    }

    this._copyTagToSchema(tag)
  }

  /**
   * Copy a tag from one schema to another.
   *
   * @param {SchemaTag} tag The tag to copy.
   * @private
   */
  _copyTagToSchema(tag) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    for (const attribute of tag.booleanAttributes) {
      booleanAttributes.add(this.destination.entries.attributes.getEntry(attribute.name) ?? attribute)
    }
    for (const [key, value] of tag.valueAttributes) {
      valueAttributes.set(this.destination.entries.attributes.getEntry(key.name) ?? key, value)
    }

    /**
     * @type {SchemaUnitClass[]}
     */
    const unitClasses = tag.unitClasses.map(
      (unitClass) => this.destination.entries.unitClasses.getEntry(unitClass.name) ?? unitClass,
    )

    let newTag
    if (tag instanceof SchemaValueTag) {
      newTag = new SchemaValueTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    } else {
      newTag = new SchemaTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    }
    const destinationParentTag = this.destinationTags.getEntry(tag.parent?.name?.toLowerCase())
    if (destinationParentTag) {
      newTag._parent = destinationParentTag
      if (newTag instanceof SchemaValueTag) {
        newTag.parent._valueTag = newTag
      }
    }

    this.destinationTags._definitions.set(newTag.name.toLowerCase(), newTag)
    this.destinationTags._definitionsByLongName.set(newTag.longName.toLowerCase(), newTag)
  }
}

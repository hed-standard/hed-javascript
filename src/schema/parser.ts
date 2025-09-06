import flattenDeep from 'lodash/flattenDeep'
import zip from 'lodash/zip'
import semver from 'semver'

import {
  SchemaAttribute,
  SchemaEntries,
  SchemaEntryManager,
  SchemaProperty,
  SchemaTag,
  SchemaUnit,
  SchemaUnitClass,
  SchemaUnitModifier,
  SchemaValueClass,
  SchemaValueTag,
} from './entries'
import { IssueError } from '../issues/issues'

import { DefinitionElement, HedSchemaRootElement, NamedElement, NodeElement } from './xmlType'

interface ClassRegex {
  char_regex: {
    [key: string]: string
  }
  class_chars: {
    [key: string]: string[]
  }
  class_words: {
    [key: string]: string
  }
}

import * as _classRegex from '../data/json/classRegex.json'
const classRegex: ClassRegex = _classRegex

const lc = (str: string) => str.toLowerCase()

export default class SchemaParser {
  /**
   * The root XML element.
   */
  rootElement: HedSchemaRootElement

  properties: Map<string, SchemaProperty>

  attributes: Map<string, SchemaAttribute>

  /**
   * The schema's value classes.
   */
  valueClasses: SchemaEntryManager<SchemaValueClass>

  /**
   * The schema's unit classes.
   */
  unitClasses: SchemaEntryManager<SchemaUnitClass>

  /**
   * The schema's unit modifiers.
   */
  unitModifiers: SchemaEntryManager<SchemaUnitModifier>

  /**
   * The schema's tags.
   */
  tags: SchemaEntryManager<SchemaTag>

  /**
   * Version-specific definitions.
   */
  private readonly _versionDefinitions: {
    typeProperties: Set<string>
    categoryProperties: Set<string>
    roleProperties: Set<string>
  }

  /**
   * Constructor.
   *
   * @param {Object} rootElement The root XML element.
   */
  constructor(rootElement: HedSchemaRootElement) {
    this.rootElement = rootElement
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

  public parse(): SchemaEntries {
    this.populateDictionaries()
    return new SchemaEntries(this)
  }

  private populateDictionaries(): void {
    this.parseProperties()
    this.parseAttributes()
    this.parseUnitModifiers()
    this.parseUnitClasses()
    this.parseValueClasses()
    this.parseTags()
  }

  private getAllChildTags(parentElement: NodeElement, excludeTakeValueTags = true): NodeElement[] {
    if (excludeTakeValueTags && SchemaParser.getElementTagName(parentElement) === '#') {
      return []
    }
    const childTags = [parentElement]
    const tagElementChildren = parentElement.node ?? []
    return childTags.concat(
      flattenDeep(tagElementChildren.map((child) => this.getAllChildTags(child, excludeTakeValueTags))),
    )
  }

  private static getParentTagName(tagElement: NodeElement): string {
    const parentTagElement = tagElement.$parent
    if (parentTagElement?.$parent) {
      return SchemaParser.getElementTagName(parentTagElement)
    } else {
      return ''
    }
  }

  /**
   * Extract the name of an XML element.
   *
   * @param element An XML element.
   * @returns The name of the element.
   */
  private static getElementTagName(element: NamedElement): string {
    return element.name._
  }

  /**
   * Retrieve all the tags in the schema.
   *
   * @returns The tag names and XML elements.
   */
  private getAllTags(): Map<NodeElement, string> {
    const nodeRoot = this.rootElement.schema
    const tagElements = []
    const tagElementChildren = nodeRoot.node
    tagElements.push(...flattenDeep(tagElementChildren.map((child) => this.getAllChildTags(child, false))))
    const tags = tagElements.map((element) => SchemaParser.getElementTagName(element))
    return new Map(zip(tagElements, tags))
  }

  private parseProperties(): void {
    const propertyDefinitions = this.rootElement.propertyDefinitions.propertyDefinition
    this.properties = new Map<string, SchemaProperty>()
    for (const definition of propertyDefinitions) {
      const propertyName = SchemaParser.getElementTagName(definition)
      this.properties.set(propertyName, new SchemaProperty(propertyName))
    }
    this._addCustomProperties()
  }

  private parseAttributes(): void {
    const attributeDefinitions = this.rootElement.schemaAttributeDefinitions.schemaAttributeDefinition
    this.attributes = new Map<string, SchemaAttribute>()
    for (const definition of attributeDefinitions) {
      const attributeName = SchemaParser.getElementTagName(definition)
      const propertyElements = definition.property ?? []
      const properties = propertyElements.map((element) => this.properties.get(SchemaParser.getElementTagName(element)))
      this.attributes.set(attributeName, new SchemaAttribute(attributeName, new Set(properties)))
    }
    this._addCustomAttributes()
  }

  private _getValueClassChars(name: string): RegExp {
    let classChars
    if (Array.isArray(classRegex.class_chars[name]) && classRegex.class_chars[name].length > 0) {
      classChars =
        '^(?:' + classRegex.class_chars[name].map((charClass) => classRegex.char_regex[charClass]).join('|') + ')+$'
    } else {
      classChars = '^.+$' // Any non-empty line or string.
    }
    return new RegExp(classChars)
  }

  private parseValueClasses(): void {
    const valueClasses = new Map<string, SchemaValueClass>()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions(
      this.rootElement.valueClassDefinitions.valueClassDefinition,
    )
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      const charRegex = this._getValueClassChars(name)
      const wordRegex = new RegExp(classRegex.class_words[name] ?? '^.+$')
      valueClasses.set(name, new SchemaValueClass(name, booleanAttributes, valueAttributes, charRegex, wordRegex))
    }
    this.valueClasses = new SchemaEntryManager(valueClasses)
  }

  private parseUnitModifiers(): void {
    const unitModifiers = new Map<string, SchemaUnitModifier>()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions(
      this.rootElement.unitModifierDefinitions.unitModifierDefinition,
    )
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitModifiers.set(name, new SchemaUnitModifier(name, booleanAttributes, valueAttributes))
    }
    this.unitModifiers = new SchemaEntryManager(unitModifiers)
  }

  private parseUnitClasses(): void {
    const unitClasses = new Map<string, SchemaUnitClass>()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions(
      this.rootElement.unitClassDefinitions.unitClassDefinition,
    )
    const unitClassUnits = this.parseUnits()

    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitClasses.set(name, new SchemaUnitClass(name, booleanAttributes, valueAttributes, unitClassUnits.get(name)))
    }
    this.unitClasses = new SchemaEntryManager(unitClasses)
  }

  private parseUnits(): Map<string, Map<string, SchemaUnit>> {
    const unitClassUnits = new Map<string, Map<string, SchemaUnit>>()
    const unitClassElements = this.rootElement.unitClassDefinitions.unitClassDefinition
    const unitModifiers = this.unitModifiers
    for (const element of unitClassElements) {
      const elementName = SchemaParser.getElementTagName(element)
      const units = new Map<string, SchemaUnit>()
      unitClassUnits.set(elementName, units)
      if (element.unit === undefined) {
        continue
      }
      const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions] = this._parseAttributeElements(
        element.unit,
        SchemaParser.getElementTagName,
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
  private parseTags(): void {
    const tags = this.getAllTags()
    const shortTags = this._getShortTags(tags)
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseAttributeElements(
      tags.keys(),
      (element: NodeElement) => shortTags.get(element),
    )

    const tagUnitClassDefinitions = this._processTagUnitClasses(shortTags, valueAttributeDefinitions)
    const tagValueClassDefinitions = this._processTagValueClasses(shortTags, valueAttributeDefinitions)
    this._processRecursiveAttributes(shortTags, booleanAttributeDefinitions)

    const tagEntries = this._createSchemaTags(
      booleanAttributeDefinitions,
      valueAttributeDefinitions,
      tagUnitClassDefinitions,
      tagValueClassDefinitions,
    )

    this._injectTagFields(tags, shortTags, tagEntries)

    this.tags = new SchemaEntryManager(tagEntries)
  }

  /**
   * Generate the map from tag elements to shortened tag names.
   *
   * @param tags The map from tag elements to tag strings.
   * @returns The map from tag elements to shortened tag names.
   */
  private _getShortTags(tags: Map<NodeElement, string>): Map<NodeElement, string> {
    const shortTags = new Map<NodeElement, string>()
    for (const tagElement of tags.keys()) {
      const shortKey =
        SchemaParser.getElementTagName(tagElement) === '#'
          ? SchemaParser.getParentTagName(tagElement) + '-#'
          : SchemaParser.getElementTagName(tagElement)
      shortTags.set(tagElement, shortKey)
    }
    return shortTags
  }

  /**
   * Process unit classes in tags.
   *
   * @param shortTags The map from tag elements to shortened tag names.
   * @param valueAttributeDefinitions The map from shortened tag names to their value schema attributes.
   * @returns The map from shortened tag names to their unit classes.
   */
  private _processTagUnitClasses(
    shortTags: Map<NodeElement, string>,
    valueAttributeDefinitions: Map<string, Map<SchemaAttribute, string[]>>,
  ): Map<string, SchemaUnitClass[]> {
    const tagUnitClassAttribute = this.attributes.get('unitClass')
    const tagUnitClassDefinitions = new Map<string, SchemaUnitClass[]>()

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
   * Process value classes in tags.
   *
   * @param shortTags The map from tag elements to shortened tag names.
   * @param valueAttributeDefinitions The map from shortened tag names to their value schema attributes.
   * @returns The map from shortened tag names to their value classes.
   */
  private _processTagValueClasses(
    shortTags: Map<NodeElement, string>,
    valueAttributeDefinitions: Map<string, Map<SchemaAttribute, string[]>>,
  ): Map<string, SchemaValueClass[]> {
    const tagValueClassAttribute = this.attributes.get('valueClass')
    const tagValueClassDefinitions = new Map<string, SchemaValueClass[]>()

    for (const tagName of shortTags.values()) {
      const valueAttributes = valueAttributeDefinitions.get(tagName)
      if (valueAttributes.has(tagValueClassAttribute)) {
        tagValueClassDefinitions.set(
          tagName,
          valueAttributes.get(tagValueClassAttribute).map((valueClassName) => {
            return this.valueClasses.getEntry(valueClassName)
          }),
        )
        // TODO: Uncomment once value validation uses value classes.
        // valueAttributes.delete(tagValueClassAttribute)
      }
    }

    return tagValueClassDefinitions
  }

  /**
   * Process recursive schema attributes.
   *
   * @param shortTags The map from tag elements to shortened tag names.
   * @param booleanAttributeDefinitions The map from shortened tag names to their boolean schema attributes. Passed by reference.
   */
  private _processRecursiveAttributes(
    shortTags: Map<NodeElement, string>,
    booleanAttributeDefinitions: Map<string, Set<SchemaAttribute>>,
  ): void {
    const recursiveAttributeMap = this._generateRecursiveAttributeMap(shortTags, booleanAttributeDefinitions)

    for (const [tagElement, recursiveAttributes] of recursiveAttributeMap) {
      for (const childTag of this.getAllChildTags(tagElement)) {
        const childTagName = SchemaParser.getElementTagName(childTag)
        const newBooleanAttributes = booleanAttributeDefinitions.get(childTagName)?.union(recursiveAttributes)
        booleanAttributeDefinitions.set(childTagName, newBooleanAttributes)
      }
    }
  }

  /**
   * Generate a map from tags to their recursive attributes.
   *
   * @param shortTags The map from tag elements to shortened tag names.
   * @param booleanAttributeDefinitions The map from shortened tag names to their boolean schema attributes. Passed by reference.
   */
  private _generateRecursiveAttributeMap(
    shortTags: Map<NodeElement, string>,
    booleanAttributeDefinitions: Map<string, Set<SchemaAttribute>>,
  ): Map<NodeElement, Set<SchemaAttribute>> {
    const recursiveAttributes = this._getRecursiveAttributes()
    const recursiveAttributeMap = new Map<NodeElement, Set<SchemaAttribute>>()

    for (const [tagElement, tagName] of shortTags) {
      recursiveAttributeMap.set(tagElement, booleanAttributeDefinitions.get(tagName)?.intersection(recursiveAttributes))
    }

    return recursiveAttributeMap
  }

  private _getRecursiveAttributes(): Set<SchemaAttribute> {
    const attributeArray = Array.from(this.attributes.values())
    let filteredAttributeArray

    if (semver.lt(this.rootElement.$.version, '8.3.0')) {
      filteredAttributeArray = attributeArray.filter((attribute) =>
        attribute.properties.has(this.properties.get('isInheritedProperty')),
      )
    } else {
      filteredAttributeArray = attributeArray.filter(
        (attribute) => !attribute.properties.has(this.properties.get('annotationProperty')),
      )
    }

    return new Set(filteredAttributeArray)
  }

  /**
   * Create the {@link SchemaTag} objects.
   *
   * @param booleanAttributeDefinitions The map from shortened tag names to their boolean schema attributes.
   * @param valueAttributeDefinitions The map from shortened tag names to their value schema attributes.
   * @param tagUnitClassDefinitions The map from shortened tag names to their unit classes.
   * @param tagValueClassDefinitions The map from shortened tag names to their value classes.
   * @returns The map from lowercase shortened tag names to their tag objects.
   */
  private _createSchemaTags(
    booleanAttributeDefinitions: Map<string, Set<SchemaAttribute>>,
    valueAttributeDefinitions: Map<string, Map<SchemaAttribute, string[]>>,
    tagUnitClassDefinitions: Map<string, SchemaUnitClass[]>,
    tagValueClassDefinitions: Map<string, SchemaValueClass[]>,
  ): Map<string, SchemaTag> {
    const tagTakesValueAttribute = this.attributes.get('takesValue')
    const tagEntries = new Map<string, SchemaTag>()

    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      if (tagEntries.has(name)) {
        IssueError.generateAndThrow('duplicateTagsInSchema')
      }

      const booleanAttributes = booleanAttributeDefinitions.get(name)
      const unitClasses = tagUnitClassDefinitions.get(name)
      const valueClasses = tagValueClassDefinitions.get(name)

      if (booleanAttributes.has(tagTakesValueAttribute)) {
        tagEntries.set(
          lc(name),
          new SchemaValueTag(name, booleanAttributes, valueAttributes, unitClasses, valueClasses),
        )
      } else {
        tagEntries.set(lc(name), new SchemaTag(name, booleanAttributes, valueAttributes, unitClasses, valueClasses))
      }
    }

    return tagEntries
  }

  /**
   * Inject special tag fields into the {@link SchemaTag} objects.
   *
   * @param tags The map from tag elements to tag strings.
   * @param shortTags The map from tag elements to shortened tag names.
   * @param tagEntries The map from shortened tag names to tag objects.
   */
  private _injectTagFields(
    tags: Map<NodeElement, string>,
    shortTags: Map<NodeElement, string>,
    tagEntries: Map<string, SchemaTag>,
  ): void {
    for (const tagElement of tags.keys()) {
      const tagName = shortTags.get(tagElement)
      const parentTagName = shortTags.get(tagElement.$parent)

      if (parentTagName) {
        tagEntries.get(lc(tagName)).parent = tagEntries.get(lc(parentTagName))
      }

      if (SchemaParser.getElementTagName(tagElement) === '#') {
        tagEntries.get(lc(parentTagName)).valueTag = tagEntries.get(lc(tagName))
      }
    }
  }

  private _parseDefinitions(
    definitionElements: Iterable<DefinitionElement>,
  ): [Map<string, Set<SchemaAttribute>>, Map<string, Map<SchemaAttribute, string[]>>] {
    return this._parseAttributeElements(definitionElements, SchemaParser.getElementTagName)
  }

  private _parseAttributeElements(
    elements: Iterable<DefinitionElement>,
    namer: (element: NamedElement) => string,
  ): [Map<string, Set<SchemaAttribute>>, Map<string, Map<SchemaAttribute, string[]>>] {
    const booleanAttributeDefinitions = new Map<string, Set<SchemaAttribute>>()
    const valueAttributeDefinitions = new Map<string, Map<SchemaAttribute, string[]>>()

    for (const element of elements) {
      const [booleanAttributes, valueAttributes] = this._parseAttributeElement(element)

      const elementName = namer(element)
      booleanAttributeDefinitions.set(elementName, booleanAttributes)
      valueAttributeDefinitions.set(elementName, valueAttributes)
    }

    return [booleanAttributeDefinitions, valueAttributeDefinitions]
  }

  private _parseAttributeElement(element: DefinitionElement): [Set<SchemaAttribute>, Map<SchemaAttribute, string[]>] {
    const booleanAttributes = new Set<SchemaAttribute>()
    const valueAttributes = new Map<SchemaAttribute, string[]>()

    const tagAttributes = element.attribute ?? []

    for (const tagAttribute of tagAttributes) {
      const attributeName = SchemaParser.getElementTagName(tagAttribute)
      if (tagAttribute.value === undefined) {
        booleanAttributes.add(this.attributes.get(attributeName))
        continue
      }
      const values = tagAttribute.value.map((value) => value._.toString())
      valueAttributes.set(this.attributes.get(attributeName), values)
    }

    return [booleanAttributes, valueAttributes]
  }

  private _addCustomAttributes(): void {
    const isInheritedProperty = this.properties.get('isInheritedProperty')
    const extensionAllowedAttribute = this.attributes.get('extensionAllowed')
    if (this.rootElement.$.library === undefined && semver.lt(this.rootElement.$.version, '8.2.0')) {
      extensionAllowedAttribute._properties.add(isInheritedProperty)
    }
    const inLibraryAttribute = this.attributes.get('inLibrary')
    if (inLibraryAttribute && semver.lt(this.rootElement.$.version, '8.3.0')) {
      inLibraryAttribute._properties.add(isInheritedProperty)
    }
  }

  private _addCustomProperties(): void {
    if (this.rootElement.$.library === undefined && semver.lt(this.rootElement.$.version, '8.2.0')) {
      const recursiveProperty = new SchemaProperty('isInheritedProperty')
      this.properties.set('isInheritedProperty', recursiveProperty)
    }
  }
}

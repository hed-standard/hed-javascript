/** This module holds the classes for populating a schema from XML.
 *
 * The schemas of a merge group are merged while they are parsed: each entry-type parser runs over every schema of
 * the group's {@link SchemaXmlCollection} and writes into one map. An element declared by more than one schema is
 * kept once; a later declaration is accepted only if it is equivalent to the first (specification 3.1.2.4).
 *
 * @module schema/parser
 */
import Set from 'core-js-pure/actual/set'
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

import { characterSets } from './characterSets'

const lc = (str) => str.toLowerCase()

/**
 * Extract the name of an XML element.
 *
 * @param {Object} element An XML element.
 * @returns {string} The name of the element.
 */
export function getElementName(element) {
  return element.name._
}

/**
 * Extract the description of an XML element.
 *
 * @param {Object} element An XML element.
 * @returns {string|undefined} The description, or undefined if the element has none.
 */
export function getElementDescription(element) {
  return element.description?._
}

/**
 * Retrieve the definition elements of a category in one schema.
 *
 * @param {Object} rootElement The root XML element of the schema.
 * @param {string} category The definition category (e.g. "unitClass").
 * @returns {Object[]} The definition elements.
 */
function getDefinitionElements(rootElement, category) {
  const categoryTagName = category + 'Definition'
  const categoryParentTagName = categoryTagName + 's'
  // An empty section (<propertyDefinitions/> in an unpartnered library) has no definition elements, and a
  // section with a single definition is parsed as an object rather than an array.
  const definitions = rootElement[categoryParentTagName]?.[categoryTagName]
  if (definitions === undefined || definitions === null) {
    return []
  }
  return (Array.isArray(definitions) ? definitions : [definitions]).filter((element) => typeof element === 'object')
}

/**
 * A parser for one entry type, run over every schema of a merge group.
 *
 * @template T
 */
class SchemaEntryParser {
  /**
   * The XML data of the merge group.
   * @type {SchemaXmlCollection}
   */
  xmlCollection

  /**
   * The entries parsed so far, keyed by name.
   * @type {Map<string, T>}
   */
  entryTypeMap

  /**
   * Constructor.
   *
   * @param {SchemaXmlCollection} xmlCollection The XML data of the merge group.
   */
  constructor(xmlCollection) {
    this.xmlCollection = xmlCollection
    this.entryTypeMap = new Map()
  }

  /**
   * Parse this entry type across every schema of the merge group.
   *
   * @returns {SchemaEntryManager<T>} The manager of the merged entries.
   * @throws {IssueError} If two schemas declare an element incompatibly.
   */
  parse() {
    this._preprocessSchemas()
    for (const xmlData of this.xmlCollection) {
      this._parseSchema(xmlData.HED)
    }
    this._addCustomEntries()
    return new SchemaEntryManager(this.entryTypeMap)
  }

  /**
   * Add an entry, keeping an existing declaration of the same name if the new one is equivalent to it.
   *
   * @param {string} name The entry name.
   * @param {T} entry The new entry.
   * @throws {IssueError} If an entry of that name exists and is not equivalent.
   */
  addEntry(name, entry) {
    const existing = this.entryTypeMap.get(name)
    if (existing === undefined) {
      this.entryTypeMap.set(name, entry)
    } else if (!entry.equivalent(existing)) {
      IssueError.generateAndThrow('lazyPartneredSchemasShareEntry', { entryName: name })
    }
  }

  /**
   * Prepare data that spans every schema before the schemas are parsed one by one.
   * @protected
   */
  _preprocessSchemas() {}

  /**
   * Parse this entry type in one schema.
   *
   * @param {Object} rootElement The root XML element of the schema.
   * @abstract
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  _parseSchema(rootElement) {
    IssueError.generateAndThrowInternalError('SchemaEntryParser._parseSchema must be overridden.')
  }

  /**
   * Add entries the platform needs to support old schema versions.
   * @protected
   */
  _addCustomEntries() {}
}

/**
 * A parser for schema properties.
 */
class PropertyParser extends SchemaEntryParser {
  /**
   * The property names of each type that this version of the parser models.
   * @type {Object<string, Set<string>>}
   */
  static PROPERTY_TYPES = {
    typeProperty: new Set(['boolProperty']),
    categoryProperty: new Set([
      'elementProperty',
      'nodeProperty',
      'schemaAttributeProperty',
      'unitProperty',
      'unitClassProperty',
      'unitModifierProperty',
      'valueClassProperty',
    ]),
    roleProperty: new Set(['recursiveProperty', 'isInheritedProperty', 'annotationProperty']),
  }

  _parseSchema(rootElement) {
    for (const definition of getDefinitionElements(rootElement, 'property')) {
      const name = getElementName(definition)
      const propertyType = Object.keys(PropertyParser.PROPERTY_TYPES).find((type) =>
        PropertyParser.PROPERTY_TYPES[type].has(name),
      )
      if (propertyType !== undefined) {
        this.addEntry(name, new SchemaProperty(name, getElementDescription(definition), propertyType))
      }
    }
  }

  /**
   * Standard schemas before 8.2.0 have no isInheritedProperty; the attribute parser needs it.
   * @protected
   */
  _addCustomEntries() {
    const version = this.xmlCollection.standardVersion
    if (version && semver.lt(version, '8.2.0')) {
      this.addEntry('isInheritedProperty', new SchemaProperty('isInheritedProperty', undefined, 'roleProperty'))
    }
  }
}

/**
 * A parser for schema attributes.
 */
class AttributeParser extends SchemaEntryParser {
  /**
   * The schema properties.
   * @type {SchemaEntryManager<SchemaProperty>}
   */
  properties

  /**
   * Constructor.
   *
   * @param {SchemaXmlCollection} xmlCollection The XML data of the merge group.
   * @param {SchemaEntryManager<SchemaProperty>} properties The parsed schema properties.
   */
  constructor(xmlCollection, properties) {
    super(xmlCollection)
    this.properties = properties
  }

  _parseSchema(rootElement) {
    for (const definition of getDefinitionElements(rootElement, 'schemaAttribute')) {
      const name = getElementName(definition)
      // A property with a value (inLibrary) marks the library that declares the attribute; the others are the
      // attribute's own properties. Properties this parser does not model are kept by name only.
      const propertyNames = (definition.property ?? [])
        .filter((element) => element.value === undefined)
        .map(getElementName)
      const properties = propertyNames.map((propertyName) => this.properties.getEntry(propertyName))
      this.addEntry(name, new SchemaAttribute(name, getElementDescription(definition), properties, propertyNames))
    }
  }

  /**
   * Mark attributes as inherited where old standard schemas leave it implicit.
   * @protected
   */
  _addCustomEntries() {
    const version = this.xmlCollection.standardVersion
    if (!version) {
      return
    }
    const isInheritedProperty = this.properties.getEntry('isInheritedProperty')
    if (isInheritedProperty === undefined) {
      return
    }
    if (semver.lt(version, '8.2.0')) {
      this.entryTypeMap.get('extensionAllowed')?._roleProperties.add(isInheritedProperty)
    }
    if (semver.lt(version, '8.3.0')) {
      this.entryTypeMap.get('inLibrary')?._roleProperties.add(isInheritedProperty)
    }
  }
}

/**
 * A parser for entries that carry schema attributes.
 *
 * @template T
 */
class SchemaEntryWithAttributesParser extends SchemaEntryParser {
  /**
   * The schema attributes.
   * @type {SchemaEntryManager<SchemaAttribute>}
   */
  attributes

  /**
   * Constructor.
   *
   * @param {SchemaXmlCollection} xmlCollection The XML data of the merge group.
   * @param {SchemaEntryManager<SchemaAttribute>} attributes The parsed schema attributes.
   */
  constructor(xmlCollection, attributes) {
    super(xmlCollection)
    this.attributes = attributes
  }

  /**
   * Parse the attributes and descriptions of a list of elements.
   *
   * @param {Iterable<Object>} elements The XML elements.
   * @param {function(Object): string} namer A function giving the name of an element.
   * @returns {[Map<string, Set<SchemaAttribute>>, Map<string, Map<SchemaAttribute, string[]>>, Map<string, string|undefined>]}
   *     The boolean attributes, value attributes, and descriptions of the elements, keyed by name.
   * @protected
   */
  _parseAttributeElements(elements, namer) {
    const booleanAttributeDefinitions = new Map()
    const valueAttributeDefinitions = new Map()
    const descriptions = new Map()
    for (const element of elements) {
      const [booleanAttributes, valueAttributes] = this._parseAttributeElement(element)
      const elementName = namer(element)
      booleanAttributeDefinitions.set(elementName, booleanAttributes)
      valueAttributeDefinitions.set(elementName, valueAttributes)
      descriptions.set(elementName, getElementDescription(element))
    }
    return [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions]
  }

  /**
   * Give the elements of an unmerged library schema the inLibrary attribute that its merged file carries.
   *
   * An unmerged file holds only its library's elements, except that it may name an element of an earlier schema
   * of the group again to extend it (a partner unit class it adds units to); such an element keeps its declarer.
   *
   * @param {Object} rootElement The root XML element of the schema being parsed.
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by name,
   *     modified in place.
   * @param {function(string): boolean} isDeclared Whether an earlier schema of the group declared the named element.
   * @protected
   */
  _addInLibrary(rootElement, valueAttributeDefinitions, isDeclared) {
    const library = rootElement.$?.library
    const inLibrary = this.attributes.getEntry('inLibrary')
    if (rootElement.$?.unmerged === undefined || library === undefined || inLibrary === undefined) {
      return
    }
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      if (!isDeclared(name) && !valueAttributes.has(inLibrary)) {
        valueAttributes.set(inLibrary, [library])
      }
    }
  }

  /**
   * Parse the attributes of one element.
   *
   * @param {Object} element The XML element.
   * @returns {[Set<SchemaAttribute>, Map<SchemaAttribute, string[]>]} The boolean and value attributes.
   * @private
   */
  _parseAttributeElement(element) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()
    for (const attributeElement of element.attribute ?? []) {
      const attributeName = getElementName(attributeElement)
      const attribute = this.attributes.getEntry(attributeName)
      if (attribute === undefined) {
        IssueError.generateAndThrowInternalError(`Schema attribute "${attributeName}" is used but not defined.`)
      }
      if (attributeElement.value === undefined) {
        booleanAttributes.add(attribute)
      } else {
        valueAttributes.set(
          attribute,
          attributeElement.value.map((value) => value._),
        )
      }
    }
    return [booleanAttributes, valueAttributes]
  }
}

/**
 * A parser for the entries of a definition section (unit modifiers, unit classes, value classes).
 *
 * @template T
 */
class SchemaDefinitionEntryParser extends SchemaEntryWithAttributesParser {
  /**
   * The definition category (e.g. "unitClass").
   * @type {string}
   * @abstract
   */
  category

  _parseSchema(rootElement) {
    const definitions = getDefinitionElements(rootElement, this.category)
    const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseAttributeElements(
      definitions,
      getElementName,
    )
    this._addInLibrary(rootElement, valueAttributeDefinitions, (name) => this.entryTypeMap.has(name))
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      this.addEntry(name, this._buildEntry(name, descriptions.get(name), booleanAttributes, valueAttributes))
    }
  }

  /**
   * Build one entry.
   *
   * @param {string} name The entry name.
   * @param {string|undefined} description The entry description.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The value attributes.
   * @returns {T} The entry.
   * @abstract
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    IssueError.generateAndThrowInternalError('SchemaDefinitionEntryParser._buildEntry must be overridden.')
  }
}

/**
 * A parser for unit modifiers.
 */
class UnitModifierParser extends SchemaDefinitionEntryParser {
  category = 'unitModifier'

  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    return new SchemaUnitModifier(name, description, booleanAttributes, valueAttributes)
  }
}

/**
 * A parser for unit classes and their units.
 *
 * The units of every schema are collected before the unit classes are built, so a unit class declared by several
 * schemas is built once with the units of all of them, and every unit is built against the merged unit modifiers.
 */
class UnitClassParser extends SchemaDefinitionEntryParser {
  category = 'unitClass'

  /**
   * The unit modifiers.
   * @type {SchemaEntryManager<SchemaUnitModifier>}
   */
  unitModifiers

  /**
   * The units of each unit class, keyed by unit class name and then by unit name.
   * @type {Map<string, Map<string, SchemaUnit>>}
   */
  unitClassesUnits

  /**
   * Constructor.
   *
   * @param {SchemaXmlCollection} xmlCollection The XML data of the merge group.
   * @param {SchemaEntryManager<SchemaAttribute>} attributes The parsed schema attributes.
   * @param {SchemaEntryManager<SchemaUnitModifier>} unitModifiers The parsed unit modifiers.
   */
  constructor(xmlCollection, attributes, unitModifiers) {
    super(xmlCollection, attributes)
    this.unitModifiers = unitModifiers
  }

  _preprocessSchemas() {
    this.unitClassesUnits = new Map()
    for (const xmlData of this.xmlCollection) {
      this._parseUnits(xmlData.HED)
    }
  }

  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    return new SchemaUnitClass(
      name,
      description,
      booleanAttributes,
      valueAttributes,
      this.unitClassesUnits.get(name) ?? new Map(),
    )
  }

  /**
   * Parse the units of one schema.
   *
   * @param {Object} rootElement The root XML element of the schema.
   * @private
   */
  _parseUnits(rootElement) {
    for (const element of getDefinitionElements(rootElement, this.category)) {
      const unitClassName = getElementName(element)
      if (!this.unitClassesUnits.has(unitClassName)) {
        this.unitClassesUnits.set(unitClassName, new Map())
      }
      const units = this.unitClassesUnits.get(unitClassName)
      const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseAttributeElements(
        element.unit ?? [],
        getElementName,
      )
      this._addInLibrary(rootElement, valueAttributeDefinitions, (name) => units.has(name))
      for (const [name, valueAttributes] of valueAttributeDefinitions) {
        const unit = new SchemaUnit(
          name,
          descriptions.get(name),
          booleanAttributeDefinitions.get(name),
          valueAttributes,
          this.unitModifiers,
        )
        const existing = units.get(name)
        if (existing === undefined) {
          units.set(name, unit)
        } else if (!unit.equivalent(existing)) {
          IssueError.generateAndThrow('lazyPartneredSchemasShareEntry', { entryName: name })
        }
      }
    }
  }
}

/**
 * A parser for value classes.
 */
class ValueClassParser extends SchemaDefinitionEntryParser {
  category = 'valueClass'

  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    const allowedNames = this._allowedNames(name, valueAttributes)
    return new SchemaValueClass(name, description, booleanAttributes, valueAttributes, allowedNames)
  }

  /**
   * The character set names that define the characters of a value class (character_sets.json).
   *
   * From standard schema 8.5.0, and in libraries partnered with 8.5.0 or later, the class's own allowedCharacter
   * declaration defines it, provided every name is a set, an alias, or a single character. Before that the
   * file's value_class_defaults for the standard version define the standard classes, because their released
   * declarations are incomplete. A class the file has no defaults for (a library's own class) always follows its
   * declaration. This is hed-python's CharRexValidator.allowed_names.
   *
   * @param {string} name The value class name.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The class's value attributes.
   * @returns {string[]} The names; empty when nothing constrains the characters.
   * @private
   */
  _allowedNames(name, valueAttributes) {
    const standardVersion = this.xmlCollection.standardVersion || null
    const declarationWins = standardVersion !== null && !semver.lt(standardVersion, characterSets.declarationWinsFrom)
    const defaults = characterSets.defaultsFor(name, standardVersion)
    const allowedCharacter = this.attributes.getEntry('allowedCharacter')
    const declared = (valueAttributes.get(allowedCharacter) ?? [])
      .flatMap((value) => String(value).split(','))
      .map((value) => value.trim())
      .filter((value) => value !== '')
    if (declared.length > 0 && (declarationWins || defaults.length === 0)) {
      if (declared.every((declaredName) => characterSets.isKnownName(declaredName))) {
        return declared
      }
    }
    return defaults
  }
}

/**
 * A parser for tags.
 */
class TagParser extends SchemaEntryWithAttributesParser {
  /**
   * The unit classes.
   * @type {SchemaEntryManager<SchemaUnitClass>}
   */
  unitClasses

  /**
   * The value classes.
   * @type {SchemaEntryManager<SchemaValueClass>}
   */
  valueClasses

  /**
   * The tags of the schema being parsed, keyed by lowercase short name.
   * @type {Map<string, SchemaTag>}
   */
  schemaTags

  /**
   * Constructor.
   *
   * @param {SchemaXmlCollection} xmlCollection The XML data of the merge group.
   * @param {SchemaEntryManager<SchemaAttribute>} attributes The parsed schema attributes.
   * @param {SchemaEntryManager<SchemaUnitClass>} unitClasses The parsed unit classes.
   * @param {SchemaEntryManager<SchemaValueClass>} valueClasses The parsed value classes.
   */
  constructor(xmlCollection, attributes, unitClasses, valueClasses) {
    super(xmlCollection, attributes)
    this.unitClasses = unitClasses
    this.valueClasses = valueClasses
  }

  _parseSchema(rootElement) {
    const tags = TagParser._getAllTags(rootElement)
    const shortTags = TagParser._getShortTags(tags)
    const parentMap = TagParser._generateParentMap(shortTags)
    const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseAttributeElements(
      tags.keys(),
      (element) => shortTags.get(element),
    )
    // A library never extends a tag of its partner by naming it again, so every tag of an unmerged file is marked;
    // one that redeclares a partner tag is then rejected as in the merged form (addEntry).
    this._addInLibrary(rootElement, valueAttributeDefinitions, () => false)
    this._processRootedTags(parentMap, valueAttributeDefinitions)
    const tagUnitClassDefinitions = this._processTagClasses(valueAttributeDefinitions, 'unitClass', this.unitClasses)
    const tagValueClassDefinitions = this._processTagClasses(
      valueAttributeDefinitions,
      'valueClass',
      this.valueClasses,
      false,
    )
    this._processRecursiveAttributes(parentMap, booleanAttributeDefinitions)
    this._createSchemaTags(
      booleanAttributeDefinitions,
      valueAttributeDefinitions,
      descriptions,
      tagUnitClassDefinitions,
      tagValueClassDefinitions,
      parentMap,
    )
    this._mergeSchemaTags()
  }

  /**
   * Retrieve all the tags of a schema.
   *
   * @param {Object} rootElement The root XML element of the schema.
   * @returns {Map<Object, string>} The tag elements and their names, in document order.
   * @private
   */
  static _getAllTags(rootElement) {
    const tagElements = TagParser._getAllChildTags(rootElement.schema, false)
    const tags = tagElements.map(getElementName)
    return new Map(zip(tagElements, tags))
  }

  /**
   * Retrieve an element and its descendant tags, in document order.
   *
   * @param {Object} parentElement The element.
   * @param {boolean} excludeTakeValueTags Whether to leave out "#" elements and their descendants.
   * @returns {Object[]} The elements.
   * @private
   */
  static _getAllChildTags(parentElement, excludeTakeValueTags = true) {
    if (excludeTakeValueTags && getElementName(parentElement) === '#') {
      return []
    }
    const childTags = []
    if (parentElement.$parent) {
      childTags.push(parentElement)
    }
    const tagElementChildren = parentElement.node ?? []
    childTags.push(
      ...flattenDeep(tagElementChildren.map((child) => TagParser._getAllChildTags(child, excludeTakeValueTags))),
    )
    return childTags
  }

  /**
   * Whether a tag element has a parent tag (as opposed to sitting at the top level of the schema).
   *
   * @param {Object} tagElement The tag element.
   * @returns {boolean}
   * @private
   */
  static _hasParentTag(tagElement) {
    return Boolean(tagElement.$parent?.$parent)
  }

  /**
   * Generate the map from tag elements to short names ("Parent-#" for a "#" child).
   *
   * @param {Map<Object, string>} tags The tag elements and their names.
   * @returns {Map<Object, string>} The tag elements and their short names.
   * @private
   */
  static _getShortTags(tags) {
    const shortTags = new Map()
    for (const [tagElement, name] of tags) {
      const shortKey = name === '#' ? getElementName(tagElement.$parent) + '-#' : name
      shortTags.set(tagElement, shortKey)
    }
    return shortTags
  }

  /**
   * Generate the map from each lowercase short name to its parent's lowercase short name.
   *
   * @param {Map<Object, string>} shortTags The tag elements and their short names.
   * @returns {Map<string, string>} The parent map (top-level tags are absent).
   * @private
   */
  static _generateParentMap(shortTags) {
    const parentMap = new Map()
    for (const [tagElement, shortName] of shortTags) {
      if (TagParser._hasParentTag(tagElement)) {
        parentMap.set(lc(shortName), lc(shortTags.get(tagElement.$parent)))
      }
    }
    return parentMap
  }

  /**
   * Place top-level tags with a "rooted" attribute under their anchor (unmerged library files list them at the
   * top level; merged files already place them).
   *
   * @param {Map<string, string>} parentMap The parent map, modified in place.
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by short name.
   * @private
   */
  _processRootedTags(parentMap, valueAttributeDefinitions) {
    const rootedAttribute = this.attributes.getEntry('rooted')
    if (rootedAttribute === undefined) {
      return
    }
    for (const [shortName, valueAttributes] of valueAttributeDefinitions) {
      const root = valueAttributes.get(rootedAttribute)
      if (root !== undefined && !parentMap.has(lc(shortName))) {
        if (root.length !== 1) {
          IssueError.generateAndThrowInternalError(`Tag "${shortName}" has a rooted attribute with several values.`)
        }
        parentMap.set(lc(shortName), lc(root[0]))
      }
    }
  }

  /**
   * Resolve a class-valued tag attribute (unitClass or valueClass) to the class entries.
   *
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by short name.
   * @param {string} attributeName The attribute name.
   * @param {SchemaEntryManager} classes The class entries.
   * @param {boolean} removeAttribute Whether to remove the attribute from the tag's value attributes.
   * @returns {Map<string, Array>} The class entries of each tag that has the attribute, by short name.
   * @private
   */
  _processTagClasses(valueAttributeDefinitions, attributeName, classes, removeAttribute = true) {
    const attribute = this.attributes.getEntry(attributeName)
    const definitions = new Map()
    if (attribute === undefined) {
      return definitions
    }
    for (const [shortName, valueAttributes] of valueAttributeDefinitions) {
      const classNames = valueAttributes.get(attribute)
      if (classNames === undefined) {
        continue
      }
      // A class name without an entry (anyUnits before HED 8.5.0) is kept as undefined, as before.
      definitions.set(
        shortName,
        classNames.map((className) => classes.getEntry(className)),
      )
      if (removeAttribute) {
        valueAttributes.delete(attribute)
      }
    }
    return definitions
  }

  /**
   * Propagate recursive boolean attributes to descendant tags.
   *
   * Descendants follow the parent map, which includes the tags placed by a "rooted" attribute, so a tag whose parent
   * an earlier schema of the group declared (a rooted tag of an unmerged library) inherits from that parent tag.
   * "#" children inherit nothing, as before.
   *
   * @param {Map<string, string>} parentMap The parent map (lowercase short names), with the rooted tags placed.
   * @param {Map<string, Set<SchemaAttribute>>} booleanAttributeDefinitions The boolean attributes by short name,
   *     modified in place.
   * @private
   */
  _processRecursiveAttributes(parentMap, booleanAttributeDefinitions) {
    const recursiveAttributes = this._getRecursiveAttributes()
    const namesByKey = new Map([...booleanAttributeDefinitions.keys()].map((name) => [lc(name), name]))
    // Names that differ only by case would make a tag its own parent ("Item" under "Item"); report them as
    // _createSchemaTags does, before walking the parent map.
    if (namesByKey.size !== booleanAttributeDefinitions.size) {
      IssueError.generateAndThrow('duplicateTagsInSchema')
    }
    const passedDown = new Map()
    // The recursive attributes a tag passes to its children: its own and those it inherits.
    const passedDownBy = (key) => {
      if (passedDown.has(key)) {
        return passedDown.get(key)
      }
      // Marked before recursing, so a cycle in the parent map (rooted tags anchored on each other) ends.
      passedDown.set(key, new Set())
      const name = namesByKey.get(key)
      let attributes
      if (name === undefined) {
        // A parent from an earlier schema of the group already carries everything it inherited.
        attributes = this.entryTypeMap.get(key)?.booleanAttributes.intersection(recursiveAttributes) ?? new Set()
      } else {
        const own = booleanAttributeDefinitions.get(name).intersection(recursiveAttributes)
        const parentKey = parentMap.get(key)
        attributes = parentKey === undefined ? own : own.union(passedDownBy(parentKey))
      }
      passedDown.set(key, attributes)
      return attributes
    }
    for (const name of booleanAttributeDefinitions.keys()) {
      const parentKey = parentMap.get(lc(name))
      if (parentKey !== undefined && !name.endsWith('-#')) {
        booleanAttributeDefinitions.set(name, booleanAttributeDefinitions.get(name).union(passedDownBy(parentKey)))
      }
    }
  }

  /**
   * The attributes that apply to a tag's descendants: from HED 8.3.0 every attribute without the annotationProperty
   * role, before that every attribute with the isInheritedProperty role.
   *
   * @returns {Set<SchemaAttribute>}
   * @private
   */
  _getRecursiveAttributes() {
    const attributeArray = Array.from(this.attributes.values())
    const hasRole = (attribute, roleName) => [...attribute.roleProperties].some((role) => role.name === roleName)
    const usesAnnotationRole = attributeArray.some((attribute) => hasRole(attribute, 'annotationProperty'))
    const filtered = usesAnnotationRole
      ? attributeArray.filter((attribute) => !hasRole(attribute, 'annotationProperty'))
      : attributeArray.filter((attribute) => hasRole(attribute, 'isInheritedProperty'))
    return new Set(filtered)
  }

  /**
   * Create the {@link SchemaTag} objects of the schema being parsed.
   *
   * A parent that an earlier schema of the group already contributed is reused, so that the tags of every schema
   * hang off one tree; a "#" child is attached to its own schema's parent, which is the same object or an equivalent
   * one that the merge discards.
   *
   * @param {Map<string, Set<SchemaAttribute>>} booleanAttributeDefinitions The boolean attributes by short name.
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by short name.
   * @param {Map<string, string|undefined>} descriptions The descriptions by short name.
   * @param {Map<string, SchemaUnitClass[]>} tagUnitClassDefinitions The unit classes by short name.
   * @param {Map<string, SchemaValueClass[]>} tagValueClassDefinitions The value classes by short name.
   * @param {Map<string, string>} parentMap The parent map.
   * @private
   */
  _createSchemaTags(
    booleanAttributeDefinitions,
    valueAttributeDefinitions,
    descriptions,
    tagUnitClassDefinitions,
    tagValueClassDefinitions,
    parentMap,
  ) {
    this.schemaTags = new Map()
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const key = lc(name)
      if (this.schemaTags.has(key)) {
        IssueError.generateAndThrow('duplicateTagsInSchema')
      }
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      const description = descriptions.get(name)
      const unitClasses = tagUnitClassDefinitions.get(name) ?? []
      const valueClasses = tagValueClassDefinitions.get(name) ?? []
      const parentName = parentMap.get(key)
      const isValueTag = name.endsWith('-#')
      let parentTag
      if (parentName !== undefined) {
        parentTag = isValueTag
          ? (this.schemaTags.get(parentName) ?? this.entryTypeMap.get(parentName))
          : (this.entryTypeMap.get(parentName) ?? this.schemaTags.get(parentName))
      }
      if (isValueTag) {
        if (this.entryTypeMap.has(parentName) && !this.entryTypeMap.has(key)) {
          // A "#" child added to a tag that an earlier schema declared without one.
          IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: name.replace('-#', '/#') })
        }
        this.schemaTags.set(
          key,
          new SchemaValueTag(
            name,
            description,
            parentTag,
            booleanAttributes,
            valueAttributes,
            unitClasses,
            valueClasses,
          ),
        )
      } else {
        this.schemaTags.set(
          key,
          new SchemaTag(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses),
        )
      }
    }
  }

  /**
   * Fold the tags of the schema being parsed into the merged tag map.
   * @private
   */
  _mergeSchemaTags() {
    for (const [key, tag] of this.schemaTags) {
      this.addEntry(key, tag)
    }
  }

  /**
   * Add a tag, keeping an existing declaration of the same name if the new one is equivalent to it.
   *
   * @param {string} key The lowercase short name.
   * @param {SchemaTag} tag The new tag.
   * @throws {IssueError} If a library redeclares a standard tag, or two schemas declare a tag incompatibly.
   */
  addEntry(key, tag) {
    const existing = this.entryTypeMap.get(key)
    if (existing === undefined) {
      this.entryTypeMap.set(key, tag)
      return
    }
    const longName = tag.name.replace('-#', '/#')
    if (tag.hasAttribute('inLibrary') && !existing.hasAttribute('inLibrary')) {
      IssueError.generateAndThrow('lazyPartneredSchemaOverloadsStandardTag', { tag: longName })
    }
    if (!tag.equivalent(existing)) {
      IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: longName })
    }
  }
}

/**
 * The parser of a merge group: builds the merged {@link SchemaEntries} from the group's XML data.
 */
export default class SchemaParser {
  /**
   * The XML data of the merge group.
   * @type {SchemaXmlCollection}
   */
  xmlCollection

  /**
   * @type {SchemaEntryManager<SchemaProperty>}
   */
  properties

  /**
   * @type {SchemaEntryManager<SchemaAttribute>}
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
   * @type {SchemaEntryManager<SchemaTag>}
   */
  tags

  /**
   * Constructor.
   *
   * @param {SchemaXmlCollection} xmlCollection The XML data of the merge group.
   */
  constructor(xmlCollection) {
    this.xmlCollection = xmlCollection
  }

  /**
   * Parse the merge group.
   *
   * @returns {SchemaEntries} The merged schema entries.
   * @throws {IssueError} If two schemas of the group declare an element incompatibly.
   */
  parse() {
    this.properties = new PropertyParser(this.xmlCollection).parse()
    this.attributes = new AttributeParser(this.xmlCollection, this.properties).parse()
    this.unitModifiers = new UnitModifierParser(this.xmlCollection, this.attributes).parse()
    this.unitClasses = new UnitClassParser(this.xmlCollection, this.attributes, this.unitModifiers).parse()
    this.valueClasses = new ValueClassParser(this.xmlCollection, this.attributes).parse()
    this.tags = new TagParser(this.xmlCollection, this.attributes, this.unitClasses, this.valueClasses).parse()
    return new SchemaEntries(this)
  }
}

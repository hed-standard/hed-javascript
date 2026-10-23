/** This module holds the abstract parsers for populating a schema from XML.
 *
 * The schemas of a merge group are merged while they are parsed: each entry-type parser runs over every schema of
 * the group's {@link HedSchemaXMLCollection} and writes into one map. An element declared by more than one schema is
 * kept once; a later declaration is accepted only if it is equivalent to the first (specification 3.1.2.4).
 *
 * @module schema/parser/schemaEntry
 */

import SchemaEntryManager from '../entries/schemaEntryManager'
import { getElementDescription, getElementName } from '../xmlType'

import { IssueError } from '../../issues/issues'

/**
 * Retrieve the definition elements of a category in one schema.
 *
 * @param {Object} rootElement The root XML element of the schema.
 * @param {string} category The definition category (e.g. "unitClass").
 * @returns {Object[]} The definition elements.
 */
export function getDefinitionElements(rootElement, category) {
  const categoryTagName = category + 'Definition'
  const categoryParentTagName = categoryTagName + 's'
  // An empty section (<propertyDefinitions/> in an unpartnered library) has no definition elements.
  const definitions = rootElement[categoryParentTagName]?.[categoryTagName]
  if (definitions === undefined || definitions === null) {
    return []
  }
  return (Array.isArray(definitions) ? definitions : [definitions]).filter((element) => typeof element === 'object')
}

/**
 * A parser for a specific {@link SchemaEntry} subtype, run over every schema of a merge group.
 *
 * @template T
 * @abstract
 */
export class SchemaEntryParser {
  /**
   * The collection of XML data for a given prefix.
   * @type {HedSchemaXMLCollection}
   */
  xmlCollection

  /**
   * The map of names to entry objects for this entry type.
   * @type {Map<string, T>}
   */
  entryTypeMap

  /**
   * Constructor.
   *
   * @param {HedSchemaXMLCollection} xmlCollection A collection of XML data for a given prefix.
   */
  constructor(xmlCollection) {
    this.xmlCollection = xmlCollection
    this.entryTypeMap = new Map()
  }

  /**
   * Parse this entry type across all schemas in the collection.
   *
   * @returns {SchemaEntryManager<T>} An entry manager for this entry type.
   * @throws {IssueError} If two schemas declare an element incompatibly.
   */
  parse() {
    this._preprocessSchemas(this.xmlCollection)
    for (const schema of this.xmlCollection) {
      this._parseSchema(schema)
    }
    this._addCustomEntries()
    return new SchemaEntryManager(this.entryTypeMap)
  }

  /**
   * Add a new entry while checking for duplicates.
   *
   * An existing declaration of the same name is kept if the new one is equivalent to it.
   *
   * @param {string} newEntryName The entry name.
   * @param {T} newEntry The new entry object to add.
   * @throws {IssueError} If an entry of that name exists and is not equivalent.
   */
  addEntry(newEntryName, newEntry) {
    if (this.entryTypeMap.has(newEntryName)) {
      if (!newEntry.equivalent(this.entryTypeMap.get(newEntryName))) {
        IssueError.generateAndThrow('lazyPartneredSchemasShareEntry', { entryName: newEntryName })
      }
    } else {
      this.entryTypeMap.set(newEntryName, newEntry)
    }
  }

  /**
   * Preprocess the schema collection.
   *
   * @param {HedSchemaXMLCollection} schemaXml The XML collection.
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  _preprocessSchemas(schemaXml) {}

  /**
   * Parse this entry type for a specific schema.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @abstract
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  _parseSchema(schemaXml) {
    IssueError.generateAndThrowInternalError('SchemaEntryParser._parseSchema must be overridden.')
  }

  /**
   * Add any custom entries required by the platform to support old versions.
   * @protected
   */
  _addCustomEntries() {}
}

/**
 * A parser for entries that carry schema attributes.
 *
 * @template T
 * @abstract
 */
export class SchemaEntryWithAttributesParser extends SchemaEntryParser {
  /**
   * The schema attributes.
   * @type {SchemaEntryManager<SchemaAttribute>}
   */
  attributes

  /**
   * Constructor.
   *
   * @param {HedSchemaXMLCollection} xmlCollection A collection of XML data for a given prefix.
   * @param {SchemaEntryManager<SchemaAttribute>} attributes The parsed schema attributes.
   */
  constructor(xmlCollection, attributes) {
    super(xmlCollection)
    this.attributes = attributes
  }

  /**
   * Parse the attributes and descriptions of a list of definition elements.
   *
   * @param {Iterable<Object>} definitionElements The XML elements.
   * @returns {[Map<string, Set<SchemaAttribute>>, Map<string, Map<SchemaAttribute, string[]>>, Map<string, string|undefined>]}
   *     The boolean attributes, value attributes, and descriptions of the elements, keyed by name.
   * @protected
   */
  _parseDefinitions(definitionElements) {
    return this._parseAttributeElements(definitionElements, getElementName)
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
   * Parse the attributes of one element.
   *
   * @param {Object} element The XML element.
   * @returns {[Set<SchemaAttribute>, Map<SchemaAttribute, string[]>]} The boolean and value attributes.
   * @throws {IssueError} If the element uses an attribute the schema does not define.
   * @private
   */
  _parseAttributeElement(element) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    const tagAttributes = element.attribute ?? []

    for (const tagAttribute of tagAttributes) {
      const attributeName = getElementName(tagAttribute)
      const attribute = this.attributes.getEntry(attributeName)
      if (!attribute) {
        IssueError.generateAndThrow('invalidSchema', {
          error: `Schema attribute "${attributeName}" is used but not defined`,
        })
      }
      if (tagAttribute.value === undefined) {
        booleanAttributes.add(attribute)
        continue
      }
      const values = tagAttribute.value.map((value) => value._)
      valueAttributes.set(attribute, values)
    }

    return [booleanAttributes, valueAttributes]
  }

  /**
   * Give the elements of an unmerged library schema the inLibrary attribute that its merged file carries.
   *
   * An unmerged file holds only its library's elements, except that it may name an element of an earlier schema
   * of the group again to extend it (a partner unit class it adds units to); such an element keeps its declarer.
   *
   * @param {Object} schemaXml The XML of the schema being parsed.
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by name,
   *     modified in place.
   * @param {function(string): boolean} isDeclared Whether an earlier schema of the group declared the named element.
   * @protected
   */
  _addInLibrary(schemaXml, valueAttributeDefinitions, isDeclared) {
    const library = schemaXml.HED.$?.library
    const inLibrary = this.attributes.getEntry('inLibrary')
    if (schemaXml.HED.$?.unmerged === undefined || library === undefined || inLibrary === undefined) {
      return
    }
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      if (!isDeclared(name) && !valueAttributes.has(inLibrary)) {
        valueAttributes.set(inLibrary, [library])
      }
    }
  }
}

/**
 * A parser for the entries of a definition section (unit modifiers, unit classes, value classes).
 *
 * @template T
 * @abstract
 */
export class SchemaDefinitionEntryParser extends SchemaEntryWithAttributesParser {
  /**
   * Parse the definitions of one schema.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @protected
   */
  _parseSchema(schemaXml) {
    const definitions = this._getDefinitions(schemaXml)
    const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseDefinitions(definitions)
    this._addInLibrary(schemaXml, valueAttributeDefinitions, (name) => this.entryTypeMap.has(name))
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name) ?? new Set()
      const description = descriptions.get(name)
      this.addEntry(name, this._buildEntry(name, description, booleanAttributes, valueAttributes))
    }
  }

  /**
   * Retrieve the definition elements of this entry type in one schema.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @returns {Object[]} The definition elements.
   * @abstract
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  _getDefinitions(schemaXml) {
    IssueError.generateAndThrowInternalError('SchemaDefinitionEntryParser._getDefinitions must be overridden.')
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

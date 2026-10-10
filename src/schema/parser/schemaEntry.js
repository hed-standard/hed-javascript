import SchemaEntryManager from '../entries/schemaEntryManager'
import { getElementName, getElementDescription } from '../xmlType'
import { IssueError } from '../../issues/issues'
/**
 * A parser for a specific {@link SchemaEntry} subtype.
 *
 * @typeParam T - The subclass of {@link SchemaEntry} the implementation parses.
 */
export class SchemaEntryParser {
  /**
   * The collection of XML data for a given prefix.
   */
  xmlCollection
  /**
   * The map of names to entry objects for this entry type.
   */
  entryTypeMap
  /**
   * Constructor.
   *
   * @param xmlCollection - A collection of XML data for a given prefix.
   */
  constructor(xmlCollection) {
    this.xmlCollection = xmlCollection
    this.entryTypeMap = new Map()
  }
  /**
   * Parse this entry type across all schemas in the collection.
   *
   * @returns An entry manager for this entry type.
   * @internal
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
   * @param newEntryName - The entry name.
   * @param newEntry - The new entry object to add.
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
   * @param schemaXml - The XML collection.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _preprocessSchemas(schemaXml) {}
  /**
   * Add any custom entries required by the platform to support old versions.
   */
  _addCustomEntries() {}
}
export class SchemaEntryWithAttributesParser extends SchemaEntryParser {
  attributes
  constructor(xmlCollection, attributes) {
    super(xmlCollection)
    this.attributes = attributes
  }
  _parseDefinitions(definitionElements) {
    return this._parseAttributeElements(definitionElements, getElementName)
  }
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
  _parseAttributeElement(element) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()
    const tagAttributes = element.attribute ?? []
    for (const tagAttribute of tagAttributes) {
      const attributeName = getElementName(tagAttribute)
      const attribute = this.attributes.getEntry(attributeName)
      if (!attribute) {
        IssueError.generateAndThrow('invalidSchema', { error: 'Referenced schema attribute was not found' })
      }
      if (tagAttribute.value === undefined) {
        booleanAttributes.add(attribute)
        continue
      }
      const values = tagAttribute.value.map((value) => value._.toString())
      valueAttributes.set(attribute, values)
    }
    return [booleanAttributes, valueAttributes]
  }
}
export class SchemaDefinitionEntryParser extends SchemaEntryWithAttributesParser {
  _parseSchema(schemaXml) {
    const definitions = this._getDefinitions(schemaXml)
    if (!definitions) {
      return
    }
    const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseDefinitions(definitions)
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name) ?? new Set()
      const description = descriptions.get(name)
      this.addEntry(name, this._buildEntry(name, description, booleanAttributes, valueAttributes))
    }
  }
}

import semver from 'semver'
import { SchemaEntryParser } from './schemaEntry'
import SchemaProperty from '../entries/property'
import { getElementTagName } from '../xmlType'
/**
 * A parser for schema properties.
 */
export default class PropertyParser extends SchemaEntryParser {
  /**
   * Constructor.
   *
   * @param xmlCollection - A collection of XML data for a given prefix.
   */
  constructor(xmlCollection) {
    super(xmlCollection)
  }
  /**
   * Parse properties in a specific schema.
   *
   * @param schemaXml - The XML for a specific schema.
   */
  _parseSchema(schemaXml) {
    const propertyDefinitions = schemaXml.HED.propertyDefinitions.propertyDefinition
    if (!propertyDefinitions) {
      return
    }
    for (const definition of propertyDefinitions) {
      const propertyName = getElementTagName(definition)
      this.addEntry(propertyName, new SchemaProperty(propertyName))
    }
  }
  /**
   * Add custom properties required by the platform to support old versions.
   *
   * @remarks
   * This method is used to inject `isInheritedProperty` for recursive attribute support in old versions.
   */
  _addCustomEntries() {
    if (this.xmlCollection.standardVersion && semver.lt(this.xmlCollection.standardVersion, '8.2.0')) {
      const recursiveProperty = new SchemaProperty('isInheritedProperty')
      this.addEntry('isInheritedProperty', recursiveProperty)
    }
  }
}

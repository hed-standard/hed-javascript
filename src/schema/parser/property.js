import semver from 'semver'

import { getDefinitionElements, SchemaEntryParser } from './schemaEntry'
import SchemaProperty from '../entries/property'
import { getElementDescription, getElementName } from '../xmlType'

/**
 * A parser for schema properties.
 */
export default class PropertyParser extends SchemaEntryParser {
  /**
   * Parse properties in a specific schema.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @protected
   */
  _parseSchema(schemaXml) {
    for (const definition of getDefinitionElements(schemaXml.HED, 'property')) {
      const propertyName = getElementName(definition)
      const propertyDescription = getElementDescription(definition)
      this.addEntry(propertyName, new SchemaProperty(propertyName, propertyDescription))
    }
  }

  /**
   * Add custom properties required by the platform to support old versions.
   *
   * This method is used to inject `isInheritedProperty` for recursive attribute support in standard schemas before
   * 8.2.0.
   *
   * @protected
   */
  _addCustomEntries() {
    if (this.xmlCollection.standardVersion && semver.lt(this.xmlCollection.standardVersion, '8.2.0')) {
      const recursiveProperty = new SchemaProperty('isInheritedProperty', undefined)
      this.addEntry('isInheritedProperty', recursiveProperty)
    }
  }
}

import semver from 'semver'

import { getDefinitionElements, SchemaEntryParser } from './schemaEntry'
import SchemaAttribute from '../entries/attribute'
import SchemaProperty from '../entries/property'
import { getElementDescription, getElementName } from '../xmlType'

/**
 * A parser for schema attributes.
 */
export default class AttributeParser extends SchemaEntryParser {
  /**
   * The schema properties.
   * @type {SchemaEntryManager<SchemaProperty>}
   */
  properties

  /**
   * Constructor.
   *
   * @param {HedSchemaXMLCollection} xmlCollection A collection of XML data for a given prefix.
   * @param {SchemaEntryManager<SchemaProperty>} properties The parsed mapping of schema properties.
   */
  constructor(xmlCollection, properties) {
    super(xmlCollection)
    this.properties = properties
  }

  /**
   * Parse attributes in a specific schema.
   *
   * A property with a value (inLibrary) marks the library that declares the attribute and is not one of its
   * properties. A property name the schema does not define is kept as an unregistered property of that name, so
   * that two declarations are compared by the names as written (specification 3.1.2.4).
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @protected
   */
  _parseSchema(schemaXml) {
    for (const definition of getDefinitionElements(schemaXml.HED, 'schemaAttribute')) {
      const attributeName = getElementName(definition)
      const attributeDescription = getElementDescription(definition)
      const propertyElements = definition.property ?? []
      const properties = propertyElements
        .filter((element) => element.value === undefined)
        .map((element) => {
          const propertyName = getElementName(element)
          return this.properties.getEntry(propertyName) ?? new SchemaProperty(propertyName, undefined)
        })
      const isRecursive = this._determineAttributeRecursion(attributeName, properties)
      this.addEntry(
        attributeName,
        new SchemaAttribute(attributeName, attributeDescription, new Set(properties), isRecursive),
      )
    }
  }

  /**
   * Determine whether a given list of properties infers that an attribute is recursive.
   *
   * From HED 8.3.0 every attribute without annotationProperty is recursive; before that, every attribute with
   * isInheritedProperty, which standard schemas before 8.2.0 leave implicit for extensionAllowed and before 8.3.0
   * for inLibrary.
   *
   * @param {string} attributeName The name of the attribute being parsed.
   * @param {SchemaProperty[]} properties A list of properties held by an attribute being parsed.
   * @returns {boolean} Whether the attribute is recursive.
   * @private
   */
  _determineAttributeRecursion(attributeName, properties) {
    const propertyNames = properties.map((property) => property.name)
    if (this.properties.hasEntry('annotationProperty')) {
      return !propertyNames.includes('annotationProperty')
    }
    if (this.properties.hasEntry('isInheritedProperty')) {
      return propertyNames.includes('isInheritedProperty') || this._isInheritedByVersion(attributeName)
    }
    return false
  }

  /**
   * Whether the standard schema version of the merge group makes an attribute inherited without saying so.
   *
   * @param {string} attributeName The name of the attribute being parsed.
   * @returns {boolean} Whether the attribute is inherited by the version rule.
   * @private
   */
  _isInheritedByVersion(attributeName) {
    const version = this.xmlCollection.standardVersion
    if (!version) {
      return false
    }
    if (attributeName === 'extensionAllowed') {
      return semver.lt(version, '8.2.0')
    }
    if (attributeName === 'inLibrary') {
      return semver.lt(version, '8.3.0')
    }
    return false
  }
}

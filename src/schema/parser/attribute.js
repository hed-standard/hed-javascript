import { getElementTagName } from '../xmlType'
import { SchemaEntryParser } from './schemaEntry'
import SchemaAttribute from '../entries/attribute'
export default class AttributeParser extends SchemaEntryParser {
  /**
   * The schema properties.
   */
  properties
  /**
   * Constructor.
   *
   * @param xmlCollection - A collection of XML data for a given prefix.
   * @param properties - The parsed mapping of schema properties.
   */
  constructor(xmlCollection, properties) {
    super(xmlCollection)
    this.properties = properties
  }
  /**
   * Parse attributes in a specific schema.
   *
   * @param schemaXml - The XML for a specific schema.
   */
  _parseSchema(schemaXml) {
    const attributeDefinitions = schemaXml.HED.schemaAttributeDefinitions.schemaAttributeDefinition
    if (!attributeDefinitions) {
      return
    }
    for (const definition of attributeDefinitions) {
      const attributeName = getElementTagName(definition)
      const propertyElements = definition.property ?? []
      const properties = propertyElements
        .map((element) => this.properties.getEntry(getElementTagName(element)))
        .filter((property) => property !== undefined)
      const isRecursive = this._determineAttributeRecursion(properties)
      this.addEntry(attributeName, new SchemaAttribute(attributeName, new Set(properties), isRecursive))
    }
  }
  /**
   * Determine whether a given list of properties infers that an attribute is recursive.
   *
   * @param properties - A list of properties held by an attribute being parsed.
   * @returns Whether the attribute is recursive.
   */
  _determineAttributeRecursion(properties) {
    const annotationProperty = this.properties.getEntry('annotationProperty')
    if (annotationProperty) {
      return !properties.includes(annotationProperty)
    }
    const isInheritedProperty = this.properties.getEntry('isInheritedProperty')
    if (isInheritedProperty) {
      return properties.includes(isInheritedProperty)
    }
    // The case of extensionAllowed will be handled by the SchemaAttribute constructor.
    return false
  }
}

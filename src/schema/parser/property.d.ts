import { SchemaEntryParser } from './schemaEntry'
import SchemaProperty from '../entries/property'
import { type HedSchemaXMLCollection, type HedSchemaXMLObject } from '../xmlType'
/**
 * A parser for schema properties.
 */
export default class PropertyParser extends SchemaEntryParser<SchemaProperty> {
  /**
   * Constructor.
   *
   * @param xmlCollection - A collection of XML data for a given prefix.
   */
  constructor(xmlCollection: HedSchemaXMLCollection)
  /**
   * Parse properties in a specific schema.
   *
   * @param schemaXml - The XML for a specific schema.
   */
  protected _parseSchema(schemaXml: HedSchemaXMLObject): void
  /**
   * Add custom properties required by the platform to support old versions.
   *
   * @remarks
   * This method is used to inject `isInheritedProperty` for recursive attribute support in old versions.
   */
  protected _addCustomEntries(): void
}

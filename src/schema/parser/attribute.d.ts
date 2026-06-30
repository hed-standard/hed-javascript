import { type HedSchemaXMLCollection, type HedSchemaXMLObject } from '../xmlType'
import { SchemaEntryParser } from './schemaEntry'
import type SchemaEntryManager from '../entries/schemaEntryManager'
import type SchemaProperty from '../entries/property'
import SchemaAttribute from '../entries/attribute'
export default class AttributeParser extends SchemaEntryParser<SchemaAttribute> {
  /**
   * The schema properties.
   */
  private readonly properties
  /**
   * Constructor.
   *
   * @param xmlCollection - A collection of XML data for a given prefix.
   * @param properties - The parsed mapping of schema properties.
   */
  constructor(xmlCollection: HedSchemaXMLCollection, properties: SchemaEntryManager<SchemaProperty>)
  /**
   * Parse attributes in a specific schema.
   *
   * @param schemaXml - The XML for a specific schema.
   */
  protected _parseSchema(schemaXml: HedSchemaXMLObject): void
  /**
   * Determine whether a given list of properties infers that an attribute is recursive.
   *
   * @param properties - A list of properties held by an attribute being parsed.
   * @returns Whether the attribute is recursive.
   */
  private _determineAttributeRecursion
}

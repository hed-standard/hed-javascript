import type { HedSchemaXMLCollection } from '../xmlType'
import type SchemaProperty from '../entries/property'
import type SchemaAttribute from '../entries/attribute'
import type SchemaValueClass from '../entries/valueClass'
import type SchemaUnitClass from '../entries/unitClass'
import type SchemaUnitModifier from '../entries/unitModifier'
import type SchemaTag from '../entries/tag'
import type SchemaEntryManager from '../entries/schemaEntryManager'
import SchemaEntries from '../entries/schemaEntries'
export default class SchemaParser {
  /**
   * The schema XML collection.
   */
  xmlCollection: HedSchemaXMLCollection
  properties: SchemaEntryManager<SchemaProperty>
  attributes: SchemaEntryManager<SchemaAttribute>
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
   * Constructor.
   *
   * @param xmlCollection - The schema XML collection.
   */
  constructor(xmlCollection: HedSchemaXMLCollection)
  parse(): SchemaEntries
  private populateDictionaries
}

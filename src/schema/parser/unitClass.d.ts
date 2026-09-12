import { type HedSchemaXMLCollection, type DefinitionElement, HedSchemaXMLObject } from '../xmlType'
import { SchemaDefinitionEntryParser } from './schemaEntry'
import type SchemaUnitModifier from '../entries/unitModifier'
import type SchemaAttribute from '../entries/attribute'
import type SchemaEntryManager from '../entries/schemaEntryManager'
import SchemaUnitClass from '../entries/unitClass'
export default class UnitClassParser extends SchemaDefinitionEntryParser<SchemaUnitClass> {
  private readonly unitModifiers
  private unitClassesUnits
  private unitClassUnits
  constructor(
    xmlCollection: HedSchemaXMLCollection,
    attributes: SchemaEntryManager<SchemaAttribute>,
    unitModifiers: SchemaEntryManager<SchemaUnitModifier>,
  )
  protected _preprocessSchema(schemaXml: HedSchemaXMLObject): void
  protected _getDefinitions(schemaXml: HedSchemaXMLObject): Iterable<DefinitionElement> | undefined
  protected _buildEntry(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
  ): SchemaUnitClass
  private parseUnits
  /**
   * Add a new unit while checking for duplicates.
   *
   * @param newUnitName - The unit name.
   * @param newUnit - The new unit object to add.
   */
  private addUnit
}

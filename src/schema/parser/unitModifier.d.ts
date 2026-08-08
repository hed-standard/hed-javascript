import type { DefinitionElement, HedSchemaXMLCollection, HedSchemaXMLObject } from '../xmlType'
import { SchemaDefinitionEntryParser } from './schemaEntry'
import type SchemaEntryManager from '../entries/schemaEntryManager'
import type SchemaAttribute from '../entries/attribute'
import SchemaUnitModifier from '../entries/unitModifier'
export default class UnitModifierParser extends SchemaDefinitionEntryParser<SchemaUnitModifier> {
  constructor(xmlCollection: HedSchemaXMLCollection, attributes: SchemaEntryManager<SchemaAttribute>)
  protected _getDefinitions(schemaXml: HedSchemaXMLObject): Iterable<DefinitionElement> | undefined
  protected _buildEntry(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
  ): SchemaUnitModifier
}

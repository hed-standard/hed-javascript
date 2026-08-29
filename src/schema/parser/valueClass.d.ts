import { SchemaDefinitionEntryParser } from './schemaEntry'
import type { DefinitionElement, HedSchemaXMLCollection, HedSchemaXMLObject } from '../xmlType'
import type SchemaEntryManager from '../entries/schemaEntryManager'
import type SchemaAttribute from '../entries/attribute'
import SchemaValueClass from '../entries/valueClass'
export default class ValueClassParser extends SchemaDefinitionEntryParser<SchemaValueClass> {
  constructor(xmlCollection: HedSchemaXMLCollection, attributes: SchemaEntryManager<SchemaAttribute>)
  protected _getDefinitions(schemaXml: HedSchemaXMLObject): Iterable<DefinitionElement> | undefined
  protected _buildEntry(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
  ): SchemaValueClass
  private _getValueClassChars
}

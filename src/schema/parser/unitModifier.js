import { SchemaDefinitionEntryParser } from './schemaEntry'
import SchemaUnitModifier from '../entries/unitModifier'
export default class UnitModifierParser extends SchemaDefinitionEntryParser {
  constructor(xmlCollection, attributes) {
    super(xmlCollection, attributes)
  }
  _getDefinitions(schemaXml) {
    return schemaXml.HED.unitModifierDefinitions.unitModifierDefinition
  }
  _buildEntry(name, booleanAttributes, valueAttributes) {
    return new SchemaUnitModifier(name, booleanAttributes, valueAttributes)
  }
}

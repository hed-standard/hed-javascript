import { getDefinitionElements, SchemaDefinitionEntryParser } from './schemaEntry'
import SchemaUnitModifier from '../entries/unitModifier'

/**
 * A parser for unit modifiers.
 */
export default class UnitModifierParser extends SchemaDefinitionEntryParser {
  _getDefinitions(schemaXml) {
    return getDefinitionElements(schemaXml.HED, 'unitModifier')
  }

  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    return new SchemaUnitModifier(name, description, booleanAttributes, valueAttributes)
  }
}

import { SchemaDefinitionEntryParser } from './schemaEntry'
import SchemaValueClass from '../entries/valueClass'
import * as _classRegex from '../../data/json/classRegex.json'
const classRegex = _classRegex
export default class ValueClassParser extends SchemaDefinitionEntryParser {
  constructor(xmlCollection, attributes) {
    super(xmlCollection, attributes)
  }
  _getDefinitions(schemaXml) {
    return schemaXml.HED.valueClassDefinitions.valueClassDefinition
  }
  _buildEntry(name, booleanAttributes, valueAttributes) {
    const charRegex = this._getValueClassChars(name)
    const wordRegex = new RegExp(classRegex.class_words[name] ?? '^.+$')
    return new SchemaValueClass(name, booleanAttributes, valueAttributes, charRegex, wordRegex)
  }
  _getValueClassChars(name) {
    let classChars
    if (Array.isArray(classRegex.class_chars[name]) && classRegex.class_chars[name].length > 0) {
      classChars =
        '^(?:' + classRegex.class_chars[name].map((charClass) => classRegex.char_regex[charClass]).join('|') + ')+$'
    } else {
      classChars = '^.+$' // Any non-empty line or string.
    }
    return new RegExp(classChars)
  }
}

import semver from 'semver'

import { getDefinitionElements, SchemaDefinitionEntryParser } from './schemaEntry'
import SchemaValueClass from '../entries/valueClass'
import { characterSets } from '../characterSets'

/**
 * A parser for value classes.
 */
export default class ValueClassParser extends SchemaDefinitionEntryParser {
  _getDefinitions(schemaXml) {
    return getDefinitionElements(schemaXml.HED, 'valueClass')
  }

  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    const allowedNames = this._allowedNames(name, valueAttributes)
    return new SchemaValueClass(name, description, booleanAttributes, valueAttributes, allowedNames)
  }

  /**
   * The character set names that define the characters of a value class (character_sets.json).
   *
   * From standard schema 8.5.0, and in libraries partnered with 8.5.0 or later, the class's own allowedCharacter
   * declaration defines it, provided every name is a set, an alias, or a single character. Before that the
   * file's value_class_defaults for the standard version define the standard classes, because their released
   * declarations are incomplete. A class the file has no defaults for (a library's own class) always follows its
   * declaration. This is hed-python's CharRexValidator.allowed_names.
   *
   * @param {string} name The value class name.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The class's value attributes.
   * @returns {string[]} The names; empty when nothing constrains the characters.
   * @private
   */
  _allowedNames(name, valueAttributes) {
    const standardVersion = this.xmlCollection.standardVersion || null
    const declarationWins = standardVersion !== null && !semver.lt(standardVersion, characterSets.declarationWinsFrom)
    const defaults = characterSets.defaultsFor(name, standardVersion)
    const allowedCharacter = this.attributes.getEntry('allowedCharacter')
    const declared = characterSets.declaredNames(valueAttributes.get(allowedCharacter) ?? [])
    if (declared.length > 0 && (declarationWins || defaults.length === 0)) {
      if (declared.every((declaredName) => characterSets.isKnownName(declaredName))) {
        return declared
      }
    }
    return defaults
  }
}

import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
import { characterSets } from '../characterSets'
import { isExistingGregorianDate } from '../../utils/dateTime'

/**
 * A schema value class.
 */
export default class SchemaValueClass extends SchemaEntryWithAttributes {
  /**
   * The character set names (character_sets.json) that define this class's characters; empty for no constraint.
   * @type {string[]}
   */
  allowedNames

  /**
   * The whole-value regular expression of this class (character_sets.json value_class_words), or null.
   * @type {RegExp|null}
   */
  _wordRegex

  /**
   * Constructor.
   *
   * @param {string} name The name of this value class.
   * @param {string|undefined} description The description of this value class.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this value class.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The value attributes for this value class.
   * @param {string[]} allowedNames The character set names that define the class's characters.
   */
  constructor(name, description, booleanAttributes, valueAttributes, allowedNames = []) {
    super(name, description, booleanAttributes, valueAttributes)
    this.allowedNames = allowedNames
    this._wordRegex = characterSets.wordRule(name)
  }

  /**
   * Determine if a value is valid according to this value class.
   *
   * @param {string} value A HED value.
   * @returns {boolean} Whether the value conforms to this value class.
   */
  validateValue(value) {
    return this.valueProblem(value) === null
  }

  /**
   * Say why a value fails this class, checking the whole-value rule before the characters, as hed-python does.
   *
   * @param {string} value A HED value.
   * @returns {{rule: true}|{characters: Array<[number, string]>}|null} null if the value is valid; {rule: true} if
   *     it is empty, breaks the class's whole-value rule, or (dateTimeClass) names a date that does not exist;
   *     otherwise the characters the class does not allow, as [index, character] pairs.
   */
  valueProblem(value) {
    if (value === '' || (this._wordRegex !== null && !this._wordRegex.test(value))) {
      return { rule: true }
    }
    if (this.name === 'dateTimeClass' && !isExistingGregorianDate(value.slice(0, 10))) {
      // The regular expression fixes the shape; the date must also exist in the Gregorian calendar.
      return { rule: true }
    }
    const characters = characterSets.problemCharacters(value, this.allowedNames)
    return characters.length > 0 ? { characters: characters } : null
  }

  /**
   * Determine if this schema value class is equivalent to another schema value class.
   *
   * Value classes are equivalent if they have the same name, description, attributes, and allowed characters (in
   * any order, as for the attribute values).
   *
   * @param {*} other A schema value class to compare with this one.
   * @returns {boolean} Whether the other value class is equivalent to this schema value class.
   */
  equivalent(other) {
    if (!(other instanceof SchemaValueClass)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    const sorted = (names) => [...names].sort((a, b) => a.localeCompare(b)).join('\u0000')
    return sorted(this.allowedNames) === sorted(other.allowedNames)
  }
}

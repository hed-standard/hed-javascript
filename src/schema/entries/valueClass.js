import { isEqual } from 'lodash'
import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
/**
 * A schema value class.
 */
export default class SchemaValueClass extends SchemaEntryWithAttributes {
  /**
   * The character class-based regular expression.
   */
  _charClassRegex
  /**
   * The "word form"-based regular expression.
   */
  _wordRegex
  /**
   * Constructor.
   *
   * @param name - The name of this value class.
   * @param booleanAttributes - The boolean attributes for this value class.
   * @param valueAttributes - The value attributes for this value class.
   * @param charClassRegex - The character class-based regular expression for this value class.
   * @param wordRegex - The "word form"-based regular expression for this value class.
   */
  constructor(name, booleanAttributes, valueAttributes, charClassRegex, wordRegex) {
    super(name, booleanAttributes, valueAttributes)
    this._charClassRegex = charClassRegex
    this._wordRegex = wordRegex
  }
  /**
   * Determine if a value is valid according to this value class.
   *
   * @param value - A HED value.
   * @returns Whether the value conforms to this value class.
   */
  validateValue(value) {
    return this._wordRegex.test(value) && this._charClassRegex.test(value)
  }
  /**
   * Determine if this schema value class is equivalent to another schema value class.
   *
   * @remarks
   *
   * Schema value classes are deemed equivalent if they have the same name and equivalent regular expressions.
   *
   * @param other - A schema value class to compare with this one.
   * @returns Whether the other value class is equivalent to this schema value class.
   */
  equivalent(other) {
    if (!(other instanceof SchemaValueClass)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    return isEqual(this._charClassRegex, other._charClassRegex) && isEqual(this._wordRegex, other._wordRegex)
  }
}

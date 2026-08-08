import { isEqual } from 'lodash'
import SchemaEntry from './schemaEntry'
import { IssueError } from '../../issues/issues'
/**
 * A generic schema entry with schema attributes.
 */
export default class SchemaEntryWithAttributes extends SchemaEntry {
  /**
   * The set of boolean attributes this schema entry has.
   */
  booleanAttributes
  /**
   * The collection of value attributes this schema entry has.
   */
  valueAttributes
  /**
   * The set of boolean attribute names this schema entry has.
   */
  booleanAttributeNames
  /**
   * The collection of value attribute names this schema entry has.
   */
  valueAttributeNames
  constructor(name, booleanAttributes, valueAttributes) {
    super(name)
    this.booleanAttributes = booleanAttributes
    this.valueAttributes = valueAttributes
    this.booleanAttributeNames = new Set()
    for (const attribute of this.booleanAttributes) {
      this.booleanAttributeNames.add(attribute.name)
    }
    this.valueAttributeNames = new Map()
    for (const [attributeName, value] of this.valueAttributes) {
      this.valueAttributeNames.set(attributeName.name, value)
    }
  }
  /**
   * Determine if this schema entry is equivalent to another schema entry.
   *
   * @remarks
   *
   * Schema entries with attributes are deemed equivalent if they have the same name and equivalent attributes.
   *
   * @param other - A schema entry to compare with this one.
   * @returns Whether the other entry is equivalent to this schema entry.
   */
  equivalent(other) {
    if (!(other instanceof SchemaEntryWithAttributes)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    if (this.booleanAttributes.symmetricDifference(other.booleanAttributes).size > 0) {
      return false
    }
    if (this.valueAttributes.size !== other.valueAttributes.size) {
      return false
    }
    const otherKeys = Array.from(other.valueAttributes.keys())
    for (const [key, value] of this.valueAttributes) {
      const otherKey = otherKeys.find((otherKey) => key.equivalent(otherKey))
      if (
        !otherKey ||
        !isEqual(
          value.toSorted((a, b) => a.localeCompare(b)),
          other.valueAttributes.get(otherKey).toSorted((a, b) => a.localeCompare(b)),
        )
      ) {
        return false
      }
    }
    return true
  }
  /**
   * Whether this schema entry has this attribute (by name).
   *
   * @param attributeName - The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  hasAttribute(attributeName) {
    return this.booleanAttributeNames.has(attributeName) || this.valueAttributeNames.has(attributeName)
  }
  /**
   * Whether this schema entry has this boolean attribute (by name).
   *
   * @param attributeName - The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  hasBooleanAttribute(attributeName) {
    return this.booleanAttributeNames.has(attributeName)
  }
  /**
   * Retrieve a single value of a value attribute (by name) on this schema entry, throwing an error if more than one value exists.
   *
   * @param attributeName - The attribute whose value should be returned.
   * @returns The value of the attribute.
   * @throws {IssueError} If the attribute has more than one value.
   */
  getSingleAttributeValue(attributeName) {
    const attributeValues = this.valueAttributeNames.get(attributeName)
    if (attributeValues === undefined) {
      return undefined
    } else if (attributeValues.length > 1) {
      IssueError.generateAndThrowInternalError(
        `More than one value exists for attribute ${attributeName}, when only one value was expected.`,
      )
    }
    return attributeValues[0]
  }
  /**
   * Retrieve all values of a value attribute (by name) on this schema entry.
   *
   * @param attributeName - The attribute whose value should be returned.
   * @returns The values of the attribute.
   */
  getAttributeValues(attributeName) {
    return this.valueAttributeNames.get(attributeName)
  }
}

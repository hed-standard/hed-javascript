import SchemaEntry from './schemaEntry'
import { IssueError } from '../../issues/issues'

/**
 * A generic schema entry with schema attributes.
 */
export default class SchemaEntryWithAttributes extends SchemaEntry {
  /**
   * The attributes ignored when comparing two declarations of an element: inLibrary names the declaring library and
   * hedId differs between schemas by construction.
   * @type {Set<string>}
   */
  static IGNORED_ATTRIBUTES = new Set(['inLibrary', 'hedId'])

  /**
   * The set of boolean attributes this schema entry has.
   * @type {Set<SchemaAttribute>}
   */
  booleanAttributes

  /**
   * The collection of value attributes this schema entry has.
   * @type {Map<SchemaAttribute, string[]>}
   */
  valueAttributes

  /**
   * The set of boolean attribute names this schema entry has.
   * @type {Set<string>}
   */
  booleanAttributeNames

  /**
   * The collection of value attribute names this schema entry has.
   * @type {Map<string, string[]>}
   */
  valueAttributeNames

  /**
   * Constructor.
   *
   * @param {string} name The name of this schema entry.
   * @param {string|undefined} description The description of this schema entry.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this schema entry.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The value attributes for this schema entry.
   */
  constructor(name, description, booleanAttributes, valueAttributes) {
    super(name, description)
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
   * Entries with attributes are equivalent if they have the same name, description, boolean attributes, and value
   * attributes (by name, values in any order), ignoring inLibrary and hedId.
   *
   * @param {*} other A schema entry to compare with this one.
   * @returns {boolean} Whether the other entry is equivalent to this schema entry.
   */
  equivalent(other) {
    if (!(other instanceof SchemaEntryWithAttributes)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    if (this.booleanAttributeNames.symmetricDifference(other.booleanAttributeNames).size > 0) {
      return false
    }
    const compared = (entry) =>
      [...entry.valueAttributeNames].filter(([name]) => !SchemaEntryWithAttributes.IGNORED_ATTRIBUTES.has(name))
    const ours = compared(this)
    const theirs = new Map(compared(other))
    if (ours.length !== theirs.size) {
      return false
    }
    return ours.every(
      ([name, values]) => theirs.has(name) && SchemaEntryWithAttributes.sameValues(theirs.get(name), values),
    )
  }

  /**
   * Determine whether two lists of attribute values hold the same values in any order.
   *
   * The values are compared as strings, item by item after sorting, so a value containing "|" is not confused with
   * two values.
   *
   * @param {Array} first The first list of values.
   * @param {Array} second The second list of values.
   * @returns {boolean} Whether the two lists hold the same values.
   */
  static sameValues(first, second) {
    if (first.length !== second.length) {
      return false
    }
    const sorted = (values) => [...values].map(String).sort((a, b) => a.localeCompare(b))
    const sortedFirst = sorted(first)
    const sortedSecond = sorted(second)
    return sortedFirst.every((value, index) => value === sortedSecond[index])
  }

  /**
   * Whether this schema entry has this attribute (by name).
   *
   * @param {string} attributeName The attribute to check for.
   * @returns {boolean} Whether this schema entry has this attribute.
   */
  hasAttribute(attributeName) {
    return this.booleanAttributeNames.has(attributeName) || this.valueAttributeNames.has(attributeName)
  }

  /**
   * Whether this schema entry has this boolean attribute (by name).
   *
   * @param {string} attributeName The attribute to check for.
   * @returns {boolean} Whether this schema entry has this attribute.
   */
  hasBooleanAttribute(attributeName) {
    return this.booleanAttributeNames.has(attributeName)
  }

  /**
   * Retrieve a single value of a value attribute (by name) on this schema entry, throwing an error if more than one
   * value exists.
   *
   * @param {string} attributeName The attribute whose value should be returned.
   * @returns {string|undefined} The value of the attribute.
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
   * @param {string} attributeName The attribute whose value should be returned.
   * @returns {string[]|undefined} The values of the attribute.
   */
  getAttributeValues(attributeName) {
    return this.valueAttributeNames.get(attributeName)
  }
}

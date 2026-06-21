import SchemaEntry from './schemaEntry'
import type SchemaAttribute from './attribute'
/**
 * A generic schema entry with schema attributes.
 */
export default class SchemaEntryWithAttributes extends SchemaEntry {
  /**
   * The set of boolean attributes this schema entry has.
   */
  readonly booleanAttributes: Set<SchemaAttribute>
  /**
   * The collection of value attributes this schema entry has.
   */
  readonly valueAttributes: Map<SchemaAttribute, string[]>
  /**
   * The set of boolean attribute names this schema entry has.
   */
  readonly booleanAttributeNames: Set<string>
  /**
   * The collection of value attribute names this schema entry has.
   */
  readonly valueAttributeNames: Map<string, string[]>
  constructor(name: string, booleanAttributes: Set<SchemaAttribute>, valueAttributes: Map<SchemaAttribute, string[]>)
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
  equivalent(other: unknown): boolean
  /**
   * Whether this schema entry has this attribute (by name).
   *
   * @param attributeName - The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  hasAttribute(attributeName: string): boolean
  /**
   * Whether this schema entry has this boolean attribute (by name).
   *
   * @param attributeName - The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  hasBooleanAttribute(attributeName: string): boolean
  /**
   * Retrieve a single value of a value attribute (by name) on this schema entry, throwing an error if more than one value exists.
   *
   * @param attributeName - The attribute whose value should be returned.
   * @returns The value of the attribute.
   * @throws {IssueError} If the attribute has more than one value.
   */
  getSingleAttributeValue(attributeName: string): string | undefined
  /**
   * Retrieve all values of a value attribute (by name) on this schema entry.
   *
   * @param attributeName - The attribute whose value should be returned.
   * @returns The values of the attribute.
   */
  getAttributeValues(attributeName: string): string[] | undefined
}

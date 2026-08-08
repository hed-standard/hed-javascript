/**
 * A generic schema entry.
 */
export default class SchemaEntry {
  /**
   * The name of this schema entry.
   */
  private readonly _name
  constructor(name: string)
  /**
   * The name of this schema entry.
   */
  get name(): string
  /**
   * Determine if this schema entry is equivalent to another schema entry.
   *
   * @remarks
   *
   * Schema entries are deemed equivalent if they have the same name.
   *
   * @param other - A schema entry to compare with this one.
   * @returns Whether the other entry is equivalent to this schema entry.
   */
  equivalent(other: unknown): boolean
  /**
   * Comparator to sort schema entries by their names.
   *
   * @param a - The first entry.
   * @param b - The second entry.
   * @returns The result of calling {@link String.localeCompare} on the two entries' names.
   */
  static sortByName(this: void, a: SchemaEntry, b: SchemaEntry): number
  /**
   * Whether this schema entry has this attribute (by name).
   *
   * This method is a stub to be overridden in {@link SchemaEntryWithAttributes}.
   *
   * @param attributeName - The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  hasBooleanAttribute(attributeName: string): boolean
}

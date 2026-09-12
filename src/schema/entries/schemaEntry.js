/**
 * A generic schema entry.
 */
export default class SchemaEntry {
  /**
   * The name of this schema entry.
   */
  _name
  constructor(name) {
    this._name = name
  }
  /**
   * The name of this schema entry.
   */
  get name() {
    return this._name
  }
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
  equivalent(other) {
    if (!(other instanceof SchemaEntry)) {
      return false
    }
    return this.name === other.name
  }
  /**
   * Comparator to sort schema entries by their names.
   *
   * @param a - The first entry.
   * @param b - The second entry.
   * @returns The result of calling {@link String.localeCompare} on the two entries' names.
   */
  static sortByName(a, b) {
    return a.name.localeCompare(b.name)
  }
  /**
   * Whether this schema entry has this attribute (by name).
   *
   * This method is a stub to be overridden in {@link SchemaEntryWithAttributes}.
   *
   * @param attributeName - The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasBooleanAttribute(attributeName) {
    return false
  }
}

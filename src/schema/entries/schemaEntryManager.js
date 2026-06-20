/**
 * A manager of {@link SchemaEntry} objects.
 */
export default class SchemaEntryManager {
  /**
   * The definitions managed by this entry manager.
   */
  _definitions
  /**
   * Constructor.
   *
   * @param definitions - A map of schema entry definitions.
   */
  constructor(definitions) {
    this._definitions = definitions
  }
  /**
   * Return a copy of the managed definition map.
   */
  get definitions() {
    return new Map(this._definitions)
  }
  /**
   * Iterator over the entry manager's entries.
   */
  [Symbol.iterator]() {
    return this._definitions.entries()
  }
  /**
   * Iterator over the entry manager's keys.
   */
  keys() {
    return this._definitions.keys()
  }
  /**
   * Iterator over the entry manager's keys.
   */
  values() {
    return this._definitions.values()
  }
  /**
   * Determine whether the entry with the given name exists.
   *
   * @param name - The name of the entry.
   * @return Whether the entry exists.
   */
  hasEntry(name) {
    return this._definitions.has(name)
  }
  /**
   * Get the entry with the given name.
   *
   * @param name - The name of the entry to retrieve.
   * @returns The entry with that name.
   */
  getEntry(name) {
    return this._definitions.get(name)
  }
  /**
   * Get a collection of entries with the given boolean attribute.
   *
   * @param booleanAttributeName - The name of boolean attribute to filter on.
   * @returns A subset of the managed collection with the given boolean attribute.
   */
  getEntriesWithBooleanAttribute(booleanAttributeName) {
    return this.filter(([, v]) => {
      return v.hasBooleanAttribute(booleanAttributeName)
    })
  }
  /**
   * Filter the map underlying this manager.
   *
   * @param fn - The filtering function.
   * @returns A subset of the managed collection satisfying the filter.
   */
  filter(fn) {
    const pairArray = Array.from(this._definitions.entries())
    return new Map(pairArray.filter((entry) => fn(entry)))
  }
  /**
   * The number of entries in this collection.
   *
   * @returns The number of entries in this collection.
   */
  get length() {
    return this._definitions.size
  }
}

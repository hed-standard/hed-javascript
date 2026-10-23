/**
 * A manager of {@link SchemaEntry} objects.
 *
 * @template T
 */
export default class SchemaEntryManager {
  /**
   * The definitions managed by this entry manager.
   * @type {Map<string, T>}
   */
  _definitions

  /**
   * Constructor.
   *
   * @param {Map<string, T>} definitions A map of schema entry definitions.
   */
  constructor(definitions) {
    this._definitions = definitions
  }

  /**
   * Return a copy of the managed definition map.
   * @returns {Map<string, T>}
   */
  get definitions() {
    return new Map(this._definitions)
  }

  /**
   * Iterator over the entry manager's entries.
   *
   * @returns {MapIterator<[string, T]>}
   */
  [Symbol.iterator]() {
    return this._definitions.entries()
  }

  /**
   * Iterator over the entry manager's keys.
   *
   * @returns {MapIterator<string>}
   */
  keys() {
    return this._definitions.keys()
  }

  /**
   * Iterator over the entry manager's keys.
   *
   * @returns {MapIterator<T>}
   */
  values() {
    return this._definitions.values()
  }

  /**
   * Determine whether the entry with the given name exists.
   *
   * @param {string} name The name of the entry.
   * @returns {boolean} Whether the entry exists.
   */
  hasEntry(name) {
    return this._definitions.has(name)
  }

  /**
   * Get the entry with the given name.
   *
   * @param {string} name The name of the entry to retrieve.
   * @returns {T|undefined} The entry with that name.
   */
  getEntry(name) {
    return this._definitions.get(name)
  }

  /**
   * Get a collection of entries with the given boolean attribute.
   *
   * @param {string} booleanAttributeName The name of boolean attribute to filter on.
   * @returns {Map<string, T>} A subset of the managed collection with the given boolean attribute.
   */
  getEntriesWithBooleanAttribute(booleanAttributeName) {
    return this.filter(([, v]) => {
      return v.hasBooleanAttribute(booleanAttributeName)
    })
  }

  /**
   * Filter the map underlying this manager.
   *
   * @param {function([string, T]): boolean} fn The filtering function.
   * @returns {Map<string, T>} A subset of the managed collection satisfying the filter.
   */
  filter(fn) {
    const pairArray = Array.from(this._definitions.entries())
    return new Map(pairArray.filter((entry) => fn(entry)))
  }

  /**
   * The number of entries in this collection.
   *
   * @returns {number} The number of entries in this collection.
   */
  get length() {
    return this._definitions.size
  }
}

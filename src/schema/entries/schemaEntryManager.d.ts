import type SchemaEntry from './schemaEntry'
/**
 * A manager of {@link SchemaEntry} objects.
 */
export default class SchemaEntryManager<T extends SchemaEntry> {
  /**
   * The definitions managed by this entry manager.
   */
  private readonly _definitions
  /**
   * Constructor.
   *
   * @param definitions - A map of schema entry definitions.
   */
  constructor(definitions: Map<string, T>)
  /**
   * Return a copy of the managed definition map.
   */
  get definitions(): Map<string, T>
  /**
   * Iterator over the entry manager's entries.
   */
  [Symbol.iterator](): MapIterator<[string, T]>
  /**
   * Iterator over the entry manager's keys.
   */
  keys(): MapIterator<string>
  /**
   * Iterator over the entry manager's keys.
   */
  values(): MapIterator<T>
  /**
   * Determine whether the entry with the given name exists.
   *
   * @param name - The name of the entry.
   * @return Whether the entry exists.
   */
  hasEntry(name: string): boolean
  /**
   * Get the entry with the given name.
   *
   * @param name - The name of the entry to retrieve.
   * @returns The entry with that name.
   */
  getEntry(name: string): T | undefined
  /**
   * Get a collection of entries with the given boolean attribute.
   *
   * @param booleanAttributeName - The name of boolean attribute to filter on.
   * @returns A subset of the managed collection with the given boolean attribute.
   */
  getEntriesWithBooleanAttribute(booleanAttributeName: string): Map<string, T>
  /**
   * Filter the map underlying this manager.
   *
   * @param fn - The filtering function.
   * @returns A subset of the managed collection satisfying the filter.
   */
  filter(fn: (entry: [string, T]) => boolean): Map<string, T>
  /**
   * The number of entries in this collection.
   *
   * @returns The number of entries in this collection.
   */
  get length(): number
}

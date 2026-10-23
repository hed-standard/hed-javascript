/**
 * A generic schema entry.
 */
export default class SchemaEntry {
  /**
   * The name of this schema entry.
   * @type {string}
   */
  _name

  /**
   * The description of this schema entry.
   * @type {string|undefined}
   */
  _description

  /**
   * Constructor.
   *
   * @param {string} name The name of this schema entry.
   * @param {string|undefined} description The description of this schema entry.
   */
  constructor(name, description) {
    this._name = name
    this._description = description
  }

  /**
   * The name of this schema entry.
   * @returns {string}
   */
  get name() {
    return this._name
  }

  /**
   * The description of this schema entry.
   * @returns {string|undefined}
   */
  get description() {
    return this._description
  }

  /**
   * Determine if this schema entry is equivalent to another schema entry.
   *
   * Schema entries are equivalent if they have the same name and description. Subclasses compare more.
   *
   * @param {*} other A schema entry to compare with this one.
   * @returns {boolean} Whether the other entry is equivalent to this schema entry.
   */
  equivalent(other) {
    if (!(other instanceof SchemaEntry)) {
      return false
    }
    return this.name === other.name && this.description === other.description
  }

  /**
   * Comparator to sort schema entries by their names.
   *
   * @param {SchemaEntry} a The first entry.
   * @param {SchemaEntry} b The second entry.
   * @returns {number} The result of calling {@link String.localeCompare} on the two entries' names.
   */
  static sortByName(a, b) {
    return a.name.localeCompare(b.name)
  }

  /**
   * Whether this schema entry has this attribute (by name).
   *
   * This method is a stub to be overridden in {@link SchemaEntryWithAttributes}.
   *
   * @param {string} attributeName The attribute to check for.
   * @returns {boolean} Whether this schema entry has this attribute.
   */
  // eslint-disable-next-line no-unused-vars
  hasBooleanAttribute(attributeName) {
    return false
  }
}

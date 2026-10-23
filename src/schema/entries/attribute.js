import SchemaEntry from './schemaEntry'

/**
 * A schema attribute.
 */
export default class SchemaAttribute extends SchemaEntry {
  /**
   * The properties assigned to this schema attribute, one for each property name written in its declaration (a name
   * the schema does not define is an unregistered property of that name).
   * @type {Set<SchemaProperty>}
   */
  _properties

  /**
   * Whether this attribute is recursive.
   * @type {boolean}
   */
  _recursive

  /**
   * Constructor.
   *
   * @param {string} name The name of the schema attribute.
   * @param {string|undefined} description The description of the schema attribute.
   * @param {Set<SchemaProperty>} properties The properties assigned to this schema attribute.
   * @param {boolean} recursive Whether this attribute is recursive.
   */
  constructor(name, description, properties, recursive) {
    super(name, description)
    this._properties = properties
    this._recursive = recursive
  }

  /**
   * The collection of properties for this schema attribute.
   * @returns {Set<SchemaProperty>}
   */
  get properties() {
    return new Set(this._properties)
  }

  /**
   * Whether this attribute is recursive.
   * @returns {boolean}
   */
  get recursive() {
    return this._recursive
  }

  /**
   * Determine if this schema attribute is equivalent to another schema attribute.
   *
   * Schema attributes are equivalent if they have the same name, description, and property names, including names
   * the schema does not define (specification 3.1.2.4).
   *
   * @param {*} other A schema attribute to compare with this one.
   * @returns {boolean} Whether the other attribute is equivalent to this schema attribute.
   */
  equivalent(other) {
    if (!(other instanceof SchemaAttribute)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    const propertyNames = new Set([...this._properties].map((property) => property.name))
    const otherPropertyNames = new Set([...other.properties].map((property) => property.name))
    return propertyNames.symmetricDifference(otherPropertyNames).size === 0
  }
}

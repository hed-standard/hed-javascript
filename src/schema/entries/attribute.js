import SchemaEntry from './schemaEntry'
/**
 * A schema attribute.
 */
export default class SchemaAttribute extends SchemaEntry {
  /**
   * The set of all attribute names which are always recursive.
   */
  static ALWAYS_RECURSIVE = new Set(['extensionAllowed'])
  /**
   * The properties assigned to this schema attribute.
   */
  _properties
  /**
   * Whether this attribute is recursive.
   */
  _recursive
  /**
   * Constructor.
   *
   * @param name - The name of the schema attribute.
   * @param properties - The properties assigned to this schema attribute.
   * @param recursive - Whether this attribute is recursive.
   */
  constructor(name, properties, recursive) {
    super(name)
    this._properties = properties
    this._recursive = recursive || SchemaAttribute.ALWAYS_RECURSIVE.has(name)
  }
  /**
   * The collection of properties for this schema attribute.
   */
  get properties() {
    return new Set(this._properties)
  }
  /**
   * Whether this attribute is recursive.
   */
  get recursive() {
    return this._recursive
  }
  /**
   * Determine if this schema attribute is equivalent to another schema attribute.
   *
   * @remarks
   *
   * Schema attributes are deemed equivalent if they have the same name and properties.
   *
   * @param other - A schema attribute to compare with this one.
   * @returns Whether the other attribute is equivalent to this schema attribute.
   */
  equivalent(other) {
    if (!(other instanceof SchemaAttribute)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    return this.properties.symmetricDifference(other.properties).size === 0
  }
}

import SchemaEntryWithAttributes from './schemaEntryWithAttributes'

/**
 * A schema unit modifier.
 */
export default class SchemaUnitModifier extends SchemaEntryWithAttributes {
  /**
   * Determine if this schema unit modifier is equivalent to another schema unit modifier.
   *
   * Schema unit modifiers are equivalent if they have the same name, description, and attributes.
   *
   * @param {*} other A schema unit modifier to compare with this one.
   * @returns {boolean} Whether the other unit modifier is equivalent to this schema unit modifier.
   */
  equivalent(other) {
    if (!(other instanceof SchemaUnitModifier)) {
      return false
    }
    return super.equivalent(other)
  }
}

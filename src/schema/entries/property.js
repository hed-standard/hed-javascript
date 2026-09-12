import SchemaEntry from './schemaEntry'
/**
 * A schema property.
 */
export default class SchemaProperty extends SchemaEntry {
  /**
   * Determine if this schema property is equivalent to another schema property.
   *
   * @remarks
   *
   * Schema properties are deemed equivalent if they have the same name and equivalent attributes.
   *
   * @param other - A schema property to compare with this one.
   * @returns Whether the other property is equivalent to this schema property.
   */
  equivalent(other) {
    if (!(other instanceof SchemaProperty)) {
      return false
    }
    return super.equivalent(other)
  }
}

import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
/**
 * A schema unit modifier.
 */
export default class SchemaUnitModifier extends SchemaEntryWithAttributes {
  /**
   * Determine if this schema unit modifier is equivalent to another schema unit modifier.
   *
   * @remarks
   *
   * Schema unit modifiers are deemed equivalent if they have the same name and equivalent attributes.
   *
   * @param other - A schema unit modifier to compare with this one.
   * @returns Whether the other unit modifier is equivalent to this schema unit modifier.
   */
  equivalent(other: unknown): boolean
}

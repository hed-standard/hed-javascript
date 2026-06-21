import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
import type SchemaUnit from './unit'
import type SchemaAttribute from './attribute'
/**
 * A schema unit class.
 */
export default class SchemaUnitClass extends SchemaEntryWithAttributes {
  /**
   * The units for this unit class.
   */
  private readonly _units
  /**
   * Constructor.
   *
   * @param name - The name of this unit class.
   * @param booleanAttributes - The boolean attributes for this unit class.
   * @param valueAttributes - The value attributes for this unit class.
   * @param units - The units for this unit class.
   */
  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    units: Map<string, SchemaUnit>,
  )
  /**
   * Get the units for this unit class.
   */
  get units(): Map<string, SchemaUnit>
  /**
   * Get the default unit for this unit class.
   */
  get defaultUnit(): SchemaUnit | undefined
  /**
   * Determine if this schema unit class is equivalent to another schema unit class.
   *
   * @remarks
   *
   * Schema unit classes are deemed equivalent if they have the same name and equivalent attributes.
   *
   * @param other - A schema unit class to compare with this one.
   * @returns Whether the other unit class is equivalent to this schema unit class.
   */
  equivalent(other: unknown): boolean
  /**
   * Extract the unit class and remainder.
   *
   * @param value - A value-containing string.
   * @returns A tuple with the unit class, unit string, and value string
   */
  extractUnit(value: string): [SchemaUnit | null, string | null, string]
}

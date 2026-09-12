import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
import type SchemaAttribute from './attribute'
import type SchemaUnitModifier from './unitModifier'
import type SchemaEntryManager from './schemaEntryManager'
/**
 * A schema unit.
 */
export default class SchemaUnit extends SchemaEntryWithAttributes {
  /**
   * The legal derivatives of this unit.
   */
  private readonly _derivativeUnits
  /**
   * Constructor.
   *
   * @param name - The name of the unit.
   * @param booleanAttributes - This unit's boolean attributes.
   * @param valueAttributes - This unit's key-value attributes.
   * @param unitModifiers - The collection of unit modifiers.
   */
  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    unitModifiers: SchemaEntryManager<SchemaUnitModifier>,
  )
  private _pushPluralUnit
  derivativeUnits(): Generator<string, void, void>
  get isPrefixUnit(): boolean
  get isSIUnit(): boolean
  get isUnitSymbol(): boolean
  /**
   * Determine if this schema unit is equivalent to another schema unit.
   *
   * @remarks
   *
   * Schema units are deemed equivalent if they have the same name and equivalent attributes.
   *
   * @param other - A schema unit to compare with this one.
   * @returns Whether the other unit is equivalent to this schema unit.
   */
  equivalent(other: unknown): boolean
  /**
   * Determine if a value has this unit.
   *
   * @param value - Either the whole value or the part after a blank (if not a prefix unit)
   * @returns Whether the value has these units.
   */
  validateUnit(value: string): boolean
}

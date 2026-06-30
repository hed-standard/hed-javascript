import pluralize from 'pluralize'
pluralize.addUncountableRule('hertz')
import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
/**
 * A schema unit.
 */
export default class SchemaUnit extends SchemaEntryWithAttributes {
  /**
   * The legal derivatives of this unit.
   */
  _derivativeUnits
  /**
   * Constructor.
   *
   * @param name - The name of the unit.
   * @param booleanAttributes - This unit's boolean attributes.
   * @param valueAttributes - This unit's key-value attributes.
   * @param unitModifiers - The collection of unit modifiers.
   */
  constructor(name, booleanAttributes, valueAttributes, unitModifiers) {
    super(name, booleanAttributes, valueAttributes)
    this._derivativeUnits = [name]
    if (!this.isSIUnit) {
      this._pushPluralUnit()
      return
    }
    if (this.isUnitSymbol) {
      const SIUnitSymbolModifiers = unitModifiers.getEntriesWithBooleanAttribute('SIUnitSymbolModifier')
      for (const modifierName of SIUnitSymbolModifiers.keys()) {
        this._derivativeUnits.push(modifierName + name)
      }
    } else {
      const SIUnitModifiers = unitModifiers.getEntriesWithBooleanAttribute('SIUnitModifier')
      const pluralUnit = this._pushPluralUnit()
      for (const modifierName of SIUnitModifiers.keys()) {
        this._derivativeUnits.push(modifierName + name, modifierName + pluralUnit)
      }
    }
  }
  _pushPluralUnit() {
    if (!this.isUnitSymbol) {
      const pluralUnit = pluralize.plural(this.name)
      this._derivativeUnits.push(pluralUnit)
      return pluralUnit
    }
    return null
  }
  *derivativeUnits() {
    for (const unit of this._derivativeUnits) {
      yield unit
    }
  }
  get isPrefixUnit() {
    return this.hasAttribute('unitPrefix')
  }
  get isSIUnit() {
    return this.hasAttribute('SIUnit')
  }
  get isUnitSymbol() {
    return this.hasAttribute('unitSymbol')
  }
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
  equivalent(other) {
    if (!(other instanceof SchemaUnit)) {
      return false
    }
    return super.equivalent(other)
  }
  /**
   * Determine if a value has this unit.
   *
   * @param value - Either the whole value or the part after a blank (if not a prefix unit)
   * @returns Whether the value has these units.
   */
  validateUnit(value) {
    if (value == null || value === '') {
      return false
    }
    if (this.isPrefixUnit) {
      return value.startsWith(this.name)
    }
    for (const dUnit of this.derivativeUnits()) {
      if (value === dUnit) {
        return true
      }
    }
    return false
  }
}

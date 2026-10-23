import pluralize from 'pluralize'
pluralize.addUncountableRule('hertz')

import SchemaEntryWithAttributes from './schemaEntryWithAttributes'

/**
 * A schema unit.
 */
export default class SchemaUnit extends SchemaEntryWithAttributes {
  /**
   * The legal derivatives of this unit (non-compound units only): the name, its plural, and modified forms.
   * @type {string[]}
   */
  _derivativeUnits

  /**
   * The SI modifiers this unit accepts, mapped to their conversion factors (null if a modifier has none).
   * @type {Map<string, number|null>}
   */
  _modifierFactors

  /**
   * The components of a compound SI unit such as m-per-s^2, or null for every other unit.
   * @type {Array<{base: string, exponent: number, text: string}>|null}
   */
  _compoundComponents

  /**
   * Constructor.
   *
   * @param {string} name The name of this unit.
   * @param {string|undefined} description The description of this unit.
   * @param {Set<SchemaAttribute>} booleanAttributes This unit's boolean attributes.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes This unit's key-value attributes.
   * @param {SchemaEntryManager<SchemaUnitModifier>} unitModifiers The collection of unit modifiers (of every schema
   *     in the merge group, since units are built after the unit modifiers have been merged).
   */
  constructor(name, description, booleanAttributes, valueAttributes, unitModifiers) {
    super(name, description, booleanAttributes, valueAttributes)
    this._buildForms(unitModifiers)
  }

  /**
   * Build the accepted forms of this unit from the collection of unit modifiers.
   *
   * @param {SchemaEntryManager<SchemaUnitModifier>} unitModifiers The collection of unit modifiers.
   * @private
   */
  _buildForms(unitModifiers) {
    this._derivativeUnits = [this.name]
    this._modifierFactors = new Map()
    this._compoundComponents = null
    if (!this.isSIUnit) {
      this._pushPluralUnit()
      return
    }
    const modifierAttribute = this.isUnitSymbol ? 'SIUnitSymbolModifier' : 'SIUnitModifier'
    for (const [modifierName, modifier] of unitModifiers.getEntriesWithBooleanAttribute(modifierAttribute)) {
      this._modifierFactors.set(modifierName, SchemaUnit._parseFactor(modifier))
    }
    this._compoundComponents = this._parseCompoundComponents()
    if (this._compoundComponents !== null) {
      // A compound unit takes one modifier per component and is matched by validateUnit, not from a list.
      return
    }
    const pluralUnit = this._pushPluralUnit()
    for (const modifierName of this._modifierFactors.keys()) {
      this._derivativeUnits.push(modifierName + this.name)
      if (pluralUnit !== null) {
        this._derivativeUnits.push(modifierName + pluralUnit)
      }
    }
  }

  /**
   * Parse the conversionFactor attribute of a unit or unit modifier.
   *
   * @param {SchemaEntryWithAttributes} entry A unit or unit modifier.
   * @returns {number|null} The factor, or null if the entry has none or it is not a number.
   * @private
   */
  static _parseFactor(entry) {
    const text = entry.getSingleAttributeValue('conversionFactor')
    if (text === undefined) {
      return null
    }
    // Schemas write factors as decimals (0.001), in e-notation (1e-6), or as powers (10^-6).
    const [base, exponent, ...extra] = String(text).split('^')
    const factor = exponent === undefined ? Number(base) : Number(base) ** Number(exponent)
    return extra.length === 0 && Number.isFinite(factor) ? factor : null
  }

  /**
   * Split a compound SI unit name (one containing "-per-" or "^") into its components.
   *
   * @returns {Array<{base: string, exponent: number, text: string}>|null} One entry per component in name order
   *     (the first is the numerator, the rest are denominators), or null if this is not a compound unit.
   * @private
   */
  _parseCompoundComponents() {
    if (!this.name.includes('-per-') && !this.name.includes('^')) {
      return null
    }
    const components = []
    for (const text of this.name.split('-per-')) {
      const [base, exponentText, ...extra] = text.split('^')
      if (base === '' || extra.length > 0) {
        return null
      }
      const exponent = exponentText === undefined ? 1 : Number(exponentText)
      if (!Number.isInteger(exponent)) {
        return null
      }
      components.push({ base: base, exponent: exponent, text: text })
    }
    return components
  }

  /**
   * Match a unit string against this compound unit, allowing one SI modifier per component.
   *
   * @param {string} value The unit string.
   * @returns {string[]|null} The modifier used for each component ('' for none), or null if no match.
   * @private
   */
  _matchCompound(value) {
    const parts = value.split('-per-')
    if (parts.length !== this._compoundComponents.length) {
      return null
    }
    const modifiers = []
    for (const [index, part] of parts.entries()) {
      const expected = this._compoundComponents[index].text
      if (!part.endsWith(expected)) {
        return null
      }
      const modifier = part.slice(0, part.length - expected.length)
      if (modifier !== '' && !this._modifierFactors.has(modifier)) {
        return null
      }
      modifiers.push(modifier)
    }
    return modifiers
  }

  /**
   * Add the plural of this unit's name to its derivatives, unless the unit is a symbol.
   *
   * @returns {string|null} The plural, or null for a unit symbol.
   * @private
   */
  _pushPluralUnit() {
    if (!this.isUnitSymbol) {
      const pluralUnit = pluralize.plural(this.name)
      this._derivativeUnits.push(pluralUnit)
      return pluralUnit
    }
    return null
  }

  /**
   * The legal derivatives of this unit.
   *
   * @yields {string} Each derivative unit string.
   */
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
   * Schema units are equivalent if they have the same name, description, and attributes.
   *
   * @param {*} other A schema unit to compare with this one.
   * @returns {boolean} Whether the other unit is equivalent to this schema unit.
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
   * @param {string} value Either the whole value or the part after a blank (if not a prefix unit).
   * @returns {boolean} Whether the value has these units.
   */
  validateUnit(value) {
    if (value == null || value === '') {
      return false
    }
    if (this.isPrefixUnit) {
      return value.startsWith(this.name)
    }
    if (this._compoundComponents !== null) {
      return this._matchCompound(value) !== null
    }
    for (const dUnit of this.derivativeUnits()) {
      if (value === dUnit) {
        return true
      }
    }
    return false
  }

  /**
   * Get the factor that converts a value given in a form of this unit to the unit class's base unit.
   *
   * @param {string} value A unit string accepted by validateUnit.
   * @returns {number|null} The conversion factor, or null if this unit has no conversionFactor, the string is not
   *     a form of this unit, or a modifier used has no conversionFactor.
   */
  conversionFactor(value) {
    const baseFactor = SchemaUnit._parseFactor(this)
    if (baseFactor === null || !this.validateUnit(value)) {
      return null
    }
    const modifierFactor =
      this._compoundComponents === null ? this._simpleModifierFactor(value) : this._compoundModifierFactor(value)
    return modifierFactor === null ? null : baseFactor * modifierFactor
  }

  /**
   * Get the combined factor of the modifiers in a form of this compound unit.
   *
   * @param {string} value A unit string accepted by validateUnit.
   * @returns {number|null} The factor (1 when no modifier is used), or null if a modifier used has no factor.
   * @private
   */
  _compoundModifierFactor(value) {
    let factor = 1
    for (const [index, modifier] of this._matchCompound(value).entries()) {
      if (modifier === '') {
        continue
      }
      const modifierFactor = this._modifierFactors.get(modifier)
      if (modifierFactor === null) {
        return null
      }
      const exponent = this._compoundComponents[index].exponent
      factor *= modifierFactor ** (index === 0 ? exponent : -exponent)
    }
    return factor
  }

  /**
   * Get the factor of the modifier in a form of this non-compound unit.
   *
   * @param {string} value A unit string accepted by validateUnit.
   * @returns {number|null} The factor (1 when no modifier is used), or null if the modifier used has no factor.
   * @private
   */
  _simpleModifierFactor(value) {
    const plainForms = this._plainForms()
    if (this.isPrefixUnit || plainForms.includes(value)) {
      return 1
    }
    const modifier = [...this._modifierFactors.keys()].find(
      (name) => value.startsWith(name) && plainForms.includes(value.slice(name.length)),
    )
    return modifier === undefined ? null : this._modifierFactors.get(modifier)
  }

  /**
   * Determine whether a unit string is this unit written without an SI modifier.
   *
   * @param {string} value A unit string.
   * @returns {boolean} True if the string is this unit's name (a compound unit such as m-per-s included) or, for a
   *     unit that is not a symbol, its plural.
   */
  isUnmodifiedForm(value) {
    if (value === this.name) {
      return true
    }
    return this._compoundComponents === null && this._plainForms().includes(value)
  }

  /**
   * The forms of this non-compound unit without a modifier: the name and, unless it is a symbol, its plural.
   *
   * @returns {string[]} The unmodified forms.
   * @private
   */
  _plainForms() {
    return this.isUnitSymbol ? [this.name] : [this.name, this._derivativeUnits[1]]
  }
}

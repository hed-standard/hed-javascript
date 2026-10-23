import SchemaEntryWithAttributes from './schemaEntryWithAttributes'

/**
 * A schema unit class.
 */
export default class SchemaUnitClass extends SchemaEntryWithAttributes {
  /**
   * The units for this unit class.
   * @type {Map<string, SchemaUnit>}
   */
  _units

  /**
   * Constructor.
   *
   * @param {string} name The name of this unit class.
   * @param {string|undefined} description The description of this unit class.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this unit class.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The value attributes for this unit class.
   * @param {Map<string, SchemaUnit>} units The units for this unit class.
   */
  constructor(name, description, booleanAttributes, valueAttributes, units) {
    super(name, description, booleanAttributes, valueAttributes)
    this._units = units
  }

  /**
   * Get the units for this unit class.
   * @returns {Map<string, SchemaUnit>}
   */
  get units() {
    return new Map(this._units)
  }

  /**
   * Get the default unit for this unit class.
   *
   * A listed unit wins; otherwise the unit that the default derives from (A for mA, Ohm for kOhm) is matched.
   *
   * @returns {SchemaUnit|undefined}
   */
  get defaultUnit() {
    const attributeValue = this.getSingleAttributeValue('defaultUnits')
    if (attributeValue === undefined) {
      return undefined
    }
    return (
      this._units.get(attributeValue) ?? [...this._units.values()].find((unit) => unit.validateUnit(attributeValue))
    )
  }

  /**
   * Whether any unit of this unit class has a conversionFactor (none of the timeUnits of HED 8.0.0 does).
   * @returns {boolean}
   */
  get hasConversionFactors() {
    return [...this._units.values()].some((unit) => unit.hasAttribute('conversionFactor'))
  }

  /**
   * Determine if this schema unit class is equivalent to another schema unit class.
   *
   * The units are not compared: two declarations of a unit class may list different units, which are merged, and
   * the units themselves are compared one by one by the parser.
   *
   * @param {*} other A schema unit class to compare with this one.
   * @returns {boolean} Whether the other unit class is equivalent to this schema unit class.
   */
  equivalent(other) {
    if (!(other instanceof SchemaUnitClass)) {
      return false
    }
    return super.equivalent(other)
  }

  /**
   * Extract the unit class and remainder.
   *
   * @param {string} value The value part of a tag, possibly ending in a unit.
   * @param {boolean} listedOnly Whether to match only unit names as listed in the schema (no plurals or modifiers).
   * @returns {[SchemaUnit|null, string|null, string]} A tuple with the unit, unit string, and value string.
   */
  extractUnit(value, listedOnly = false) {
    let actualUnit = null // The Unit class of the value
    let actualValueString // The actual value part of the value
    let actualUnitString
    let lastPart
    let firstPart
    const index = value.indexOf(' ')
    if (index !== -1) {
      lastPart = value.slice(index + 1)
      firstPart = value.slice(0, index)
    } else {
      // no blank -- there are no units
      return [null, null, value]
    }
    actualValueString = firstPart
    actualUnitString = lastPart
    for (const unit of this._units.values()) {
      if (!unit.isPrefixUnit && (listedOnly ? lastPart === unit.name : unit.validateUnit(lastPart))) {
        // Checking if it is non-prefixed unit
        actualValueString = firstPart
        actualUnitString = lastPart
        actualUnit = unit
        break
      } else if (!unit.isPrefixUnit) {
        continue
      }
      if (unit.validateUnit(firstPart)) {
        actualUnit = unit
        actualValueString = value.substring(unit.name.length + 1)
        actualUnitString = unit.name
        break
      }
      // If it got here, can only be a prefix Unit
    }
    return [actualUnit, actualUnitString, actualValueString]
  }
}

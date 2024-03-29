import pluralize from 'pluralize'

import { getParentTag, getTagName } from '../../../utils/hedStrings'

const unitPrefixType = 'unitPrefix'
const unitSymbolType = 'unitSymbol'
const SIUnitKey = 'SIUnit'
const SIUnitModifierKey = 'SIUnitModifier'
const SIUnitSymbolModifierKey = 'SIUnitSymbolModifier'

/**
 * Validate a unit and strip it from the value.
 * @param {string} originalTagUnitValue The unformatted version of the value.
 * @param {string[]} tagUnitClassUnits The list of valid units for this tag.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @returns {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
 */
export const validateUnits = function (originalTagUnitValue, tagUnitClassUnits, hedSchemaAttributes) {
  const validUnits = getAllUnits(hedSchemaAttributes)
  validUnits.sort((first, second) => {
    return second.length - first.length
  })
  let actualUnit = getTagName(originalTagUnitValue, ' ')
  let noUnitFound = false
  if (actualUnit === originalTagUnitValue) {
    actualUnit = ''
    noUnitFound = true
  }
  let foundUnit, foundWrongCaseUnit, strippedValue
  for (const unit of validUnits) {
    const isUnitSymbol = hedSchemaAttributes.unitAttributes[unitSymbolType][unit] !== undefined
    const derivativeUnits = getValidDerivativeUnits(unit, hedSchemaAttributes)
    for (const derivativeUnit of derivativeUnits) {
      if (isPrefixUnit(unit, hedSchemaAttributes) && originalTagUnitValue.startsWith(derivativeUnit)) {
        foundUnit = true
        noUnitFound = false
        strippedValue = originalTagUnitValue.substring(derivativeUnit.length).trim()
      }
      if (actualUnit === derivativeUnit) {
        foundUnit = true
        strippedValue = getParentTag(originalTagUnitValue, ' ')
      } else if (actualUnit.toLowerCase() === derivativeUnit.toLowerCase()) {
        if (isUnitSymbol) {
          foundWrongCaseUnit = true
        } else {
          foundUnit = true
        }
        strippedValue = getParentTag(originalTagUnitValue, ' ')
      }
      if (foundUnit) {
        const unitIsValid = tagUnitClassUnits.includes(unit)
        return [true, unitIsValid, strippedValue]
      }
    }
    if (foundWrongCaseUnit) {
      return [true, false, strippedValue]
    }
  }
  return [!noUnitFound, false, originalTagUnitValue]
}

/**
 * Determine whether a unit is a valid prefix unit.
 *
 * @param {string} unit A unit string.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @returns {boolean} Whether the unit is a valid prefix unit.
 */
const isPrefixUnit = function (unit, hedSchemaAttributes) {
  if (unitPrefixType in hedSchemaAttributes.unitAttributes) {
    return hedSchemaAttributes.unitAttributes[unitPrefixType][unit] || false
  } else {
    return unit === '$'
  }
}

/**
 * Get the list of valid derivatives of a unit.
 *
 * @param {string} unit A unit string.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @returns {string[]} The list of valid derivative units.
 */
const getValidDerivativeUnits = function (unit, hedSchemaAttributes) {
  const pluralUnits = [unit]
  const isUnitSymbol = hedSchemaAttributes.unitAttributes[unitSymbolType][unit] !== undefined
  if (hedSchemaAttributes.hasUnitModifiers && !isUnitSymbol) {
    pluralUnits.push(pluralize.plural(unit))
  }
  const isSIUnit = hedSchemaAttributes.unitAttributes[SIUnitKey][unit] !== undefined
  if (isSIUnit && hedSchemaAttributes.hasUnitModifiers) {
    const derivativeUnits = [].concat(pluralUnits)
    const modifierKey = isUnitSymbol ? SIUnitSymbolModifierKey : SIUnitModifierKey
    for (const unitModifier of Object.keys(hedSchemaAttributes.unitModifiers[modifierKey])) {
      for (const plural of pluralUnits) {
        derivativeUnits.push(unitModifier + plural)
      }
    }
    return derivativeUnits
  } else {
    return pluralUnits
  }
}

/**
 * Get the legal units for a particular HED tag.
 */
const getAllUnits = function (hedSchemaAttributes) {
  return Object.values(hedSchemaAttributes.unitClasses).flat()
}

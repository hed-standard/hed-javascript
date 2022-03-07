const pluralize = require('pluralize')
pluralize.addUncountableRule('hertz')

const lt = require('semver/functions/lt')

const { isNumber } = require('./string')

const tagsDictionaryKey = 'tags'
const unitClassType = 'unitClass'
const unitClassUnitsType = 'units'
const unitPrefixType = 'unitPrefix'
const unitSymbolType = 'unitSymbol'
const SIUnitKey = 'SIUnit'
const SIUnitModifierKey = 'SIUnitModifier'
const SIUnitSymbolModifierKey = 'SIUnitSymbolModifier'

/**
 * Replace the end of a HED tag with a pound sign.
 */
const replaceTagNameWithPound = function (formattedTag) {
  const lastTagSlashIndex = formattedTag.lastIndexOf('/')
  if (lastTagSlashIndex !== -1) {
    return formattedTag.substring(0, lastTagSlashIndex) + '/#'
  } else {
    return '#'
  }
}

/**
 * Get the indices of all slashes in a HED tag.
 */
const getTagSlashIndices = function (tag) {
  const indices = []
  let i = -1
  while ((i = tag.indexOf('/', i + 1)) >= 0) {
    indices.push(i)
  }
  return indices
}

/**
 * Get the last part of a HED tag.
 *
 * @param {string} tag A HED tag
 * @param {string} character The character to use as a separator.
 * @return {string} The last part of the tag using the given separator.
 */
const getTagName = function (tag, character = '/') {
  const lastSlashIndex = tag.lastIndexOf(character)
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(lastSlashIndex + 1)
  }
}

/**
 * Get the HED tag prefix (up to the last slash).
 */
const getParentTag = function (tag, character = '/') {
  const lastSlashIndex = tag.lastIndexOf(character)
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(0, lastSlashIndex)
  }
}

const openingGroupCharacter = '('
const closingGroupCharacter = ')'

/**
 * Determine whether a HED string is a group (surrounded by parentheses).
 *
 * @param {string} hedString A HED string.
 */
const hedStringIsAGroup = function (hedString) {
  const trimmedHedString = hedString.trim()
  return (
    trimmedHedString.startsWith(openingGroupCharacter) &&
    trimmedHedString.endsWith(closingGroupCharacter)
  )
}

/**
 * Return a copy of a group tag with the surrounding parentheses removed.
 *
 * @param {string} tagGroup A tag group string.
 */
const removeGroupParentheses = function (tagGroup) {
  return tagGroup.slice(1, -1)
}

const hed2ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; :]+$/
const hed3ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; ]+$/
/**
 * Determine if a stripped value is valid.
 */
const validateValue = function (value, isNumeric, isHed3) {
  if (value === '#') {
    return true
  }
  if (isNumeric) {
    return isNumber(value)
  }
  if (isHed3) {
    return hed3ValidValueCharacters.test(value)
  } else {
    return hed2ValidValueCharacters.test(value)
  }
}

/**
 * Determine whether a unit is a valid prefix unit.
 *
 * @param {string} unit A unit string.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @return {boolean} Whether the unit is a valid prefix unit.
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
 * @return {string[]} The list of valid derivative units.
 */
const getValidDerivativeUnits = function (unit, hedSchemaAttributes) {
  const pluralUnits = [unit]
  const isUnitSymbol =
    hedSchemaAttributes.unitAttributes[unitSymbolType][unit] !== undefined
  if (hedSchemaAttributes.hasUnitModifiers && !isUnitSymbol) {
    pluralUnits.push(pluralize.plural(unit))
  }
  const isSIUnit =
    hedSchemaAttributes.unitAttributes[SIUnitKey][unit] !== undefined
  if (isSIUnit && hedSchemaAttributes.hasUnitModifiers) {
    const derivativeUnits = [].concat(pluralUnits)
    const modifierKey = isUnitSymbol
      ? SIUnitSymbolModifierKey
      : SIUnitModifierKey
    for (const unitModifier in hedSchemaAttributes.unitModifiers[modifierKey]) {
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
 * Validate a unit and strip it from the value.
 * @param {string} originalTagUnitValue The unformatted version of the value.
 * @param {string[]} tagUnitClassUnits The list of valid units for this tag.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @return {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
 */
const validateUnits = function (
  originalTagUnitValue,
  tagUnitClassUnits,
  hedSchemaAttributes,
) {
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
    const isUnitSymbol =
      hedSchemaAttributes.unitAttributes[unitSymbolType][unit] !== undefined
    const derivativeUnits = getValidDerivativeUnits(unit, hedSchemaAttributes)
    for (const derivativeUnit of derivativeUnits) {
      if (
        isPrefixUnit(unit, hedSchemaAttributes) &&
        originalTagUnitValue.startsWith(derivativeUnit)
      ) {
        foundUnit = true
        noUnitFound = false
        strippedValue = originalTagUnitValue
          .substring(derivativeUnit.length)
          .trim()
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
 * Get the legal units for a particular HED tag.
 */
const getAllUnits = function (hedSchemaAttributes) {
  const units = []
  for (const unitClass in hedSchemaAttributes.unitClasses) {
    const unitClassUnits = hedSchemaAttributes.unitClasses[unitClass]
    Array.prototype.push.apply(units, unitClassUnits)
  }
  return units
}

/**
 * Determine the HED generation for a base schema version number.
 *
 * @param {string} version A HED base schema version number.
 * @return {number} The HED generation the base schema belongs to.
 */
const getGenerationForSchemaVersion = function (version) {
  if (lt(version, '4.0.0')) {
    return 1
  } else if (lt(version, '8.0.0-alpha')) {
    return 2
  } else {
    return 3
  }
}

module.exports = {
  replaceTagNameWithPound: replaceTagNameWithPound,
  getTagSlashIndices: getTagSlashIndices,
  getTagName: getTagName,
  getParentTag: getParentTag,
  hedStringIsAGroup: hedStringIsAGroup,
  removeGroupParentheses: removeGroupParentheses,
  validateValue: validateValue,
  validateUnits: validateUnits,
  getGenerationForSchemaVersion: getGenerationForSchemaVersion,
}

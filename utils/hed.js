const pluralize = require('pluralize')
pluralize.addUncountableRule('hertz')

const { isNumber } = require('./string')

const defaultUnitForTagAttribute = 'default'
const defaultUnitsForUnitClassAttribute = 'defaultUnits'
const extensionAllowedAttribute = 'extensionAllowed'
const tagsDictionaryKey = 'tags'
const takesValueType = 'takesValue'
const unitClassType = 'unitClass'
const unitClassUnitsType = 'units'
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
 */
const getTagName = function (tag) {
  const lastSlashIndex = tag.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(lastSlashIndex + 1)
  }
}

/**
 * Get the HED tag prefix (up to the last slash).
 */
const getParentTag = function (tag) {
  const lastSlashIndex = tag.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(0, lastSlashIndex)
  }
}

const hed2ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_;: ]+$/
const hed3ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_;]+$/
/**
 * Determine if a stripped value is valid.
 */
const validateValue = function (value, allowPlaceholders, isNumeric, isHed3) {
  if (value === '#') {
    return allowPlaceholders
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
 * Get the list of valid derivatives of a unit.
 */
const getValidUnitPlural = function (unit, hedSchemaAttributes) {
  const derivativeUnits = [unit]
  if (
    hedSchemaAttributes.hasUnitModifiers &&
    hedSchemaAttributes.dictionaries[unitSymbolType][unit] === undefined
  ) {
    derivativeUnits.push(pluralize.plural(unit))
  }
  return derivativeUnits
}

/**
 * Check for a valid unit and remove it.
 * @param {string} tagUnitValue The value being parsed.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @param {string} originalUnit The unit form used for comparison.
 * @param {string} normalizedUnit The unit form used for indexing the attribute dictionary.
 * @param {boolean} isUnitSymbol Whether the unit is an SI unit symbol.
 * @return {[boolean, string]} Whether a unit was found and the stripped value.
 */
const stripOffUnitsIfValid = function (
  tagUnitValue,
  hedSchemaAttributes,
  originalUnit,
  normalizedUnit,
  isUnitSymbol,
) {
  let foundUnit = false
  let strippedValue = ''
  if (tagUnitValue.startsWith(originalUnit)) {
    foundUnit = true
    strippedValue = tagUnitValue.substring(originalUnit.length).trim()
  } else if (tagUnitValue.endsWith(originalUnit)) {
    foundUnit = true
    strippedValue = tagUnitValue.slice(0, -originalUnit.length).trim()
  }
  const isSIUnit =
    hedSchemaAttributes.dictionaries[SIUnitKey][normalizedUnit] !== undefined
  if (foundUnit && isSIUnit && hedSchemaAttributes.hasUnitModifiers) {
    const modifierKey = isUnitSymbol
      ? SIUnitSymbolModifierKey
      : SIUnitModifierKey
    for (const unitModifier in hedSchemaAttributes.dictionaries[modifierKey]) {
      if (strippedValue.startsWith(unitModifier)) {
        strippedValue = strippedValue.substring(unitModifier.length).trim()
      } else if (strippedValue.endsWith(unitModifier)) {
        strippedValue = strippedValue.slice(0, -unitModifier.length).trim()
      }
    }
  }
  return [foundUnit, strippedValue]
}

/**
 * Validate a unit and strip it from the value.
 * @param {string} originalTagUnitValue The unformatted version of the value.
 * @param {string} formattedTagUnitValue The unformatted version of the value.
 * @param {string[]} tagUnitClassUnits The list of valid units for this tag.
 * @param {SchemaAttributes} hedSchemaAttributes The collection of schema attributes.
 * @return {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
 */
const validateUnits = function (
  originalTagUnitValue,
  formattedTagUnitValue,
  tagUnitClassUnits,
  hedSchemaAttributes,
) {
  const validUnits = getAllUnits(hedSchemaAttributes)
  validUnits.sort((first, second) => {
    return second.length - first.length
  })
  for (const unit of validUnits) {
    const derivativeUnits = getValidUnitPlural(unit, hedSchemaAttributes)
    for (const derivativeUnit of derivativeUnits) {
      let foundUnit, strippedValue
      if (
        hedSchemaAttributes.hasUnitModifiers &&
        hedSchemaAttributes.dictionaries[unitSymbolType][unit]
      ) {
        ;[foundUnit, strippedValue] = stripOffUnitsIfValid(
          originalTagUnitValue,
          hedSchemaAttributes,
          derivativeUnit,
          unit,
          true,
        )
      } else {
        ;[foundUnit, strippedValue] = stripOffUnitsIfValid(
          formattedTagUnitValue,
          hedSchemaAttributes,
          derivativeUnit,
          unit,
          false,
        )
      }
      if (foundUnit) {
        const unitIsValid = tagUnitClassUnits.includes(unit)
        return [true, unitIsValid, strippedValue]
      }
    }
  }
  return [false, false, formattedTagUnitValue]
}

/**
 * Determine if a HED tag is in the schema.
 */
const tagExistsInSchema = function (formattedTag, hedSchemaAttributes) {
  return formattedTag in hedSchemaAttributes.dictionaries[tagsDictionaryKey]
}

/**
 * Checks if a HED tag has the 'takesValue' attribute.
 */
const tagTakesValue = function (formattedTag, hedSchemaAttributes) {
  const takesValueTag = replaceTagNameWithPound(formattedTag)
  return hedSchemaAttributes.tagHasAttribute(takesValueTag, takesValueType)
}

/**
 * Checks if a HED tag has the 'unitClass' attribute.
 */
const isUnitClassTag = function (formattedTag, hedSchemaAttributes) {
  if (!hedSchemaAttributes.hasUnitClasses) {
    return false
  }
  const takesValueTag = replaceTagNameWithPound(formattedTag)
  return hedSchemaAttributes.tagHasAttribute(takesValueTag, unitClassType)
}

/**
 * Get the default unit for a particular HED tag.
 */
const getUnitClassDefaultUnit = function (formattedTag, hedSchemaAttributes) {
  if (isUnitClassTag(formattedTag, hedSchemaAttributes)) {
    const unitClassTag = replaceTagNameWithPound(formattedTag)
    const hasDefaultAttribute = hedSchemaAttributes.tagHasAttribute(
      unitClassTag,
      defaultUnitForTagAttribute,
    )
    if (hasDefaultAttribute) {
      return hedSchemaAttributes.dictionaries[defaultUnitForTagAttribute][
        unitClassTag
      ]
    } else if (
      unitClassTag in hedSchemaAttributes.dictionaries[unitClassType]
    ) {
      const unitClasses =
        hedSchemaAttributes.dictionaries[unitClassType][unitClassTag].split(',')
      const firstUnitClass = unitClasses[0]
      return hedSchemaAttributes.dictionaries[
        defaultUnitsForUnitClassAttribute
      ][firstUnitClass]
    }
  } else {
    return ''
  }
}

/**
 * Get the unit classes for a particular HED tag.
 */
const getTagUnitClasses = function (formattedTag, hedSchemaAttributes) {
  if (isUnitClassTag(formattedTag, hedSchemaAttributes)) {
    const unitClassTag = replaceTagNameWithPound(formattedTag)
    const unitClassesString =
      hedSchemaAttributes.dictionaries[unitClassType][unitClassTag]
    return unitClassesString.split(',')
  } else {
    return []
  }
}

/**
 * Get the legal units for a particular HED tag.
 */
const getTagUnitClassUnits = function (formattedTag, hedSchemaAttributes) {
  const tagUnitClasses = getTagUnitClasses(formattedTag, hedSchemaAttributes)
  const units = []
  for (const unitClass of tagUnitClasses) {
    const unitClassUnits =
      hedSchemaAttributes.dictionaries[unitClassUnitsType][unitClass]
    Array.prototype.push.apply(units, unitClassUnits)
  }
  return units
}

/**
 * Get the legal units for a particular HED tag.
 */
const getAllUnits = function (hedSchemaAttributes) {
  const units = []
  for (const unitClass in hedSchemaAttributes.dictionaries[
    unitClassUnitsType
  ]) {
    const unitClassUnits =
      hedSchemaAttributes.dictionaries[unitClassUnitsType][unitClass]
    Array.prototype.push.apply(units, unitClassUnits)
  }
  return units
}

/**
 * Check if any level of a HED tag allows extensions.
 */
const isExtensionAllowedTag = function (formattedTag, hedSchemaAttributes) {
  if (
    hedSchemaAttributes.tagHasAttribute(formattedTag, extensionAllowedAttribute)
  ) {
    return true
  }
  const tagSlashIndices = getTagSlashIndices(formattedTag)
  for (const tagSlashIndex of tagSlashIndices) {
    const tagSubstring = formattedTag.slice(0, tagSlashIndex)
    if (
      hedSchemaAttributes.tagHasAttribute(
        tagSubstring,
        extensionAllowedAttribute,
      )
    ) {
      return true
    }
  }
  return false
}

module.exports = {
  replaceTagNameWithPound: replaceTagNameWithPound,
  getTagSlashIndices: getTagSlashIndices,
  getTagName: getTagName,
  getParentTag: getParentTag,
  validateValue: validateValue,
  stripOffUnitsIfValid: stripOffUnitsIfValid,
  validateUnits: validateUnits,
  tagExistsInSchema: tagExistsInSchema,
  tagTakesValue: tagTakesValue,
  isUnitClassTag: isUnitClassTag,
  getUnitClassDefaultUnit: getUnitClassDefaultUnit,
  getTagUnitClasses: getTagUnitClasses,
  getTagUnitClassUnits: getTagUnitClassUnits,
  isExtensionAllowedTag: isExtensionAllowedTag,
}

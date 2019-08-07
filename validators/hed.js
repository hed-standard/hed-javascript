const utils = require('../utils')
const stringParser = require('./stringParser')
const Schema = require('./schema').Schema

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const tilde = '~'
const delimiters = [comma, tilde]

const defaultUnitAttribute = 'default'
const defaultUnitsForTypeAttribute = 'default_units'
const extensionAllowedAttribute = 'extensionAllowed'
const tagsDictionaryKey = 'tags'
const takesValueType = 'takesValue'
const unitClassType = 'unitClass'
const unitClassUnitsType = 'units'
const uniqueType = 'unique'
const requiredType = 'required'
const requireChildType = 'requireChild'
const timeUnitClass = 'time'

const digitExpression = /^-?[\d.]+(?:e-?\d+)?$/

// Utility functions

/**
 * Determine if a HED tag is in the schema.
 */
const tagIsValid = function(formattedTag, hedSchema) {
  return formattedTag in hedSchema.dictionaries[tagsDictionaryKey]
}

/**
 * Checks if a HED tag has the 'takesValue' attribute.
 */
const tagTakesValue = function(formattedTag, hedSchema) {
  const takesValueTag = utils.HED.replaceTagNameWithPound(formattedTag)
  return hedSchema.tagHasAttribute(takesValueTag, takesValueType)
}

/**
 * Checks if a HED tag has the 'unitClass' attribute.
 */
const isUnitClassTag = function(formattedTag, hedSchema) {
  const takesValueTag = utils.HED.replaceTagNameWithPound(formattedTag)
  return hedSchema.tagHasAttribute(takesValueTag, unitClassType)
}

/**
 * Get the default unit for a particular HED tag.
 */
const getUnitClassDefaultUnit = function(formattedTag, hedSchema) {
  if (isUnitClassTag(formattedTag, hedSchema)) {
    const unitClassTag = utils.HED.replaceTagNameWithPound(formattedTag)
    const hasDefaultAttribute = hedSchema.tagHasAttribute(
      unitClassTag,
      defaultUnitAttribute,
    )
    if (hasDefaultAttribute) {
      return hedSchema.dictionaries[defaultUnitAttribute][unitClassTag]
    } else if (unitClassTag in hedSchema.dictionaries[unitClassType]) {
      const unitClasses = hedSchema.dictionaries[unitClassType][
        unitClassTag
      ].split(',')
      const firstUnitClass = unitClasses[0]
      return hedSchema.dictionaries[defaultUnitsForTypeAttribute][
        firstUnitClass
      ]
    }
  } else {
    return ''
  }
}

/**
 * Get the unit classes for a particular HED tag.
 */
const getTagUnitClasses = function(formattedTag, hedSchema) {
  if (isUnitClassTag(formattedTag, hedSchema)) {
    const unitClassTag = utils.HED.replaceTagNameWithPound(formattedTag)
    const unitClassesString =
      hedSchema.dictionaries[unitClassType][unitClassTag]
    return unitClassesString.split(',')
  } else {
    return []
  }
}

/**
 * Get the legal units for a particular HED tag.
 */
const getTagUnitClassUnits = function(formattedTag, hedSchema) {
  const tagUnitClasses = getTagUnitClasses(formattedTag, hedSchema)
  const units = []
  for (const unitClass of tagUnitClasses) {
    const unitClassUnits = hedSchema.dictionaries[unitClassUnitsType][unitClass]
    Array.prototype.push.apply(
      units,
      unitClassUnits.map(unit => {
        return unit.toLowerCase()
      }),
    )
  }
  return units
}

/**
 * Check if any level of a HED tag allows extensions.
 */
const isExtensionAllowedTag = function(formattedTag, hedSchema) {
  const tagSlashIndices = utils.HED.getTagSlashIndices(formattedTag)
  for (const tagSlashIndex of tagSlashIndices) {
    const tagSubstring = formattedTag.slice(0, tagSlashIndex)
    if (hedSchema.tagHasAttribute(tagSubstring, extensionAllowedAttribute)) {
      return true
    }
  }
  return false
}

// Validation tests

/**
 * Check if group parentheses match. Pushes an issue if they don't match.
 */
const countTagGroupParentheses = function(hedString, issues) {
  const numberOfOpeningParentheses = utils.string.getCharacterCount(
    hedString,
    openingGroupCharacter,
  )
  const numberOfClosingParentheses = utils.string.getCharacterCount(
    hedString,
    closingGroupCharacter,
  )
  if (numberOfOpeningParentheses !== numberOfClosingParentheses) {
    issues.push(
      'ERROR: Number of opening and closing parentheses are unequal. ' +
        numberOfOpeningParentheses +
        ' opening parentheses. ' +
        numberOfClosingParentheses +
        ' closing parentheses.',
    )
  }
}

/**
 * Check if a comma is missing before an opening parenthesis.
 */
const isCommaMissingBeforeOpeningParenthesis = function(
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter &&
    !delimiters.includes(lastNonEmptyCharacter) &&
    currentCharacter === openingGroupCharacter
  )
}

/**
 * Check if a comma is missing after an opening parenthesis.
 */
const isCommaMissingAfterClosingParenthesis = function(
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter === closingGroupCharacter &&
    !delimiters.includes(currentCharacter)
  )
}

/**
 * Check for comma issues in a HED string (e.g. missing commas adjacent to groups).
 */
const findCommaIssuesInHedString = function(hedString, issues) {
  let lastNonEmptyCharacter = ''
  let currentTag = ''
  for (let i = 0; i < hedString.length; i++) {
    const currentCharacter = hedString.charAt(i)
    currentTag += currentCharacter
    if (utils.string.stringIsEmpty(currentCharacter)) {
      continue
    }
    if (delimiters.includes(currentCharacter)) {
      currentTag = ''
    }
    if (currentCharacter === openingGroupCharacter) {
      if (currentTag.trim() === openingGroupCharacter) {
        currentTag = ''
      } else {
        issues.push('ERROR: Invalid tag - "' + currentTag + '"')
      }
    } else if (
      isCommaMissingBeforeOpeningParenthesis(
        lastNonEmptyCharacter,
        currentCharacter,
      ) ||
      isCommaMissingAfterClosingParenthesis(
        lastNonEmptyCharacter,
        currentCharacter,
      )
    ) {
      issues.push('ERROR: Comma missing after - "' + currentTag + '"')
      break
    }
    lastNonEmptyCharacter = currentCharacter
  }
}

const camelCase = /([A-Z-]+\s*[a-z-]*)+/

/**
 * Check if tag level capitalization is valid (CamelCase).
 */
const checkCapitalization = function(
  originalTag,
  formattedTag,
  hedSchema,
  issues,
  doSemanticValidation,
) {
  let valid = true
  const tagNames = originalTag.split('/')
  if (doSemanticValidation && tagTakesValue(formattedTag, hedSchema)) {
    tagNames.pop()
  }
  for (const tagName of tagNames) {
    const correctTagName = utils.string.capitalizeString(tagName)
    if (tagName !== correctTagName && !camelCase.test(tagName)) {
      issues.push(
        'WARNING: First word not capitalized or camel case - "' +
          originalTag +
          '"',
      )
      valid = false
    }
  }
  return valid
}

/**
 * Check for duplicate tags at the top level or within a single group.
 * NOTE: Nested groups are treated as single tags for this validation.
 */
const checkForDuplicateTags = function(
  originalTagList,
  formattedTagList,
  issues,
) {
  let valid = true
  const tagListLength = formattedTagList.length
  const duplicateIndices = []
  for (let i = 0; i < tagListLength; i++) {
    for (let j = 0; j < tagListLength; j++) {
      if (i === j) {
        continue
      }
      if (
        formattedTagList[i] !== tilde &&
        formattedTagList[i] === formattedTagList[j] &&
        !duplicateIndices.includes(i) &&
        !duplicateIndices.includes(j)
      ) {
        duplicateIndices.push(i, j)
        issues.push('ERROR: Duplicate tag - "' + originalTagList[i] + '"')
        valid = false
      }
    }
  }
  return valid
}

/**
 * Check for multiple instances of a unique tag.
 */
const checkForMultipleUniqueTags = function(
  originalTagList,
  formattedTagList,
  hedSchema,
  issues,
) {
  const uniqueTagPrefixes = hedSchema.dictionaries[uniqueType]
  let valid = true
  for (const uniqueTagPrefix in uniqueTagPrefixes) {
    let foundOne = false
    for (const formattedTag of formattedTagList) {
      if (formattedTag.startsWith(uniqueTagPrefix)) {
        if (!foundOne) {
          foundOne = true
        } else {
          issues.push(
            'ERROR: Multiple unique tags with prefix - "' +
              hedSchema.dictionaries[uniqueType][uniqueTagPrefix] +
              '"',
          )
          valid = false
          break
        }
      }
    }
  }
  return valid
}

/**
 * Verify that the tilde count in a single group does not exceed 2.
 */
const checkNumberOfGroupTildes = function(originalTagGroup, issues) {
  const tildeCount = utils.array.getElementCount(originalTagGroup, tilde)
  if (tildeCount > 2) {
    issues.push('ERROR: Too many tildes - group "' + originalTagGroup + '"')
    return false
  }
  return true
}

/**
 * Check if a tag is missing a required child.
 */
const checkIfTagRequiresChild = function(
  originalTag,
  formattedTag,
  hedSchema,
  issues,
) {
  const invalid = formattedTag in hedSchema.dictionaries[requireChildType]
  if (invalid) {
    issues.push('ERROR: Descendant tag required - "' + originalTag + '"')
  }
  return !invalid
}

/**
 * Check that all required tags are present.
 */
const checkForRequiredTags = function(parsedString, hedSchema, issues) {
  const formattedTopLevelTagList = parsedString.formattedTopLevelTags
  const requiredTagPrefixes = hedSchema.dictionaries[requiredType]
  let valid = true
  for (const requiredTagPrefix in requiredTagPrefixes) {
    let foundOne = false
    for (const formattedTag of formattedTopLevelTagList) {
      if (formattedTag.startsWith(requiredTagPrefix)) {
        foundOne = true
        break
      }
    }
    if (!foundOne) {
      valid = false
      issues.push(
        'WARNING: Tag with prefix "' +
          hedSchema.dictionaries[requiredType][requiredTagPrefix] +
          '" is required',
      )
    }
  }
  return valid
}

/**
 * Check that the unit exists if the tag has a declared unit class.
 */
const checkIfTagUnitClassUnitsExist = function(
  originalTag,
  formattedTag,
  hedSchema,
  issues,
) {
  if (isUnitClassTag(formattedTag, hedSchema)) {
    const tagUnitValues = utils.HED.getTagName(formattedTag)
    const invalid = digitExpression.test(tagUnitValues)
    if (invalid) {
      const defaultUnit = getUnitClassDefaultUnit(formattedTag, hedSchema)
      issues.push(
        'WARNING: No unit specified. Using "' +
          defaultUnit +
          '" as the default - "' +
          originalTag +
          '"',
      )
    }
    return !invalid
  } else {
    return true
  }
}

/**
 * Check that the unit is valid for the tag's unit class.
 */
const checkIfTagUnitClassUnitsAreValid = function(
  originalTag,
  formattedTag,
  hedSchema,
  issues,
) {
  if (
    !tagIsValid(formattedTag, hedSchema) &&
    isUnitClassTag(formattedTag, hedSchema)
  ) {
    const tagUnitClasses = getTagUnitClasses(formattedTag, hedSchema)
    const tagUnitValues = utils.HED.getTagName(formattedTag)
    const tagUnitClassUnits = getTagUnitClassUnits(formattedTag, hedSchema)
    const valid =
      (tagUnitClasses.includes(timeUnitClass) &&
        utils.string.isHourMinuteTime(tagUnitValues)) ||
      digitExpression.test(
        utils.HED.stripOffUnitsIfValid(tagUnitValues, tagUnitClassUnits),
      )
    if (!valid) {
      issues.push(
        'ERROR: Invalid unit - "' +
          originalTag +
          '" valid units are "' +
          tagUnitClassUnits.join(',') +
          '"',
      )
    }
    return valid
  } else {
    return true
  }
}

/**
 * Check if an individual HED tag is in the schema or is an allowed extension.
 */
const checkIfTagIsValid = function(
  originalTag,
  formattedTag,
  previousOriginalTag,
  previousFormattedTag,
  hedSchema,
  issues,
) {
  if (
    formattedTag in hedSchema.dictionaries[tagsDictionaryKey] ||
    tagTakesValue(formattedTag, hedSchema) ||
    formattedTag === tilde
  ) {
    return true
  }
  const isExtensionTag = isExtensionAllowedTag(formattedTag, hedSchema)
  if (!isExtensionTag && tagTakesValue(previousFormattedTag, hedSchema)) {
    issues.push(
      'ERROR: Either "' +
        previousOriginalTag +
        '" contains a comma when it should not or "' +
        originalTag +
        '" is not a valid tag',
    )
    return false
  } else if (!isExtensionTag) {
    issues.push('ERROR: Invalid tag - "' + originalTag + '"')
    return false
  } else {
    return true
  }
}

// Validation groups

/**
 * Validate the full HED string.
 */
const validateFullHedString = function(hedString, issues) {
  countTagGroupParentheses(hedString, issues)
  findCommaIssuesInHedString(hedString, issues)
  return issues.length === 0
}

/**
 * Validate an individual HED tag.
 */
const validateIndividualHedTag = function(
  originalTag,
  formattedTag,
  previousOriginalTag,
  previousFormattedTag,
  hedSchema,
  issues,
  doSemanticValidation,
  checkForWarnings,
) {
  let valid = true
  if (doSemanticValidation) {
    valid =
      valid &&
      checkIfTagIsValid(
        originalTag,
        formattedTag,
        previousOriginalTag,
        previousFormattedTag,
        hedSchema,
        issues,
      )
    valid =
      valid &&
      checkIfTagUnitClassUnitsAreValid(
        originalTag,
        formattedTag,
        hedSchema,
        issues,
      )
    valid =
      valid &&
      checkIfTagRequiresChild(originalTag, formattedTag, hedSchema, issues)
    if (checkForWarnings) {
      valid =
        valid &&
        checkIfTagUnitClassUnitsExist(
          originalTag,
          formattedTag,
          hedSchema,
          issues,
        )
    }
  }
  if (checkForWarnings) {
    valid =
      valid &&
      checkCapitalization(
        originalTag,
        formattedTag,
        hedSchema,
        issues,
        doSemanticValidation,
      )
  }
  return valid
}

/**
 * Validate the individual HED tags in a parsed HED string object.
 */
const validateIndividualHedTags = function(
  parsedString,
  hedSchema,
  issues,
  doSemanticValidation,
  checkForWarnings,
) {
  let valid = true
  let previousOriginalTag = ''
  let previousFormattedTag = ''
  for (let i = 0; i < parsedString.tags.length; i++) {
    const originalTag = parsedString.tags[i]
    const formattedTag = parsedString.formattedTags[i]
    valid =
      valid &&
      validateIndividualHedTag(
        originalTag,
        formattedTag,
        previousOriginalTag,
        previousFormattedTag,
        hedSchema,
        issues,
        doSemanticValidation,
        checkForWarnings,
      )
    previousOriginalTag = originalTag
    previousFormattedTag = formattedTag
  }
  return valid
}

/**
 * Validate a HED tag level.
 */
const validateHedTagLevel = function(
  originalTagList,
  formattedTagList,
  hedSchema,
  issues,
  doSemanticValidation,
) {
  let valid = true
  if (doSemanticValidation) {
    valid =
      valid &&
      checkForMultipleUniqueTags(
        originalTagList,
        formattedTagList,
        hedSchema,
        issues,
      )
  }
  valid =
    valid && checkForDuplicateTags(originalTagList, formattedTagList, issues)
  return valid
}

/**
 * Validate the HED tag levels in a parsed HED string object.
 */
const validateHedTagLevels = function(
  parsedString,
  hedSchema,
  issues,
  doSemanticValidation,
) {
  let valid = true
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const originalTag = parsedString.tagGroups[i]
    const formattedTag = parsedString.formattedTagGroups[i]
    valid =
      valid && validateHedTagLevel(originalTag, formattedTag, hedSchema, issues)
  }
  valid =
    valid &&
    validateHedTagLevel(
      parsedString.topLevelTags,
      parsedString.formattedTopLevelTags,
      hedSchema,
      issues,
      doSemanticValidation,
    )
  return valid
}

/**
 * Validate a HED tag group.
 */
const validateHedTagGroup = function(originalTagGroup, issues) {
  let valid = true
  valid = valid && checkNumberOfGroupTildes(originalTagGroup, issues)
  return valid
}

/**
 * Validate the HED tag groups in a parsed HED string.
 */
const validateHedTagGroups = function(parsedString, issues) {
  let valid = true
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const originalTag = parsedString.tagGroups[i]
    valid = valid && validateHedTagGroup(originalTag, issues)
  }
  return valid
}

/**
 * Validate the top-level HED tags in a parsed HED string.
 */
const validateTopLevelTags = function(parsedString, hedSchema, issues) {
  return checkForRequiredTags(parsedString, hedSchema, issues)
}

/**
 * Validate a HED string.
 *
 * @param hedString The HED string to validate.
 * @param hedSchema The HED schema to validate against.
 * @param checkForWarnings Whether to check for warnings or only errors.
 * @returns {Array} Whether the HED string is valid and any issues found.
 */
const validateHedString = function(
  hedString,
  hedSchema = {},
  checkForWarnings = false,
) {
  const issues = []
  const doSemanticValidation = hedSchema instanceof Schema
  const isFullHedStringValid = validateFullHedString(hedString, issues)
  if (!isFullHedStringValid) {
    return [false, issues]
  }

  const parsedString = stringParser.parseHedString(hedString, issues)
  if (issues.length !== 0) {
    return [false, issues]
  }

  let valid = true
  if (checkForWarnings) {
    valid = valid && validateTopLevelTags(parsedString, hedSchema, issues)
  }
  valid =
    valid &&
    validateIndividualHedTags(
      parsedString,
      hedSchema,
      issues,
      doSemanticValidation,
      checkForWarnings,
    )
  valid =
    valid &&
    validateHedTagLevels(parsedString, hedSchema, issues, doSemanticValidation)
  valid = valid && validateHedTagGroups(parsedString, issues)
  return [valid, issues]
}

module.exports = {
  validateIndividualHedTags: validateIndividualHedTags,
  validateHedTagGroups: validateHedTagGroups,
  validateHedTagLevels: validateHedTagLevels,
  validateTopLevelTags: validateTopLevelTags,
  validateHedString: validateHedString,
}

const utils = require('../utils')
const stringParser = require('./stringParser')
const Schema = require('./schema').Schema

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const tilde = '~'
const delimiters = [comma, tilde]

const uniqueType = 'unique'
const requiredType = 'required'
const requireChildType = 'requireChild'
const timeUnitClass = 'time'

const digitExpression = /^-?[\d.]+(?:e-?\d+)?$/

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
      utils.generateIssue('parentheses', {
        opening: numberOfOpeningParentheses,
        closing: numberOfClosingParentheses,
      }),
    )
  }
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
 * Check for delimiter issues in a HED string (e.g. missing commas adjacent to groups, extra commas or tildes).
 */
const findDelimiterIssuesInHedString = function(hedString, issues) {
  let lastNonEmptyCharacter = ''
  let currentTag = ''
  for (let i = 0; i < hedString.length; i++) {
    const currentCharacter = hedString.charAt(i)
    currentTag += currentCharacter
    if (utils.string.stringIsEmpty(currentCharacter)) {
      continue
    }
    if (delimiters.includes(currentCharacter)) {
      if (currentTag.trim() === currentCharacter) {
        issues.push(
          utils.generateIssue('extraDelimiter', {
            character: currentCharacter,
            index: i,
            string: hedString,
          }),
        )
      }
      currentTag = ''
    } else if (currentCharacter === openingGroupCharacter) {
      if (currentTag.trim() === openingGroupCharacter) {
        currentTag = ''
      } else {
        issues.push(utils.generateIssue('invalidTag', { tag: currentTag }))
      }
    } else if (
      isCommaMissingAfterClosingParenthesis(
        lastNonEmptyCharacter,
        currentCharacter,
      )
    ) {
      issues.push(utils.generateIssue('commaMissing', { tag: currentTag }))
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
  if (
    doSemanticValidation &&
    utils.HED.tagTakesValue(formattedTag, hedSchema)
  ) {
    tagNames.pop()
  }
  for (const tagName of tagNames) {
    const correctTagName = utils.string.capitalizeString(tagName)
    if (tagName !== correctTagName && !camelCase.test(tagName)) {
      issues.push(utils.generateIssue('capitalization', { tag: originalTag }))
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
        issues.push(
          utils.generateIssue('duplicateTag', { tag: originalTagList[i] }),
        )
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
            utils.generateIssue('multipleUniqueTags', {
              tag: uniqueTagPrefix,
            }),
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
const checkNumberOfGroupTildes = function(
  originalTagGroup,
  parsedTagGroup,
  issues,
) {
  const tildeCount = utils.array.getElementCount(parsedTagGroup, tilde)
  if (tildeCount > 2) {
    issues.push(
      utils.generateIssue('tooManyTildes', { tagGroup: originalTagGroup }),
    )
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
    issues.push(utils.generateIssue('childRequired', { tag: originalTag }))
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
        utils.generateIssue('requiredPrefixMissing', {
          tagPrefix: requiredTagPrefix,
        }),
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
  if (utils.HED.isUnitClassTag(formattedTag, hedSchema)) {
    const tagUnitValues = utils.HED.getTagName(formattedTag)
    const invalid = digitExpression.test(tagUnitValues)
    if (invalid) {
      const defaultUnit = utils.HED.getUnitClassDefaultUnit(
        formattedTag,
        hedSchema,
      )
      issues.push(
        utils.generateIssue('unitClassDefaultUsed', {
          tag: originalTag,
          defaultUnit: defaultUnit,
        }),
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
    !utils.HED.tagExistsInSchema(formattedTag, hedSchema) &&
    utils.HED.isUnitClassTag(formattedTag, hedSchema)
  ) {
    const tagUnitClasses = utils.HED.getTagUnitClasses(formattedTag, hedSchema)
    const tagUnitValues = utils.HED.getTagName(formattedTag)
    const tagUnitClassUnits = utils.HED.getTagUnitClassUnits(
      formattedTag,
      hedSchema,
    )
    const valid =
      (tagUnitClasses.includes(timeUnitClass) &&
        utils.string.isHourMinuteTime(tagUnitValues)) ||
      digitExpression.test(
        utils.HED.stripOffUnitsIfValid(tagUnitValues, tagUnitClassUnits),
      )
    if (!valid) {
      issues.push(
        utils.generateIssue('unitClassInvalidUnit', {
          tag: originalTag,
          unitClassUnits: tagUnitClassUnits.sort().join(','),
        }),
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
  allowLeafExtensionsFlag,
  hedSchema,
  issues,
) {
  if (
    utils.HED.tagExistsInSchema(formattedTag, hedSchema) || // This tag itself exists in the HED schema.
    utils.HED.tagTakesValue(formattedTag, hedSchema) || // This tag is a valid value-taking tag in the HED schema.
    formattedTag === tilde // This "tag" is a tilde.
  ) {
    return true
  }
  // Whether this tag has an ancestor with the 'extensionAllowed' attribute.
  const isExtensionAllowedTag = utils.HED.isExtensionAllowedTag(
    formattedTag,
    hedSchema,
  )
  if (!allowLeafExtensionsFlag && isExtensionAllowedTag) {
    // This tag is valid if it is such an allowed extension.
    return true
  } else if (
    allowLeafExtensionsFlag &&
    utils.HED.tagIsLeafExtension(formattedTag, hedSchema)
  ) {
    // This tag extends a leaf node when all leaf extensions are allowed.
    return true
  } else if (
    !isExtensionAllowedTag &&
    utils.HED.tagTakesValue(previousFormattedTag, hedSchema)
  ) {
    // This tag isn't an allowed extension, but the previous tag takes a value.
    // This is likely caused by an extraneous comma.
    issues.push(
      utils.generateIssue('extraCommaOrInvalid', {
        tag: originalTag,
        previousTag: previousOriginalTag,
      }),
    )
    return false
  } else if (!isExtensionAllowedTag) {
    // This is not a valid tag.
    issues.push(utils.generateIssue('invalidTag', { tag: originalTag }))
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
  findDelimiterIssuesInHedString(hedString, issues)
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
  allowLeafExtensionsFlag,
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
        allowLeafExtensionsFlag,
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
  allowLeafExtensionsFlag,
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
        allowLeafExtensionsFlag,
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
const validateHedTagGroup = function(originalTagGroup, parsedTagGroup, issues) {
  let valid = true
  valid =
    valid && checkNumberOfGroupTildes(originalTagGroup, parsedTagGroup, issues)
  return valid
}

/**
 * Validate the HED tag groups in a parsed HED string.
 */
const validateHedTagGroups = function(parsedString, issues) {
  let valid = true
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const parsedTag = parsedString.tagGroups[i]
    const originalTag = parsedString.tagGroupStrings[i]
    valid = valid && validateHedTagGroup(originalTag, parsedTag, issues)
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
 * @param allowLeafExtensionsFlag Whether to allow all leaf extensions.
 * @returns {Array} Whether the HED string is valid and any issues found.
 */
const validateHedString = function(
  hedString,
  hedSchema = {},
  checkForWarnings = false,
  allowLeafExtensionsFlag = false,
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
      allowLeafExtensionsFlag,
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

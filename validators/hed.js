const utils = require('../utils')
const stringParser = require('./stringParser')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const tilde = '~'
const delimiters = [comma, tilde]

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
    currentCharacter == openingGroupCharacter
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
    lastNonEmptyCharacter == closingGroupCharacter &&
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
    /*if () {
      // TODO: Semantic validation.
    } else */ if (
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
const checkCapitalization = function(originalTag, formattedTag, issues) {
  let valid = true
  const tagNames = originalTag.split('/')
  /* if (tagTakesValue(formattedTag)) {
    tagNames.pop()
  } */
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
  issues,
  checkForWarnings,
) {
  let valid = true
  // TODO: Implement semantic validations
  if (checkForWarnings) {
    valid = valid && checkCapitalization(originalTag, formattedTag, issues)
  }
  return valid
}

/**
 * Validate the individual HED tags in a parsed HED string object.
 */
const validateIndividualHedTags = function(
  parsedString,
  issues,
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
        issues,
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
  issues,
) {
  let valid = true
  // TODO: Implement semantic validations
  // valid = valid && checkForMultipleUniqueTags(originalTagList, formattedTagList)
  valid =
    valid && checkForDuplicateTags(originalTagList, formattedTagList, issues)
  return valid
}

/**
 * Validate the HED tag levels in a parsed HED string object.
 */
const validateHedTagLevels = function(parsedString, issues) {
  let valid = true
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const originalTag = parsedString.tagGroups[i]
    const formattedTag = parsedString.formattedTagGroups[i]
    valid = valid && validateHedTagLevel(originalTag, formattedTag, issues)
  }
  valid =
    valid &&
    validateHedTagLevel(
      parsedString.topLevelTags,
      parsedString.formattedTopLevelTags,
      issues,
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
  const isFullHedStringValid = validateFullHedString(hedString, issues)
  if (!isFullHedStringValid) {
    return [false, issues]
  }

  const parsedString = stringParser.parseHedString(hedString, issues)
  if (issues.length !== 0) {
    return [false, issues]
  }

  let valid = true
  valid =
    valid && validateIndividualHedTags(parsedString, issues, checkForWarnings)
  valid = valid && validateHedTagLevels(parsedString, issues)
  valid = valid && validateHedTagGroups(parsedString, issues)
  return [valid, issues]
}

module.exports = {
  validateIndividualHedTags: validateIndividualHedTags,
  validateHedTagGroups: validateHedTagGroups,
  validateHedTagLevels: validateHedTagLevels,
  validateHedString: validateHedString,
}

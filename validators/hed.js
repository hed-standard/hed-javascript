const utils = require('../utils')
const stringParser = require('./stringParser')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const tilde = '~'
const delimiters = [comma, tilde]

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
        ' closing parentheses',
    )
  }
}

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

const isCommaMissingBeforeClosingParenthesis = function(
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter == closingGroupCharacter &&
    !delimiters.includes(currentCharacter)
  )
}

const addCommaErrorIssue = function(currentTag, issues) {
  issues.push('ERROR: Comma missing after - "' + currentTag + '"\n')
}

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
      isCommaMissingBeforeClosingParenthesis(
        lastNonEmptyCharacter,
        currentCharacter,
      )
    ) {
      addCommaErrorIssue(currentTag, issues)
      break
    }
    lastNonEmptyCharacter = currentCharacter
  }
}

const validateFullHedString = function(hedString, issues) {
  countTagGroupParentheses(hedString, issues)
  findCommaIssuesInHedString(hedString, issues)
  return issues.length === 0
}

const camelCase = /([A-Z-]+\s*[a-z-]*)+/

const checkCapitalization = function(originalTag, formattedTag, issues) {
  let valid = true
  const tagNames = originalTag.split('/')
  /* if (tagTakesValue(formattedTag)) {
    tagNames.pop()
  } */
  for (let tagName of tagNames) {
    const correctTagName = utils.string.capitalizeString(tagName)
    if (tagName !== correctTagName && !camelCase.test(tagName)) {
      issues.push(
        'WARNING: First word not capitalized or camel case - ' + originalTag,
      )
      valid = false
    }
  }
  return valid
}

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

const checkNumberOfGroupTildes = function(originalTagGroup, issues) {
  const tildeCount = utils.array.getElementCount(originalTagGroup, tilde)
  if (tildeCount > 2) {
    issues.push('ERROR: Too many tildes - group "' + originalTagGroup + '"')
    return false
  }
  return true
}

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

const validateHedTagGroup = function(originalTagGroup, issues) {
  let valid = true
  valid = valid && checkNumberOfGroupTildes(originalTagGroup, issues)
  return valid
}

const validateHedTagGroups = function(parsedString, issues) {
  let valid = true
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const originalTag = parsedString.tagGroups[i]
    valid = valid && validateHedTagGroup(originalTag, issues)
  }
  return valid
}

const validateHedString = function(
  hedString,
  issues,
  checkForWarnings = false,
) {
  const isFullHedStringValid = validateFullHedString(hedString, issues)
  if (!isFullHedStringValid) {
    return false
  }
  const parsedString = stringParser.parseHedString(hedString, issues)
  let valid = true
  valid =
    valid && validateIndividualHedTags(parsedString, issues, checkForWarnings)
  valid = valid && validateHedTagLevels(parsedString, issues)
  valid = valid && validateHedTagGroups(parsedString, issues)
  return valid
}

module.exports = {
  validateFullHedString: validateFullHedString,
  validateIndividualHedTags: validateIndividualHedTags,
  validateHedTagGroups: validateHedTagGroups,
  validateHedTagLevels: validateHedTagLevels,
  validateHedString: validateHedString,
}

const utils = require('../utils')
const stringParser = require('./stringParser')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const tilde = '~'
const delimiters = [comma, tilde]

const countTagGroupBrackets = function(hedString, issues) {
  const numberOfOpeningBrackets = utils.string.getCharacterCount(hedString, '(')
  const numberOfClosingBrackets = utils.string.getCharacterCount(hedString, ')')
  if (numberOfOpeningBrackets !== numberOfClosingBrackets) {
    issues.push(
      'ERROR: Number of opening and closing brackets are unequal. ' +
        numberOfOpeningBrackets +
        ' opening brackets. ' +
        numberOfClosingBrackets +
        ' closing brackets',
    )
  }
}

const isCommaMissingBeforeOpeningBracket = function(
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter &&
    !delimiters.includes(lastNonEmptyCharacter) &&
    currentCharacter == openingGroupCharacter
  )
}

const isCommaMissingBeforeClosingBracket = function(
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
      isCommaMissingBeforeOpeningBracket(
        lastNonEmptyCharacter,
        currentCharacter,
      ) ||
      isCommaMissingBeforeClosingBracket(
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
  countTagGroupBrackets(hedString, issues)
  findCommaIssuesInHedString(hedString, issues)
  return issues.length === 0
}

const camelCase = /([A-Z-]+\s*[a-z-]*)+/

const checkCapitalization = function(originalTag, formattedTag, issues) {
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
      return false
    }
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
  return valid
}

module.exports = {
  validateFullHedString: validateFullHedString,
  validateIndividualHedTags: validateIndividualHedTags,
  validateHedString: validateHedString,
}

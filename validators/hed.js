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

const validateHedTag = function(tag, issues) {
  issues.push('Not yet implemented')
  return true
}

const validateHedString = function(hedString, issues) {
  const isFullHedStringValid = validateFullHedString(hedString, issues)
  if (!isFullHedStringValid) {
    return false
  }
  const parsedString = stringParser.parseHedString(hedString, issues)
  const hedTags = parsedString.tags
  let valid = true
  for (let hedTag of hedTags) {
    valid = valid && validateHedTag(hedTag, issues)
  }
  return valid
}

module.exports = {
  validateFullHedString: validateFullHedString,
  validateHedString: validateHedString,
}

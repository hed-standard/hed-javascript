/* eslint-disable no-unused-vars */

const openingGroupCharacter = '('
const closingGroupCharacter = ')'

const hedStringIsEmpty = function(hedString) {
  return !hedString.trim()
}

const hedStringIsAGroup = function(hedString) {
  const trimmedHedString = hedString.trim()
  return (
    trimmedHedString.startsWith(openingGroupCharacter) &&
    trimmedHedString.endsWith(closingGroupCharacter)
  )
}

const splitHedString = function(hedString, issues) {
  const delimiter = ','
  const doubleQuoteCharacter = '"'
  const tilde = '~'
  const invalidCharacters = ['{', '}']

  const hedTags = []
  let numberOfOpeningParentheses = 0
  let numberOfClosingParentheses = 0
  let currentTag = ''
  for (let i = 0; i < hedString.length; i++) {
    let character = hedString.charAt(i)
    if (character == doubleQuoteCharacter) {
      continue
    } else if (character == openingGroupCharacter) {
      numberOfOpeningParentheses++
    } else if (character == closingGroupCharacter) {
      numberOfClosingParentheses++
    } else if (
      numberOfOpeningParentheses == numberOfClosingParentheses &&
      character == tilde
    ) {
      if (!hedStringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      hedTags.push(tilde)
      currentTag = ''
    } else if (
      numberOfOpeningParentheses == numberOfClosingParentheses &&
      character == delimiter
    ) {
      if (!hedStringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      currentTag = ''
    } else if (invalidCharacters.includes(character)) {
      issues.push('Unsupported character')
      if (!hedStringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      currentTag = ''
    } else {
      currentTag += character
    }
  }
  if (!hedStringIsEmpty(currentTag)) {
    hedTags.push(currentTag.trim())
  }
  return hedTags
}

const findTopLevelTags = function(hedTags) {
  let topLevelTags = hedTags.slice(0)
  // TODO: Finish
  return topLevelTags
}

const formatHedTag = function(hedTag, onlyRemoveNewLine = false) {
  hedTag = hedTag.replace('\n', ' ')
  if (onlyRemoveNewLine) {
    return hedTag
  }
  hedTag.trim()
  if (hedTag.startsWith('"')) {
    hedTag = hedTag.slice(1)
  }
  if (hedTag.endsWith('"')) {
    hedTag = hedTag.slice(0, -1)
  }
  if (hedTag.startsWith('/')) {
    hedTag = hedTag.slice(1)
  }
  if (hedTag.endsWith('/')) {
    hedTag = hedTag.slice(0, -1)
  }
  return hedTag.toLowerCase()
}

module.exports = {
  hedStringIsEmpty: hedStringIsEmpty,
  hedStringIsAGroup: hedStringIsAGroup,
  splitHedString: splitHedString,
  findTopLevelTags: findTopLevelTags,
  formatHedTag: formatHedTag,
}

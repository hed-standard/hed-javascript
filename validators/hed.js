/* eslint-disable no-unused-vars */

const hedStringIsEmpty = function(hedString) {
  return !hedString.trim()
}

const splitHedString = function(hedString, issues) {
  const delimiter = ','
  const doubleQuoteCharacter = '"'
  const openingGroupCharacter = '('
  const closingGroupCharacter = ')'
  const tilde = '~'
  const currentlyInvalidCharacters = [
    openingGroupCharacter,
    closingGroupCharacter,
    tilde,
  ]

  const hedTags = []
  let currentTag = ''
  for (let i = 0; i < hedString.length; i++) {
    let character = hedString.charAt(i)
    if (character == doubleQuoteCharacter) {
      continue
    } else if (character == delimiter) {
      if (!hedStringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      currentTag = ''
    } else if (character in currentlyInvalidCharacters) {
      issues.push('Unsupported grouping character')
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

const validateHedTag = function(tag, issues) {
  issues.push('Not yet implemented')
  return false
}

const validateHedString = function(hedString, issues) {
  const hedTags = splitHedString(hedString, issues)
  let valid = true
  for (let hedTag of hedTags) {
    valid = valid && validateHedTag(hedTag, issues)
  }
  return valid
}

module.exports = {
  hedStringIsEmpty: hedStringIsEmpty,
  splitHedString: splitHedString,
  validateHedTag: validateHedTag,
  validateHedString: validateHedString,
}

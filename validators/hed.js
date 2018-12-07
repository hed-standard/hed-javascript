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
    } else if (currentlyInvalidCharacters.includes(character)) {
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
  findTopLevelTags: findTopLevelTags,
  formatHedTag: formatHedTag,
  validateHedTag: validateHedTag,
  validateHedString: validateHedString,
}

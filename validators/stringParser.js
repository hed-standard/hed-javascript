const utils = require('../utils')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'

const hedStringIsAGroup = function(hedString) {
  const trimmedHedString = hedString.trim()
  return (
    trimmedHedString.startsWith(openingGroupCharacter) &&
    trimmedHedString.endsWith(closingGroupCharacter)
  )
}

const removeGroupParentheses = function(tagGroup) {
  return tagGroup.slice(1, -1)
}

const splitHedString = function(hedString, issues) {
  const delimiter = ','
  const doubleQuoteCharacter = '"'
  const tilde = '~'
  const invalidCharacters = ['{', '}', '[', ']']

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
    }
    if (
      numberOfOpeningParentheses == numberOfClosingParentheses &&
      character == tilde
    ) {
      if (!utils.string.stringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      hedTags.push(tilde)
      currentTag = ''
    } else if (
      numberOfOpeningParentheses == numberOfClosingParentheses &&
      character == delimiter
    ) {
      if (!utils.string.stringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      currentTag = ''
    } else if (invalidCharacters.includes(character)) {
      issues.push('Unsupported character')
      if (!utils.string.stringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      currentTag = ''
    } else {
      currentTag += character
    }
  }
  if (!utils.string.stringIsEmpty(currentTag)) {
    hedTags.push(currentTag.trim())
  }
  return hedTags
}

const findTagGroups = function(groupTagsList, parsedString, issues) {
  for (let tagOrGroup of groupTagsList) {
    if (hedStringIsAGroup(tagOrGroup)) {
      const tagGroupString = removeGroupParentheses(tagOrGroup)
      const nestedGroupTagList = splitHedString(tagGroupString, issues)
      findTagGroups(nestedGroupTagList, parsedString, issues)
      parsedString.tagGroups.push(nestedGroupTagList)
    } else if (!parsedString.tags.includes(tagOrGroup)) {
      parsedString.tags.push(tagOrGroup)
    }
  }
}

const findTopLevelTags = function(hedTags, parsedString) {
  const topLevelTags = []
  for (let tagOrGroup of hedTags) {
    if (!hedStringIsAGroup(tagOrGroup)) {
      topLevelTags.push(tagOrGroup)
      if (!parsedString.tags.includes(tagOrGroup)) {
        parsedString.tags.push(tagOrGroup)
      }
    }
  }
  return topLevelTags
}

const formatHedTagsInList = function(hedTagList, onlyRemoveNewLine = false) {
  const formattedTagList = []
  for (let hedTag of hedTagList) {
    if (hedTag instanceof Array) {
      const nestedFormattedTagList = formatHedTagsInList(
        hedTag,
        onlyRemoveNewLine,
      )
      formattedTagList.push(nestedFormattedTagList)
    } else {
      const formattedHedTag = formatHedTag(hedTag, onlyRemoveNewLine)
      formattedTagList.push(formattedHedTag)
    }
  }
  return formattedTagList
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

const parseHedString = function(hedString, issues) {
  const parsedString = { tags: [], tagGroups: [], topLevelTags: [] }
  const hedTagList = splitHedString(hedString)
  parsedString.topLevelTags = findTopLevelTags(hedTagList, parsedString)
  findTagGroups(hedTagList, parsedString, issues)
  parsedString.tags = formatHedTagsInList(parsedString.tags, true)
  parsedString.tagGroups = formatHedTagsInList(parsedString.tagGroups, true)
  parsedString.topLevelTags = formatHedTagsInList(
    parsedString.topLevelTags,
    true,
  )
  parsedString.formattedTags = formatHedTagsInList(parsedString.tags)
  parsedString.formattedTagGroups = formatHedTagsInList(parsedString.tagGroups)
  parsedString.formattedTopLevelTags = formatHedTagsInList(
    parsedString.topLevelTags,
  )
  return parsedString
}

module.exports = {
  hedStringIsAGroup: hedStringIsAGroup,
  removeGroupParentheses: removeGroupParentheses,
  splitHedString: splitHedString,
  formatHedTag: formatHedTag,
  parseHedString: parseHedString,
}

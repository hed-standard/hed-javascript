const utils = require('../utils')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'

/**
 * Determine whether a HED string is a group (surrounded by parentheses).
 */
const hedStringIsAGroup = function(hedString) {
  const trimmedHedString = hedString.trim()
  return (
    trimmedHedString.startsWith(openingGroupCharacter) &&
    trimmedHedString.endsWith(closingGroupCharacter)
  )
}

/**
 * Return a copy of a group tag with the surrounding parentheses removed.
 */
const removeGroupParentheses = function(tagGroup) {
  return tagGroup.slice(1, -1)
}

/**
 * Split a full HED string into tags.
 *
 * @param hedString The full HED string.
 * @param issues The array of issues.
 * @returns {Array} An array of HED tags (top-level relative to the passed string).
 */
const splitHedString = function(hedString, issues) {
  const delimiter = ','
  const doubleQuoteCharacter = '"'
  const tilde = '~'
  const invalidCharacters = ['{', '}', '[', ']']

  const hedTags = []
  let numberOfOpeningParentheses = 0
  let numberOfClosingParentheses = 0
  let currentTag = ''
  // Loop a character at a time.
  for (let i = 0; i < hedString.length; i++) {
    let character = hedString.charAt(i)
    if (character == doubleQuoteCharacter) {
      // Skip double quotes
      continue
    } else if (character == openingGroupCharacter) {
      // Count group characters
      numberOfOpeningParentheses++
    } else if (character == closingGroupCharacter) {
      numberOfClosingParentheses++
    }
    if (
      numberOfOpeningParentheses == numberOfClosingParentheses &&
      character == tilde
    ) {
      // Found a tilde, so push the current tag and a tilde.
      if (!utils.string.stringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      hedTags.push(tilde)
      currentTag = ''
    } else if (
      numberOfOpeningParentheses == numberOfClosingParentheses &&
      character == delimiter
    ) {
      // Found the end of a tag, so push the current tag.
      if (!utils.string.stringIsEmpty(currentTag)) {
        hedTags.push(currentTag.trim())
      }
      currentTag = ''
    } else if (invalidCharacters.includes(character)) {
      // Found an invalid character, so push an issue.
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
    // Push last HED tag.
    hedTags.push(currentTag.trim())
  }
  return hedTags
}

/**
 * Find and parse the group tags in a provided list.
 *
 * @param groupTagsList The list of possible group tags.
 * @param parsedString The object to store parsed output in.
 * @param issues The array of issues.
 */
const findTagGroups = function(groupTagsList, parsedString, issues) {
  for (let tagOrGroup of groupTagsList) {
    if (hedStringIsAGroup(tagOrGroup)) {
      const tagGroupString = removeGroupParentheses(tagOrGroup)
      // Split the group tag and recurse.
      const nestedGroupTagList = splitHedString(tagGroupString, issues)
      findTagGroups(nestedGroupTagList, parsedString, issues)
      parsedString.tagGroups.push(nestedGroupTagList)
    } else if (!parsedString.tags.includes(tagOrGroup)) {
      parsedString.tags.push(tagOrGroup)
    }
  }
}

/**
 * Find top-level tags in a split HED tag list.
 *
 * @param hedTags A list of split HED tags.
 * @param parsedString The object to store sorted output in.
 * @returns {Array} The top-level tags from a HED string.
 */
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

/**
 * Format the HED tags in a list.
 *
 * @param hedTagList An array of unformatted HED tags.
 * @param onlyRemoveNewLine Whether to only remove newlines.
 * @returns {Array} An array of formatted HED tags corresponding to hedTagList.
 */
const formatHedTagsInList = function(hedTagList, onlyRemoveNewLine = false) {
  const formattedTagList = []
  for (let hedTag of hedTagList) {
    if (hedTag instanceof Array) {
      // Recurse
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

/**
 * Format an individual HED tag by removing newlines, and optionally double quotes and slashes.
 *
 * @param hedTag The HED tag to format.
 * @param onlyRemoveNewLine Whether to only remove newlines.
 * @returns {String} The formatted HED tag.
 */
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

/**
 * Parse a full HED string into a object of tag types.
 *
 * @param hedString The full HED string to parse.
 * @param issues The array of issues.
 * @returns {{tagGroups: Array, topLevelTags: Array, tags: Array, formattedTagGroups: Array, formattedTopLevelTags: Array, formattedTags: Array}} The parsed HED tag data.
 */
const parseHedString = function(hedString, issues) {
  const parsedString = { tags: [], tagGroups: [], topLevelTags: [] }
  const hedTagList = splitHedString(hedString, issues)
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

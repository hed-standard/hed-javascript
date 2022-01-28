const zip = require('lodash/zip')

const utils = require('../utils')
const { generateIssue } = require('../utils/issues/issues')

const { ParsedHedTag, ParsedHedGroup, ParsedHedString } = require('./types')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const delimiters = new Set([','])

/**
 * Determine whether a HED string is a group (surrounded by parentheses).
 *
 * @param {string} hedString A HED string.
 */
const hedStringIsAGroup = function (hedString) {
  const trimmedHedString = hedString.trim()
  return (
    trimmedHedString.startsWith(openingGroupCharacter) &&
    trimmedHedString.endsWith(closingGroupCharacter)
  )
}

/**
 * Return a copy of a group tag with the surrounding parentheses removed.
 *
 * @param {string} tagGroup A tag group string.
 */
const removeGroupParentheses = function (tagGroup) {
  return tagGroup.slice(1, -1)
}

/**
 * Split a full HED string into tags.
 *
 * @param {string} hedString The full HED string.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {int} groupStartingIndex The start index of the group in the full HED string.
 * @returns {[ParsedHedTag[], Array]} An array of HED tags (top-level relative to the passed string) and any issues found.
 */
const splitHedString = function (
  hedString,
  hedSchemas,
  groupStartingIndex = 0,
) {
  const doubleQuoteCharacter = '"'
  const invalidCharacters = ['{', '}', '[', ']', '~']

  const hedTags = []
  let issues = []
  let groupDepth = 0
  let currentTag = ''
  let startingIndex = 0
  let resetStartingIndex = false
  // Loop a character at a time.
  for (let i = 0; i < hedString.length; i++) {
    if (resetStartingIndex) {
      startingIndex = i
      resetStartingIndex = false
    }
    const character = hedString.charAt(i)
    if (character === doubleQuoteCharacter) {
      // Skip double quotes
      continue
    } else if (character === openingGroupCharacter) {
      // Count group characters
      groupDepth++
    } else if (character === closingGroupCharacter) {
      groupDepth--
    }
    if (groupDepth === 0 && delimiters.has(character)) {
      // Found the end of a tag, so push the current tag.
      if (!utils.string.stringIsEmpty(currentTag)) {
        const parsedHedTag = new ParsedHedTag(
          currentTag.trim(),
          hedString,
          [groupStartingIndex + startingIndex, groupStartingIndex + i],
          hedSchemas,
        )
        hedTags.push(parsedHedTag)
        issues = issues.concat(parsedHedTag.conversionIssues)
      }
      resetStartingIndex = true
      currentTag = ''
    } else if (invalidCharacters.includes(character)) {
      // Found an invalid character, so push an issue.
      issues.push(
        utils.issues.generateIssue('invalidCharacter', {
          character: character,
          index: groupStartingIndex + i,
          string: hedString,
        }),
      )
      if (!utils.string.stringIsEmpty(currentTag)) {
        const parsedHedTag = new ParsedHedTag(
          currentTag.trim(),
          hedString,
          [groupStartingIndex + startingIndex, groupStartingIndex + i],
          hedSchemas,
        )
        hedTags.push(parsedHedTag)
        issues = issues.concat(parsedHedTag.conversionIssues)
      }
      resetStartingIndex = true
      currentTag = ''
    } else {
      currentTag += character
      if (utils.string.stringIsEmpty(currentTag)) {
        resetStartingIndex = true
        currentTag = ''
      }
    }
  }
  if (!utils.string.stringIsEmpty(currentTag)) {
    // Push last HED tag.
    const parsedHedTag = new ParsedHedTag(
      currentTag.trim(),
      hedString,
      [
        groupStartingIndex + startingIndex,
        groupStartingIndex + hedString.length,
      ],
      hedSchemas,
    )
    hedTags.push(parsedHedTag)
    issues = issues.concat(parsedHedTag.conversionIssues)
  }
  return [hedTags, issues]
}

/**
 * Find and parse the group tags in a provided list.
 *
 * @param {(ParsedHedTag|ParsedHedGroup)[]} groupTagsList The list of possible group tags.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {ParsedHedString} parsedString The object to store parsed output in.
 * @param {boolean} isTopLevel Whether these tag groups are at the top level.
 * @return {Issue[]} The array of issues.
 */
const findTagGroups = function (
  groupTagsList,
  hedSchemas,
  parsedString,
  isTopLevel,
) {
  let issues = []
  const copiedGroupTagsList = groupTagsList.slice()
  copiedGroupTagsList.forEach((tagOrGroup, index) => {
    if (hedStringIsAGroup(tagOrGroup.originalTag)) {
      const tagGroupString = removeGroupParentheses(tagOrGroup.originalTag)
      // Split the group tag and recurse.
      const [nestedGroupTagList, nestedGroupIssues] = splitHedString(
        tagGroupString,
        hedSchemas,
        tagOrGroup.originalBounds[0] + 1,
      )
      const nestedIssues = findTagGroups(
        nestedGroupTagList,
        hedSchemas,
        parsedString,
        false,
      )
      groupTagsList[index] = new ParsedHedGroup(
        tagOrGroup.originalTag,
        nestedGroupTagList,
        tagOrGroup.originalBounds,
        hedSchemas,
      )
      if (isTopLevel) {
        parsedString.tagGroupStrings.push(tagOrGroup)
        parsedString.tagGroups.push(groupTagsList[index])
        parsedString.topLevelTagGroups.push(
          nestedGroupTagList.filter((tagOrGroup) => {
            return tagOrGroup && !Array.isArray(tagOrGroup)
          }),
        )
      }
      issues = issues.concat(nestedGroupIssues, nestedIssues)
    } else if (!parsedString.tags.includes(tagOrGroup)) {
      parsedString.tags.push(tagOrGroup)
    }
  })
  parsedString.definitionGroups = parsedString.tagGroups.filter((group) => {
    return group.isDefinitionGroup
  })
  return issues
}

/**
 * Find top-level tags in a split HED tag list.
 *
 * @param {ParsedHedTag[]} hedTags A list of split HED tags.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {ParsedHedString} parsedString The object to store sorted output in.
 * @returns {ParsedHedTag[]} The top-level tags from a HED string.
 */
const findTopLevelTags = function (hedTags, hedSchemas, parsedString) {
  const topLevelTags = []
  for (const tagOrGroup of hedTags) {
    if (!hedStringIsAGroup(tagOrGroup.originalTag)) {
      topLevelTags.push(tagOrGroup)
      if (!parsedString.tags.includes(tagOrGroup)) {
        parsedString.tags.push(tagOrGroup)
      }
    }
  }
  return topLevelTags
}

/**
 * Substitute certain illegal characters and report warnings when found.
 */
const substituteCharacters = function (hedString) {
  const issues = []
  const illegalCharacterMap = { '\0': ['ASCII NUL', ' '] }
  const flaggedCharacters = /[^\w\d./$ :-]/g
  const replaceFunction = function (match, offset) {
    if (match in illegalCharacterMap) {
      const [name, replacement] = illegalCharacterMap[match]
      issues.push(
        generateIssue('invalidCharacter', {
          character: name,
          index: offset,
          string: hedString,
        }),
      )
      return replacement
    } else {
      return match
    }
  }
  const fixedString = hedString.replace(flaggedCharacters, replaceFunction)

  return [fixedString, issues]
}

/**
 * Check if group parentheses match. Pushes an issue if they don't match.
 */
const countTagGroupParentheses = function (hedString) {
  const issues = []
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
      generateIssue('parentheses', {
        opening: numberOfOpeningParentheses,
        closing: numberOfClosingParentheses,
      }),
    )
  }
  return issues
}

/**
 * Check if a comma is missing after an opening parenthesis.
 */
const isCommaMissingAfterClosingParenthesis = function (
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter === closingGroupCharacter &&
    !(
      delimiters.has(currentCharacter) ||
      currentCharacter === closingGroupCharacter
    )
  )
}

/**
 * Check for delimiter issues in a HED string (e.g. missing commas adjacent to groups, extra commas or tildes).
 */
const findDelimiterIssuesInHedString = function (hedString) {
  const issues = []
  let lastNonEmptyValidCharacter = ''
  let lastNonEmptyValidIndex = 0
  let currentTag = ''
  for (let i = 0; i < hedString.length; i++) {
    const currentCharacter = hedString.charAt(i)
    currentTag += currentCharacter
    if (utils.string.stringIsEmpty(currentCharacter)) {
      continue
    }
    if (delimiters.has(currentCharacter)) {
      if (currentTag.trim() === currentCharacter) {
        issues.push(
          generateIssue('extraDelimiter', {
            character: currentCharacter,
            index: i,
            string: hedString,
          }),
        )
        currentTag = ''
        continue
      }
      currentTag = ''
    } else if (currentCharacter === openingGroupCharacter) {
      if (currentTag.trim() === openingGroupCharacter) {
        currentTag = ''
      } else {
        issues.push(generateIssue('invalidTag', { tag: currentTag }))
      }
    } else if (
      isCommaMissingAfterClosingParenthesis(
        lastNonEmptyValidCharacter,
        currentCharacter,
      )
    ) {
      issues.push(
        generateIssue('commaMissing', {
          tag: currentTag.slice(0, -1),
        }),
      )
      break
    }
    lastNonEmptyValidCharacter = currentCharacter
    lastNonEmptyValidIndex = i
  }
  if (delimiters.has(lastNonEmptyValidCharacter)) {
    issues.push(
      generateIssue('extraDelimiter', {
        character: lastNonEmptyValidCharacter,
        index: lastNonEmptyValidIndex,
        string: hedString,
      }),
    )
  }
  return issues
}

/**
 * Validate the full unparsed HED string.
 *
 * @param {string} hedString The unparsed HED string.
 * @return {Issue[][]} String substitution issues and other issues.
 */
const validateFullUnparsedHedString = function (hedString) {
  const [fixedHedString, substitutionIssues] = substituteCharacters(hedString)
  const issues = [].concat(
    countTagGroupParentheses(fixedHedString),
    findDelimiterIssuesInHedString(fixedHedString),
  )
  return [substitutionIssues, issues]
}

/**
 * Parse a full HED string into a object of tag types.
 *
 * @param {string} hedString The full HED string to parse.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @returns {[ParsedHedString|null, Issue[], Issue[]]} The parsed HED tag data and lists of unparsed full string and other parsing issues.
 */
const parseHedString = function (hedString, hedSchemas) {
  const [substitutionIssues, fullHedStringIssues] =
    validateFullUnparsedHedString(hedString)
  const fullStringIssues = fullHedStringIssues.concat(substitutionIssues)
  if (fullHedStringIssues.length > 0) {
    return [null, fullStringIssues, []]
  }
  const parsedString = new ParsedHedString(hedString)
  const [hedTagList, splitIssues] = splitHedString(hedString, hedSchemas)
  parsedString.topLevelTags = findTopLevelTags(
    hedTagList,
    hedSchemas,
    parsedString,
  )
  const tagGroupIssues = findTagGroups(
    hedTagList,
    hedSchemas,
    parsedString,
    true,
  )
  const parsingIssues = [].concat(splitIssues, tagGroupIssues)
  return [parsedString, substitutionIssues, parsingIssues]
}

/**
 * Parse a set of HED strings.
 *
 * @param {string[]} hedStrings A set of HED strings.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @return {[ParsedHedString[], Issue[], Issue[]]} The parsed HED strings and any issues found.
 */
const parseHedStrings = function (hedStrings, hedSchemas) {
  const parsedHedStringsAndIssues = hedStrings.map((hedString) => {
    return parseHedString(hedString, hedSchemas)
  })
  const invalidHedStringIssues = parsedHedStringsAndIssues
    .filter((list) => {
      return list[0] === null
    })
    .map((list) => {
      return list[1]
    })
  const actuallyParsedHedStringsAndIssues = parsedHedStringsAndIssues
    .filter((list) => {
      return list[0] !== null
    })
    .map((list) => {
      return [list[0], [].concat(list[1], list[2])]
    })
  return [...zip(...actuallyParsedHedStringsAndIssues), invalidHedStringIssues]
}

module.exports = {
  ParsedHedTag: ParsedHedTag,
  ParsedHedGroup: ParsedHedGroup,
  ParsedHedString: ParsedHedString,
  hedStringIsAGroup: hedStringIsAGroup,
  removeGroupParentheses: removeGroupParentheses,
  splitHedString: splitHedString,
  parseHedString: parseHedString,
  parseHedStrings: parseHedStrings,
}

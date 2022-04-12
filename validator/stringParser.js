const utils = require('../utils')
const { hedStringIsAGroup, removeGroupParentheses } = require('../utils/hed')
const { generateIssue } = require('../common/issues/issues')

const {
  ParsedHed2Tag,
  ParsedHed3Tag,
  ParsedHedGroup,
  ParsedHedString,
} = require('./types/parsedHed')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const delimiters = new Set([','])

/**
 * Split a full HED string into tags.
 *
 * @param {string} hedString The full HED string.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {int} groupStartingIndex The start index of the group in the full HED string.
 * @returns {[ParsedHedTag[], object<string, Issue[]>]} An array of HED tags (top-level relative to the passed string) and any issues found.
 */
const splitHedString = function (
  hedString,
  hedSchemas,
  groupStartingIndex = 0,
) {
  const doubleQuoteCharacter = '"'
  const invalidCharacters = ['{', '}', '[', ']', '~']

  const hedTags = []
  const conversionIssues = []
  const syntaxIssues = []
  let groupDepth = 0
  let currentTag = ''
  let startingIndex = 0
  let resetStartingIndex = false

  const ParsedHedTag = hedSchemas.isHed3 ? ParsedHed3Tag : ParsedHed2Tag

  const pushTag = function (i) {
    if (!utils.string.stringIsEmpty(currentTag)) {
      const parsedHedTag = new ParsedHedTag(
        currentTag.trim(),
        hedString,
        [groupStartingIndex + startingIndex, groupStartingIndex + i],
        hedSchemas,
      )
      hedTags.push(parsedHedTag)
      conversionIssues.push(parsedHedTag.conversionIssues)
    }
    resetStartingIndex = true
    currentTag = ''
  }

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
      pushTag(i)
    } else if (invalidCharacters.includes(character)) {
      // Found an invalid character, so push an issue.
      syntaxIssues.push(
        generateIssue('invalidCharacter', {
          character: character,
          index: groupStartingIndex + i,
          string: hedString,
        }),
      )
      pushTag(i)
    } else {
      currentTag += character
      if (utils.string.stringIsEmpty(currentTag)) {
        resetStartingIndex = true
        currentTag = ''
      }
    }
  }
  pushTag(hedString.length)

  const issues = {
    syntax: syntaxIssues,
    conversion: conversionIssues.flat(),
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
 * @return {object<string, Issue[]>[]} The array of issues.
 */
const findTagGroups = function (
  groupTagsList,
  hedSchemas,
  parsedString,
  isTopLevel,
) {
  const issues = []
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
      issues.push(nestedGroupIssues, nestedIssues)
    } else if (!parsedString.tags.includes(tagOrGroup)) {
      parsedString.tags.push(tagOrGroup)
    }
  })
  parsedString.definitionGroups = parsedString.tagGroups.filter((group) => {
    return group.isDefinitionGroup
  })

  return issues.flat()
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
 * @return {object<string, Issue[]>} String substitution issues and other issues.
 */
const validateFullUnparsedHedString = function (hedString) {
  const [fixedHedString, substitutionIssues] = substituteCharacters(hedString)
  const delimiterIssues = [].concat(
    countTagGroupParentheses(fixedHedString),
    findDelimiterIssuesInHedString(fixedHedString),
  )

  return {
    substitution: substitutionIssues,
    delimiter: delimiterIssues,
  }
}

/**
 * Parse a full HED string into a object of tag types.
 *
 * @param {string} hedString The full HED string to parse.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @returns {[ParsedHedString|null, object<string, Issue[]>]} The parsed HED tag data and an object containing lists of parsing issues.
 */
const parseHedString = function (hedString, hedSchemas) {
  const fullStringIssues = validateFullUnparsedHedString(hedString)
  if (fullStringIssues.delimiter.length > 0) {
    fullStringIssues.syntax = []
    return [null, fullStringIssues]
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
  const parsingIssues = Object.assign(fullStringIssues, splitIssues)
  for (const tagGroup of tagGroupIssues) {
    for (const key of Object.keys(tagGroup)) {
      parsingIssues[key] =
        parsingIssues[key] !== undefined
          ? parsingIssues[key].concat(tagGroup[key])
          : tagGroup[key]
    }
  }
  return [parsedString, parsingIssues]
}

/**
 * Parse a set of HED strings.
 *
 * @param {string[]} hedStrings A set of HED strings.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @return {[ParsedHedString[], object<string, Issue[]>]} The parsed HED strings and any issues found.
 */
const parseHedStrings = function (hedStrings, hedSchemas) {
  return hedStrings
    .map((hedString) => {
      return parseHedString(hedString, hedSchemas)
    })
    .reduce(
      ([previousStrings, previousIssues], [currentString, currentIssues]) => {
        previousStrings.push(currentString)
        for (const key of Object.keys(currentIssues)) {
          previousIssues[key] =
            previousIssues[key] !== undefined
              ? previousIssues[key].concat(currentIssues[key])
              : currentIssues[key]
        }
        return [previousStrings, previousIssues]
      },
      [[], {}],
    )
}

module.exports = {
  splitHedString: splitHedString,
  parseHedString: parseHedString,
  parseHedStrings: parseHedStrings,
}

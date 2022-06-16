const utils = require('../../utils')
const { mergeParsingIssues } = require('../../utils/hed')
const { generateIssue } = require('../../common/issues/issues')

const ParsedHedString = require('./parsedString')

const splitHedString = require('./splitHedString')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const delimiters = new Set([','])

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
  const numberOfOpeningParentheses = utils.string.getCharacterCount(hedString, openingGroupCharacter)
  const numberOfClosingParentheses = utils.string.getCharacterCount(hedString, closingGroupCharacter)
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
const isCommaMissingAfterClosingParenthesis = function (lastNonEmptyCharacter, currentCharacter) {
  return (
    lastNonEmptyCharacter === closingGroupCharacter &&
    !(delimiters.has(currentCharacter) || currentCharacter === closingGroupCharacter)
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
    } else if (isCommaMissingAfterClosingParenthesis(lastNonEmptyValidCharacter, currentCharacter)) {
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
 * @return {Object<string, Issue[]>} String substitution issues and other issues.
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
 * Parse a full HED string into an object of tag types.
 *
 * @param {string} hedString The full HED string to parse.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @returns {[ParsedHedString|null, Object<string, Issue[]>]} The parsed HED tag data and an object containing lists of parsing issues.
 */
const parseHedString = function (hedString, hedSchemas) {
  const fullStringIssues = validateFullUnparsedHedString(hedString)
  if (fullStringIssues.delimiter.length > 0) {
    fullStringIssues.syntax = []
    return [null, fullStringIssues]
  }
  const [hedTagList, splitIssues] = splitHedString(hedString, hedSchemas)
  const parsedString = new ParsedHedString(hedString, hedTagList, hedSchemas)
  const parsingIssues = Object.assign(fullStringIssues, splitIssues)
  mergeParsingIssues(parsingIssues, parsedString._issues)
  return [parsedString, parsingIssues]
}

/**
 * Parse a set of HED strings.
 *
 * @param {string[]} hedStrings A set of HED strings.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @return {[ParsedHedString[], Object<string, Issue[]>]} The parsed HED strings and any issues found.
 */
const parseHedStrings = function (hedStrings, hedSchemas) {
  return hedStrings
    .map((hedString) => {
      return parseHedString(hedString, hedSchemas)
    })
    .reduce(
      ([previousStrings, previousIssues], [currentString, currentIssues]) => {
        previousStrings.push(currentString)
        mergeParsingIssues(previousIssues, currentIssues)
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
const { ParsedHed2Tag, ParsedHed3Tag, ParsedHedTag } = require('./types')
const utils = require('../../utils')

const { generateIssue } = require('../../common/issues/issues')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const colonCharacter = ':'
const slashCharacter = '/'
const delimiters = new Set([','])
const invalidCharacters = new Set(['{', '}', '[', ']', '~', '"'])

const generationToClass = [
  ParsedHedTag,
  ParsedHedTag, // Generation 1 is not supported by this validator.
  ParsedHed2Tag,
  ParsedHed3Tag,
]

/**
 * Split a HED string into tags.
 *
 * @param {string} hedString The HED string to be split.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {int} groupStartingIndex The start index of the containing group in the full HED string.
 * @returns {[ParsedHedTag[], Object<string, Issue[]>]} An array of HED tags (top-level relative to the passed string) and any issues found.
 */
const splitHedString = function (hedString, hedSchemas, groupStartingIndex = 0) {
  const hedTags = []
  const conversionIssues = []
  const syntaxIssues = []
  let groupDepth = 0
  let currentTag = ''
  let startingIndex = 0
  let resetStartingIndex = false
  /**
   * Indices of colons found before and after the last slash character in currentTag.
   * @type {{before: number[], after: number[]}}
   */
  let colonsFound = { before: [], after: [] }

  const ParsedHedTagClass = generationToClass[hedSchemas.generation]

  const pushTag = function (i) {
    if (!utils.string.stringIsEmpty(currentTag)) {
      let librarySchemaName = ''
      if (colonsFound.before.length === 1) {
        const colonIndex = colonsFound.before.pop()
        librarySchemaName = currentTag.substring(0, colonIndex)
        currentTag = currentTag.substring(colonIndex + 1)
      }
      const parsedHedTag = new ParsedHedTagClass(
        currentTag.trim(),
        hedString,
        [groupStartingIndex + startingIndex, groupStartingIndex + i],
        hedSchemas,
        librarySchemaName,
      )
      hedTags.push(parsedHedTag)
      conversionIssues.push(...parsedHedTag.conversionIssues)
    }
    resetStartingIndex = true
    currentTag = ''
    for (const extraColonIndex of colonsFound.before) {
      syntaxIssues.push(
        generateIssue('invalidCharacter', {
          character: colonCharacter,
          index: groupStartingIndex + extraColonIndex,
          string: hedString,
        }),
      )
    }
    colonsFound = { before: [], after: [] }
  }

  // Loop a character at a time.
  for (let i = 0; i < hedString.length; i++) {
    if (resetStartingIndex) {
      startingIndex = i
      resetStartingIndex = false
    }
    const character = hedString.charAt(i)
    if (character === openingGroupCharacter) {
      // Count group characters
      groupDepth++
    } else if (character === closingGroupCharacter) {
      groupDepth--
    } else if (character === slashCharacter) {
      colonsFound.before.push(...colonsFound.after)
      colonsFound.after = []
    } else if (character === colonCharacter) {
      colonsFound.after.push(i)
    }
    if (groupDepth === 0 && delimiters.has(character)) {
      // Found the end of a tag, so push the current tag.
      pushTag(i)
    } else if (invalidCharacters.has(character)) {
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
    conversion: conversionIssues,
  }

  return [hedTags, issues]
}

module.exports = splitHedString

const { ParsedHedSubstring, ParsedHed2Tag, ParsedHed3Tag, ParsedHedTag } = require('./types')

const { generateIssue } = require('../../common/issues/issues')
const { hedStringIsAGroup } = require('../../utils/hed')
const { stringIsEmpty } = require('../../utils/string')

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
 * @returns {[ParsedHedSubstring[], Object<string, Issue[]>]} An array of HED tags (top-level relative to the passed string) and any issues found.
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
  let slashFound = false

  const ParsedHedTagClass = generationToClass[hedSchemas.generation]

  const pushTag = function (i) {
    if (stringIsEmpty(currentTag)) {
      resetStartingIndex = true
      return
    }

    let librarySchemaName = ''
    const colonsUsed = slashFound ? colonsFound.before : colonsFound.after
    if (colonsUsed.length === 1) {
      const colonIndex = colonsUsed.pop()
      librarySchemaName = currentTag.substring(0, colonIndex)
      currentTag = currentTag.substring(colonIndex + 1)
    }
    const currentBounds = [groupStartingIndex + startingIndex, groupStartingIndex + i]
    currentTag = currentTag.trim()
    if (hedStringIsAGroup(currentTag)) {
      hedTags.push(new ParsedHedSubstring(currentTag, currentBounds))
    } else {
      const parsedHedTag = new ParsedHedTagClass(currentTag, hedString, currentBounds, hedSchemas, librarySchemaName)
      hedTags.push(parsedHedTag)
      conversionIssues.push(...parsedHedTag.conversionIssues)
    }
    for (const extraColonIndex of colonsFound.before) {
      syntaxIssues.push(
        generateIssue('invalidCharacter', {
          character: colonCharacter,
          index: groupStartingIndex + extraColonIndex,
          string: hedString,
        }),
      )
    }
    resetStartingIndex = true
    colonsFound = { before: [], after: [] }
    slashFound = false
  }

  // Loop a character at a time.
  for (let i = 0; i < hedString.length; i++) {
    const character = hedString.charAt(i)
    if (character === openingGroupCharacter) {
      // Count group characters
      groupDepth++
    } else if (character === closingGroupCharacter) {
      groupDepth--
    } else if (character === slashCharacter) {
      colonsFound.before.push(...colonsFound.after)
      colonsFound.after = []
      slashFound = true
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
      if (stringIsEmpty(currentTag)) {
        resetStartingIndex = true
      }
    }
    if (resetStartingIndex) {
      resetStartingIndex = false
      startingIndex = i + 1
      currentTag = ''
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

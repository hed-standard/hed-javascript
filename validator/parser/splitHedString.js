const { ParsedHedGroup, ParsedHed2Tag, ParsedHed3Tag, ParsedHedTag } = require('./types')

const { generateIssue } = require('../../common/issues/issues')
const { recursiveMap } = require('../../utils/array')
const { mergeParsingIssues } = require('../../utils/hed')
const { stringIsEmpty } = require('../../utils/string')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const commaCharacter = ','
const colonCharacter = ':'
const slashCharacter = '/'
const invalidCharacters = new Set(['{', '}', '[', ']', '~', '"'])

const generationToClass = [
  ParsedHedTag,
  ParsedHedTag, // Generation 1 is not supported by this validator.
  ParsedHed2Tag,
  ParsedHed3Tag,
]

/**
 * Split a HED string into delimiters and tags.
 *
 * @param {string} hedString The HED string to be split.
 * @return {[Array, Object<string, Issue[]>]} The tag specifications and any issues found.
 */
const tokenizeHedString = function (hedString) {
  const syntaxIssues = []

  let currentTag = ''
  let groupDepth = 0
  let startingIndex = 0
  let resetStartingIndex = false
  let slashFound = false
  let librarySchema = ''
  const currentGroupStack = [[]]

  for (let i = 0; i < hedString.length; i++) {
    const character = hedString.charAt(i)
    switch (character) {
      case openingGroupCharacter:
        currentGroupStack.push([])
        resetStartingIndex = true
        groupDepth++
        break
      case closingGroupCharacter:
        try {
          if (!stringIsEmpty(currentTag)) {
            currentGroupStack[groupDepth].push({
              library: librarySchema,
              tag: currentTag.trim(),
              bounds: [startingIndex, i],
            })
          }
          currentGroupStack[groupDepth - 1].push(currentGroupStack.pop())
          resetStartingIndex = true
          groupDepth--
        } catch (e) {
          groupDepth = 0
        }
        break
      case commaCharacter:
        if (!stringIsEmpty(currentTag)) {
          currentGroupStack[groupDepth].push({
            library: librarySchema,
            tag: currentTag.trim(),
            bounds: [startingIndex, i],
          })
          resetStartingIndex = true
        }
        break
      case colonCharacter:
        if (!slashFound) {
          librarySchema = currentTag
          resetStartingIndex = true
        } else {
          currentTag += character
        }
        break
      case slashCharacter:
        slashFound = true
        currentTag += character
        break
      default:
        if (invalidCharacters.has(character)) {
          // Found an invalid character, so push an issue.
          syntaxIssues.push(
            generateIssue('invalidCharacter', {
              character: character,
              index: i,
              string: hedString,
            }),
          )
          currentGroupStack[groupDepth].push({
            library: librarySchema,
            tag: currentTag.trim(),
            bounds: [startingIndex, i],
          })
        }
        currentTag += character
        if (stringIsEmpty(currentTag)) {
          resetStartingIndex = true
        }
    }
    if (resetStartingIndex) {
      resetStartingIndex = false
      startingIndex = i + 1
      currentTag = ''
      librarySchema = ''
    }
  }
  if (!stringIsEmpty(currentTag)) {
    currentGroupStack[groupDepth].push({
      library: librarySchema,
      tag: currentTag.trim(),
      bounds: [startingIndex, hedString.length],
    })
  }

  const tagSpecs = currentGroupStack.pop()
  const issues = {
    syntax: syntaxIssues,
    conversion: [],
  }
  return [tagSpecs, issues]
}

/**
 * Create the parsed HED tag and group objects.
 *
 * @param {string} hedString The HED string to be split.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {Array} tagSpecs The tag specifications.
 * @return {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED string data and any issues found.
 */
const createParsedTags = function (hedString, hedSchemas, tagSpecs) {
  const conversionIssues = []
  const syntaxIssues = []
  const ParsedHedTagClass = generationToClass[hedSchemas.generation]

  const createParsedTag = ({ library: librarySchema, tag: originalTag, bounds: originalBounds }) => {
    const parsedTag = new ParsedHedTagClass(originalTag, hedString, originalBounds, hedSchemas, librarySchema)
    conversionIssues.push(...parsedTag.conversionIssues)
    return parsedTag
  }
  const createParsedGroup = (tags) => {
    if (Array.isArray(tags)) {
      return new ParsedHedGroup(tags.map(createParsedGroup), hedSchemas)
    } else {
      return tags
    }
  }
  const parsedTags = recursiveMap(createParsedTag, tagSpecs)
  const parsedTagsWithGroups = parsedTags.map(createParsedGroup)

  const issues = {
    syntax: syntaxIssues,
    conversion: conversionIssues,
  }

  return [parsedTagsWithGroups, issues]
}

/**
 * Split a HED string.
 *
 * @param {string} hedString The HED string to be split.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @return {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED string data and any issues found.
 */
const splitHedString = function (hedString, hedSchemas) {
  const [tagSpecs, splitIssues] = tokenizeHedString(hedString)
  const [parsedTags, parsingIssues] = createParsedTags(hedString, hedSchemas, tagSpecs)
  mergeParsingIssues(splitIssues, parsingIssues)
  return [parsedTags, splitIssues]
}

module.exports = splitHedString

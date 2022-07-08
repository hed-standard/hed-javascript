const { ParsedHedGroup, ParsedHed2Tag, ParsedHed3Tag, ParsedHedTag } = require('./types')

const { generateIssue } = require('../../common/issues/issues')
const { flattenDeep, recursiveMap } = require('../../utils/array')
const { mergeParsingIssues, replaceTagNameWithPound } = require('../../utils/hed')
const { stringIsEmpty } = require('../../utils/string')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const commaCharacter = ','
const colonCharacter = ':'
const slashCharacter = '/'
const invalidCharacters = new Set(['{', '}', '[', ']', '~', '"'])
const invalidCharactersOutsideOfValues = new Set([':'])

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
  const parenthesesStack = []

  const pushTag = (i) => {
    if (!stringIsEmpty(currentTag)) {
      currentGroupStack[groupDepth].push({
        library: librarySchema,
        tag: currentTag.trim(),
        bounds: [startingIndex, i],
      })
    }
    resetStartingIndex = true
    librarySchema = ''
  }

  for (let i = 0; i < hedString.length; i++) {
    const character = hedString.charAt(i)
    switch (character) {
      case openingGroupCharacter:
        currentGroupStack.push([])
        parenthesesStack.push(i)
        resetStartingIndex = true
        groupDepth++
        break
      case closingGroupCharacter:
        pushTag(i)
        parenthesesStack.pop()
        if (groupDepth > 0) {
          currentGroupStack[groupDepth - 1].push(currentGroupStack.pop())
          groupDepth--
        } else {
          syntaxIssues.push(
            generateIssue('unopenedParenthesis', {
              index: i,
              string: hedString,
            }),
          )
        }
        break
      case commaCharacter:
        pushTag(i)
        break
      case colonCharacter:
        if (!slashFound && !librarySchema) {
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
  while (groupDepth > 0) {
    syntaxIssues.push(
      generateIssue('unclosedParenthesis', {
        index: parenthesesStack.pop(),
        string: hedString,
      }),
    )
    currentGroupStack[groupDepth - 1].push(currentGroupStack.pop())
    groupDepth--
  }

  const tagSpecs = currentGroupStack.pop()
  const issues = {
    syntax: syntaxIssues,
    conversion: [],
  }
  return [tagSpecs, issues]
}

/**
 * Check the split HED tags for invalid characters
 *
 * @param {string} hedString The HED string to be split.
 * @param {Array} tagSpecs The tag specifications.
 * @return {Object<string, Issue[]>} Any issues found.
 */
const checkForInvalidCharacters = function (hedString, tagSpecs) {
  const syntaxIssues = []
  const flatTagSpecs = flattenDeep(tagSpecs)

  const checkTag = (tagSpec, tag, invalidSet) => {
    for (let i = 0; i < tag.length; i++) {
      const character = tag.charAt(i)
      if (invalidSet.has(character)) {
        tagSpec.invalidCharacter = true
        syntaxIssues.push(
          generateIssue('invalidCharacter', {
            character: character,
            index: tagSpec.bounds[0] + i,
            string: hedString,
          }),
        )
      }
    }
  }
  for (const tagSpec of flatTagSpecs) {
    checkTag(tagSpec, tagSpec.tag, invalidCharacters)
    const valueTag = replaceTagNameWithPound(tagSpec.tag)
    checkTag(tagSpec, valueTag, invalidCharactersOutsideOfValues)
  }

  return { syntax: syntaxIssues, conversion: [] }
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
  const characterIssues = checkForInvalidCharacters(hedString, tagSpecs)
  const [parsedTags, parsingIssues] = createParsedTags(hedString, hedSchemas, tagSpecs)
  mergeParsingIssues(splitIssues, characterIssues)
  mergeParsingIssues(splitIssues, parsingIssues)
  return [parsedTags, splitIssues]
}

module.exports = splitHedString

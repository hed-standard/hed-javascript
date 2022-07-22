const flattenDeep = require('lodash/flattenDeep')

const { ParsedHedGroup, ParsedHed2Tag, ParsedHed3Tag, ParsedHedTag } = require('./types')

const { generateIssue } = require('../../common/issues/issues')
const { recursiveMap } = require('../../utils/array')
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

class TagSpec {
  constructor(tag, start, end, librarySchema) {
    this.tag = tag.trim()
    this.bounds = [start, end]
    /**
     * @type {string}
     */
    this.library = librarySchema
  }
}

class GroupSpec {
  constructor(start, finish) {
    this.start = start
    this.finish = finish
    /**
     * @type {GroupSpec[]}
     */
    this.children = []
  }

  get bounds() {
    return [this.start, this.finish]
  }
}

/**
 * Split a HED string into delimiters and tags.
 *
 * @param {string} hedString The HED string to be split.
 * @return {[TagSpec[], GroupSpec, Object<string, Issue[]>]} The tag specifications, group bounds, and any issues found.
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
  const parenthesesStack = [new GroupSpec(0, hedString.length)]

  const pushTag = (i) => {
    if (!stringIsEmpty(currentTag)) {
      currentGroupStack[groupDepth].push(new TagSpec(currentTag, startingIndex, i, librarySchema))
    }
    resetStartingIndex = true
    librarySchema = ''
  }

  const closeGroup = (i) => {
    const bounds = parenthesesStack.pop()
    bounds.finish = i + 1
    parenthesesStack[groupDepth - 1].children.push(bounds)
    currentGroupStack[groupDepth - 1].push(currentGroupStack.pop())
    groupDepth--
  }

  for (let i = 0; i < hedString.length; i++) {
    const character = hedString.charAt(i)
    switch (character) {
      case openingGroupCharacter:
        currentGroupStack.push([])
        parenthesesStack.push(new GroupSpec(i))
        resetStartingIndex = true
        groupDepth++
        break
      case closingGroupCharacter: {
        pushTag(i)
        if (groupDepth <= 0) {
          syntaxIssues.push(
            generateIssue('unopenedParenthesis', {
              index: i,
              string: hedString,
            }),
          )
          break
        }
        closeGroup(i)
        break
      }
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
        resetStartingIndex = stringIsEmpty(currentTag)
    }
    if (resetStartingIndex) {
      resetStartingIndex = false
      startingIndex = i + 1
      currentTag = ''
    }
  }
  pushTag(hedString.length)

  // groupDepth is decremented in closeGroup.
  // eslint-disable-next-line no-unmodified-loop-condition
  while (groupDepth > 0) {
    syntaxIssues.push(
      generateIssue('unclosedParenthesis', {
        index: parenthesesStack[parenthesesStack.length - 1].start,
        string: hedString,
      }),
    )
    closeGroup(hedString.length)
  }

  const tagSpecs = currentGroupStack.pop()
  const groupSpecs = parenthesesStack.pop()
  const issues = {
    syntax: syntaxIssues,
    conversion: [],
  }
  return [tagSpecs, groupSpecs, issues]
}

/**
 * Check the split HED tags for invalid characters
 *
 * @param {string} hedString The HED string to be split.
 * @param {TagSpec[]} tagSpecs The tag specifications.
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
 * @param {TagSpec[]} tagSpecs The tag specifications.
 * @param {GroupSpec} groupSpecs The bounds of the tag groups.
 * @return {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED string data and any issues found.
 */
const createParsedTags = function (hedString, hedSchemas, tagSpecs, groupSpecs) {
  const conversionIssues = []
  const syntaxIssues = []
  const ParsedHedTagClass = generationToClass[hedSchemas.generation]

  const createParsedTag = ({ library: librarySchema, tag: originalTag, bounds: originalBounds }) => {
    const parsedTag = new ParsedHedTagClass(originalTag, hedString, originalBounds, hedSchemas, librarySchema)
    conversionIssues.push(...parsedTag.conversionIssues)
    return parsedTag
  }
  const createParsedGroups = (tags, groupSpecs) => {
    const tagGroups = []
    let index = 0
    for (const tag of tags) {
      if (Array.isArray(tag)) {
        const groupSpec = groupSpecs[index]
        tagGroups.push(
          new ParsedHedGroup(createParsedGroups(tag, groupSpec.children), hedSchemas, hedString, groupSpec.bounds),
        )
        index++
      } else {
        tagGroups.push(tag)
      }
    }
    return tagGroups
  }
  const parsedTags = recursiveMap(createParsedTag, tagSpecs)
  const parsedTagsWithGroups = createParsedGroups(parsedTags, groupSpecs.children)

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
  const [tagSpecs, groupBounds, splitIssues] = tokenizeHedString(hedString)
  const characterIssues = checkForInvalidCharacters(hedString, tagSpecs)
  mergeParsingIssues(splitIssues, characterIssues)
  if (splitIssues.syntax.length > 0) {
    return [null, splitIssues]
  }
  const [parsedTags, parsingIssues] = createParsedTags(hedString, hedSchemas, tagSpecs, groupBounds)
  mergeParsingIssues(splitIssues, parsingIssues)
  return [parsedTags, splitIssues]
}

module.exports = splitHedString

import flattenDeep from 'lodash/flattenDeep'

import { ParsedHedTag, ParsedHed3Tag } from './parsedHedTag'
import ParsedHedGroup from './parsedHedGroup'
import { Schema, Schemas } from '../../common/schema/types'
import { generateIssue } from '../../common/issues/issues'
import { recursiveMap } from '../../utils/array'
import { replaceTagNameWithPound } from '../../utils/hedStrings'
import { mergeParsingIssues } from '../../utils/hedData'
import { stringIsEmpty } from '../../utils/string'
import { ParsedHed2Tag } from '../hed2/parser/parsedHed2Tag'

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

class HedStringTokenizer {
  hedString
  syntaxIssues
  currentTag
  groupDepth
  startingIndex
  resetStartingIndex
  slashFound
  librarySchema
  currentGroupStack
  parenthesesStack

  constructor(hedString) {
    this.hedString = hedString
  }

  tokenize() {
    this.initializeTokenizer()

    for (let i = 0; i < this.hedString.length; i++) {
      const character = this.hedString.charAt(i)
      this.tokenizeCharacter(i, character)
      if (this.resetStartingIndex) {
        this.resetStartingIndex = false
        this.startingIndex = i + 1
        this.currentTag = ''
      }
    }
    this.pushTag(this.hedString.length)

    this.unwindGroupStack()

    const tagSpecs = this.currentGroupStack.pop()
    const groupSpecs = this.parenthesesStack.pop()
    const issues = {
      syntax: this.syntaxIssues,
      conversion: [],
    }
    return [tagSpecs, groupSpecs, issues]
  }

  initializeTokenizer() {
    this.syntaxIssues = []

    this.currentTag = ''
    this.groupDepth = 0
    this.startingIndex = 0
    this.resetStartingIndex = false
    this.slashFound = false
    this.librarySchema = ''
    this.currentGroupStack = [[]]
    this.parenthesesStack = [new GroupSpec(0, this.hedString.length)]
  }

  tokenizeCharacter(i, character) {
    const dispatchTable = {
      [openingGroupCharacter]: (i, character) => this.openingGroupCharacter(i),
      [closingGroupCharacter]: (i, character) => this.closingGroupCharacter(i),
      [commaCharacter]: (i, character) => this.pushTag(i),
      [colonCharacter]: (i, character) => this.colonCharacter(character),
      [slashCharacter]: (i, character) => this.slashCharacter(character),
    }
    const characterHandler = dispatchTable[character]
    if (characterHandler) {
      characterHandler(i, character)
    } else {
      this.otherCharacter(character)
    }
  }

  openingGroupCharacter(i) {
    this.currentGroupStack.push([])
    this.parenthesesStack.push(new GroupSpec(i))
    this.resetStartingIndex = true
    this.groupDepth++
  }

  closingGroupCharacter(i) {
    this.pushTag(i)
    if (this.groupDepth <= 0) {
      this.syntaxIssues.push(
        generateIssue('unopenedParenthesis', {
          index: i,
          string: this.hedString,
        }),
      )
      return
    }
    this.closeGroup(i)
  }

  colonCharacter(character) {
    if (!this.slashFound && !this.librarySchema) {
      this.librarySchema = this.currentTag
      this.resetStartingIndex = true
    } else {
      this.currentTag += character
    }
  }

  slashCharacter(character) {
    this.slashFound = true
    this.currentTag += character
  }

  otherCharacter(character) {
    this.currentTag += character
    this.resetStartingIndex = stringIsEmpty(this.currentTag)
  }

  unwindGroupStack() {
    // groupDepth is decremented in closeGroup.
    // eslint-disable-next-line no-unmodified-loop-condition
    while (this.groupDepth > 0) {
      this.syntaxIssues.push(
        generateIssue('unclosedParenthesis', {
          index: this.parenthesesStack[this.parenthesesStack.length - 1].start,
          string: this.hedString,
        }),
      )
      this.closeGroup(this.hedString.length)
    }
  }

  pushTag(i) {
    if (!stringIsEmpty(this.currentTag)) {
      this.currentGroupStack[this.groupDepth].push(
        new TagSpec(this.currentTag, this.startingIndex, i, this.librarySchema),
      )
    }
    this.resetStartingIndex = true
    this.slashFound = false
    this.librarySchema = ''
  }

  closeGroup(i) {
    const bounds = this.parenthesesStack.pop()
    bounds.finish = i + 1
    this.parenthesesStack[this.groupDepth - 1].children.push(bounds)
    this.currentGroupStack[this.groupDepth - 1].push(this.currentGroupStack.pop())
    this.groupDepth--
  }
}

/**
 * Split a HED string into delimiters and tags.
 *
 * @param {string} hedString The HED string to be split.
 * @return {[TagSpec[], GroupSpec, Object<string, Issue[]>]} The tag specifications, group bounds, and any issues found.
 */

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

  for (const tagSpec of flatTagSpecs) {
    const alwaysInvalidIssues = checkTagForInvalidCharacters(hedString, tagSpec, tagSpec.tag, invalidCharacters)
    const valueTag = replaceTagNameWithPound(tagSpec.tag)
    const outsideValueIssues = checkTagForInvalidCharacters(
      hedString,
      tagSpec,
      valueTag,
      invalidCharactersOutsideOfValues,
    )
    syntaxIssues.push(...alwaysInvalidIssues, ...outsideValueIssues)
  }

  return { syntax: syntaxIssues, conversion: [] }
}

/**
 * Check an individual tag for invalid characters.
 *
 * @param {string} hedString The HED string to be split.
 * @param {TagSpec} tagSpec A tag specification.
 * @param {string} tag The tag form to be checked.
 * @param {Set<string>} invalidSet The set of invalid characters.
 * @returns {Issue[]} Any issues found.
 */
const checkTagForInvalidCharacters = function (hedString, tagSpec, tag, invalidSet) {
  const issues = []
  for (let i = 0; i < tag.length; i++) {
    const character = tag.charAt(i)
    if (invalidSet.has(character)) {
      tagSpec.invalidCharacter = true
      issues.push(
        generateIssue('invalidCharacter', {
          character: character,
          index: tagSpec.bounds[0] + i,
          string: hedString,
        }),
      )
    }
  }
  return issues
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
export default function splitHedString(hedString, hedSchemas) {
  const [tagSpecs, groupBounds, splitIssues] = new HedStringTokenizer(hedString).tokenize()
  const characterIssues = checkForInvalidCharacters(hedString, tagSpecs)
  mergeParsingIssues(splitIssues, characterIssues)
  if (splitIssues.syntax.length > 0) {
    return [null, splitIssues]
  }
  const [parsedTags, parsingIssues] = createParsedTags(hedString, hedSchemas, tagSpecs, groupBounds)
  mergeParsingIssues(splitIssues, parsingIssues)
  return [parsedTags, splitIssues]
}

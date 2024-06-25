import { ParsedHed3Tag, ParsedHedTag } from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { Schemas } from '../common/schema/types'
import { recursiveMap } from '../utils/array'
import { mergeParsingIssues } from '../utils/hedData'
import { ParsedHed2Tag } from '../validator/hed2/parser/parsedHed2Tag'
import { HedStringTokenizer, ColumnSpliceSpec, TagSpec } from './tokenizer'

const generationToClass = [
  ParsedHedTag,
  ParsedHedTag, // Generation 1 is not supported by this validator.
  ParsedHed2Tag,
  ParsedHed3Tag,
]

/**
 * Create the parsed HED tag and group objects.
 *
 * @param {string} hedString The HED string to be split.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {TagSpec[]} tagSpecs The tag specifications.
 * @param {GroupSpec} groupSpecs The bounds of the tag groups.
 * @returns {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED string data and any issues found.
 */
const createParsedTags = function (hedString, hedSchemas, tagSpecs, groupSpecs) {
  const conversionIssues = []
  const syntaxIssues = []
  const ParsedHedTagClass = generationToClass[hedSchemas.generation]

  const createParsedTag = (tagSpec) => {
    if (tagSpec instanceof TagSpec) {
      const parsedTag = new ParsedHedTagClass(tagSpec.tag, hedString, tagSpec.bounds, hedSchemas, tagSpec.library)
      conversionIssues.push(...parsedTag.conversionIssues)
      return parsedTag
    } else if (tagSpec instanceof ColumnSpliceSpec) {
      return new ParsedHedColumnSplice(tagSpec.columnName, tagSpec.bounds)
    }
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
 * @returns {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED string data and any issues found.
 */
export default function splitHedString(hedString, hedSchemas) {
  const [tagSpecs, groupBounds, tokenizingIssues] = new HedStringTokenizer(hedString).tokenize()
  if (tokenizingIssues.syntax.length > 0) {
    return [null, tokenizingIssues]
  }
  const [parsedTags, parsingIssues] = createParsedTags(hedString, hedSchemas, tagSpecs, groupBounds)
  mergeParsingIssues(tokenizingIssues, parsingIssues)
  return [parsedTags, tokenizingIssues]
}

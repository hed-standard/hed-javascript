import { ParsedHedTag } from './parsedHedTag'
import ParsedHedGroup from './parsedHedGroup'
import { ParsedHedColumnSplice, ParsedHedColumnSubstitution } from './parsedHedColumnSplice'
import { generateIssue, IssueError } from '../../common/issues/issues'

/**
 * A parsed HED string.
 */
export class ParsedHedString {
  /**
   * The original HED string.
   * @type {string}
   */
  hedString
  /**
   * The parsed substring data in unfiltered form.
   * @type {ParsedHedSubstring[]}
   */
  parseTree
  /**
   * The tag groups in the string.
   * @type {ParsedHedGroup[]}
   */
  tagGroups
  /**
   * All the top-level tags in the string.
   * @type {ParsedHedTag[]}
   */
  topLevelTags
  /**
   * All the tags in the string.
   * @type {ParsedHedTag[]}
   */
  tags
  /**
   * All the column splices in the string.
   * @type {ParsedHedColumnSplice[]}
   */
  columnSplices
  /**
   * The top-level tag groups in the string, split into arrays.
   * @type {ParsedHedTag[][]}
   */
  topLevelTagGroups
  /**
   * The definition tag groups in the string.
   * @type {ParsedHedGroup[]}
   */
  definitionGroups

  /**
   * Constructor.
   * @param {string} hedString The original HED string.
   * @param {ParsedHedSubstring[]} parsedTags The nested list of parsed HED tags and groups.
   */
  constructor(hedString, parsedTags) {
    this.hedString = hedString
    this.parseTree = parsedTags
    this.tagGroups = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedGroup)
    this.topLevelTags = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag)
    /**
     * @type {ParsedHedColumnSplice[]}
     */
    const topLevelColumnSplices = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedColumnSplice)

    const subgroupTags = this.tagGroups.flatMap((tagGroup) => Array.from(tagGroup.tagIterator()))
    this.tags = this.topLevelTags.concat(subgroupTags)

    const subgroupColumnSplices = this.tagGroups.flatMap((tagGroup) => Array.from(tagGroup.columnSpliceIterator()))
    this.columnSplices = topLevelColumnSplices.concat(subgroupColumnSplices)

    this.topLevelTagGroups = this.tagGroups.map((tagGroup) =>
      tagGroup.tags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag),
    )
    this.definitionGroups = this.tagGroups.filter((group) => {
      return group.isDefinitionGroup
    })
  }

  get definitions() {
    return this.definitionGroups.map((group) => {
      return [group.definitionName, group]
    })
  }

  /**
   * Iterator over the parsed HED tags in this HED tag group.
   *
   * @yields {ParsedHedTag} This tag group's HED tags.
   */
  *tagIterator() {
    yield* this._innerTagIterator(this.parseTree, false)
  }

  /**
   * Implementation of {@link tagIterator}.
   *
   * @param {ParsedHedSubstring[]} tagList A list of HED substrings.
   * @param {boolean} inColumn Whether this was called within a {@link ParsedHedColumnSubstitution} context (only one level of recursion is allowed).
   * @yields {ParsedHedTag}
   * @private
   */
  *_innerTagIterator(tagList, inColumn) {
    for (const innerTag of tagList) {
      if (innerTag instanceof ParsedHedTag) {
        yield innerTag
      } else if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.tagIterator()
      } else if (innerTag instanceof ParsedHedColumnSubstitution) {
        if (inColumn) {
          throw new IssueError(generateIssue('recursiveCurlyBraces', { column: innerTag }))
        }
        yield* this._innerTagIterator(innerTag.data, true)
      }
    }
  }
}

export default ParsedHedString

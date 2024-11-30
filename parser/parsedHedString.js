import ParsedHedTag from './parsedHedTag'
import ParsedHedGroup from './parsedHedGroup'
import ParsedHedColumnSplice from './parsedHedColumnSplice'

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
   * The tag groups in the string (top-level).
   * @type {ParsedHedGroup[]}
   */
  tagGroups
  /**
   * All the top-level tags in the string.
   * @type {ParsedHedTag[]}
   */
  topLevelTags
  /**
   * All the tags in the string at all levels
   * @type {ParsedHedTag[]}
   */
  tags
  /**
   * All the column splices in the string at all levels.
   * @type {ParsedHedColumnSplice[]}
   */
  columnSplices
  /**
   * The top-level tag groups in the string, split into arrays.
   * @type {ParsedHedTag[][]}
   */
  topLevelGroupTags
  /**
   * The top-level definition tag groups in the string.
   * @type {ParsedHedGroup[]}
   */
  definitionGroups
  /**
   * The context in which this string was defined. Applicable definitions.
   * @type {Map<string, *>}
   */
  context

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
    const topLevelColumnSplices = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedColumnSplice)

    const subgroupTags = this.tagGroups.flatMap((tagGroup) => Array.from(tagGroup.tagIterator()))
    this.tags = this.topLevelTags.concat(subgroupTags)

    const subgroupColumnSplices = this.tagGroups.flatMap((tagGroup) => Array.from(tagGroup.columnSpliceIterator()))
    this.columnSplices = topLevelColumnSplices.concat(subgroupColumnSplices)

    this.topLevelGroupTags = this.tagGroups.map((tagGroup) =>
      tagGroup.tags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag),
    )
    this.definitionGroups = this.tagGroups.filter((group) => {
      return group.isDefinitionGroup
    })

    this.context = new Map()
  }

  /**
   * Nicely format this HED string. (Doesn't allow column splices).
   *
   * @param {boolean} long Whether the tags should be in long form.
   * @returns {string}
   */
  format(long = true) {
    return this.parseTree.map((substring) => substring.format(long)).join(', ')
  }

  get definitions() {
    return this.definitionGroups.map((group) => {
      return [group.definitionName, group]
    })
  }

  /**
   * Override of {@link Object.prototype.toString}.
   *
   * @returns {string}
   */
  toString() {
    return this.hedString
  }
}

export default ParsedHedString

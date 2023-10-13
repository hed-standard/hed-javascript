import { ParsedHedTag } from './parsedHedTag'
import ParsedHedGroup from './parsedHedGroup'
import ParsedHedColumnSplice from './parsedHedColumnSplice'

/**
 * A parsed HED string.
 */
export default class ParsedHedString {
  /**
   * The original HED string.
   * @type {string}
   */
  hedString
  /**
   * The tag groups in the string.
   * @type ParsedHedGroup[]
   */
  tagGroups
  /**
   * All the top-level tags in the string.
   * @type ParsedHedTag[]
   */
  topLevelTags
  /**
   * All the tags in the string.
   * @type ParsedHedTag[]
   */
  tags
  /**
   * All the column splices in the string.
   * @type ParsedHedColumnSplice[]
   */
  columnSplices
  /**
   * The top-level tag groups in the string, split into arrays.
   * @type ParsedHedTag[][]
   */
  topLevelTagGroups
  /**
   * The definition tag groups in the string.
   * @type ParsedHedGroup[]
   */
  definitionGroups

  /**
   * Constructor.
   * @param {string} hedString The original HED string.
   * @param {ParsedHedSubstring[]} parsedTags The nested list of parsed HED tags and groups.
   */
  constructor(hedString, parsedTags) {
    this.hedString = hedString
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
}

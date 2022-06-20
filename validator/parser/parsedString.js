const { removeGroupParentheses, mergeParsingIssues, hedStringIsAGroup } = require('../../utils/hed')
const splitHedString = require('./splitHedString')
const { ParsedHedGroup, ParsedHedTag } = require('./types')

/**
 * A parsed HED string.
 */
class ParsedHedString {
  /**
   * Constructor.
   * @param {string} hedString The original HED string.
   * @param {ParsedHedTag[]} tagList The list of parsed HED tags.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(hedString, tagList, hedSchemas) {
    /**
     * The original HED string.
     * @type {string}
     */
    this.hedString = hedString
    /**
     * All of the tags in the string.
     * @type ParsedHedTag[]
     */
    this.tags = []

    this._issues = { syntax: [], conversion: [] }
    const topLevelData = this._buildTagGroupTagList(tagList, hedSchemas)
    /**
     * The tag groups in the string.
     * @type ParsedHedGroup[]
     */
    this.tagGroups = topLevelData.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedGroup)
    /**
     * All of the top-level tags in the string.
     * @type ParsedHedTag[]
     */
    this.topLevelTags = topLevelData.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag)
    /**
     * The top-level tag groups in the string, split into arrays.
     * @type ParsedHedTag[][]
     */
    this.topLevelTagGroups = this.tagGroups.map((tagGroup) =>
      tagGroup.tags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag),
    )
    /**
     * The definition tag groups in the string.
     * @type ParsedHedGroup[]
     */
    this.definitionGroups = this.tagGroups.filter((group) => {
      return group.isDefinitionGroup
    })
  }

  get definitions() {
    return this.definitionGroups.map((group) => {
      return [group.definitionName, group]
    })
  }

  _buildTagGroup(parsedTag, hedSchemas) {
    const tagGroupString = removeGroupParentheses(parsedTag.originalTag)
    // Split the group tag and recurse.
    const [tagList, issues] = splitHedString(tagGroupString, hedSchemas, parsedTag.originalBounds[0] + 1)
    mergeParsingIssues(this._issues, issues)
    const parsedTagList = this._buildTagGroupTagList(tagList, hedSchemas)
    return new ParsedHedGroup(parsedTag.originalTag, parsedTagList, parsedTag.originalBounds, hedSchemas)
  }

  _buildTagGroupTagList(tagList, hedSchemas) {
    return tagList.map((tagOrGroup) => {
      if (hedStringIsAGroup(tagOrGroup.originalTag)) {
        return this._buildTagGroup(tagOrGroup, hedSchemas)
      } else {
        if (!this.tags.includes(tagOrGroup)) {
          this.tags.push(tagOrGroup)
        }
        return tagOrGroup
      }
    })
  }
}

module.exports = ParsedHedString

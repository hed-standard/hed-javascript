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
   * @param {ParsedHedSubstring[]} parsedTags The nested list of parsed HED tags and groups.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(hedString, parsedTags, hedSchemas) {
    /**
     * The original HED string.
     * @type {string}
     */
    this.hedString = hedString

    this._issues = { syntax: [], conversion: [] }
    /**
     * The tag groups in the string.
     * @type ParsedHedGroup[]
     */
    this.tagGroups = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedGroup)
    /**
     * All of the top-level tags in the string.
     * @type ParsedHedTag[]
     */
    this.topLevelTags = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag)

    const subgroupTags = this.tagGroups.flatMap((tagGroup) => Array.from(tagGroup.tagIterator()))
    /**
     * All of the tags in the string.
     * @type ParsedHedTag[]
     */
    this.tags = this.topLevelTags.concat(subgroupTags)

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
}

module.exports = ParsedHedString

import ParsedHedTag from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { recursiveMap } from '../utils/array'
import { HedStringTokenizer, ColumnSpliceSpec, TagSpec } from './tokenizer'
import { generateIssue, IssueError } from '../common/issues/issues'
import { ReservedChecker } from './reservedChecker'

export default class HedStringSplitter {
  /**
   * The HED string being split.
   * @type {string}
   */
  hedString
  /**
   * The collection of HED schemas.
   * @type {Schemas}
   */
  hedSchemas

  issues

  /**
   * Constructor.
   *
   * @param {string} hedString The HED string to be split and parsed.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(hedString, hedSchemas) {
    this.hedString = hedString
    this.hedSchemas = hedSchemas
    this.special = ReservedChecker.getInstance()
    this.issues = []
  }

  /**
   * Split and parse a HED string into tags and groups.
   *
   * @returns {[ParsedHedSubstring[], Issue[]]} The parsed HED string data and any issues found.
   */
  splitHedString() {
    if (this.hedString === null || this.hedString === undefined || typeof this.hedString !== 'string') {
      return [null, [generateIssue('invalidTagString', {})]]
    }
    if (this.hedString.length === 0) {
      return [[], []]
    }
    const [tagSpecs, groupBounds, issues] = new HedStringTokenizer(this.hedString).tokenize()
    if (issues.length > 0) {
      return [null, issues]
    }
    const [parsedTags, parsingIssues] = this._createParsedTags(tagSpecs, groupBounds)
    return [parsedTags, parsingIssues]
  }

  /**
   * Create parsed HED tags and groups from specifications.
   *
   * @param {TagSpec[]} tagSpecs The tag specifications.
   * @param {GroupSpec} groupSpecs The group specifications.
   * @returns {[ParsedHedSubstring[], Issue[]]} The parsed HED tags and any issues.
   */
  _createParsedTags(tagSpecs, groupSpecs) {
    // Create tags from specifications
    this.issues = []
    const parsedTags = recursiveMap((tagSpec) => this._createParsedTag(tagSpec), tagSpecs)

    // Create groups from the parsed tags
    const parsedTagsWithGroups = this._createParsedGroups(parsedTags, groupSpecs.children)
    return [parsedTagsWithGroups, this.issues]
  }

  _createParsedTag(tagSpec) {
    if (tagSpec instanceof TagSpec) {
      try {
        return new ParsedHedTag(tagSpec, this.hedSchemas, this.hedString)
      } catch (issueError) {
        this.issues.push(this._handleIssueError(issueError))
        return null
      }
    } else if (tagSpec instanceof ColumnSpliceSpec) {
      return new ParsedHedColumnSplice(tagSpec.columnName, tagSpec.bounds)
    }
  }

  /**
   * Handle any issue encountered during tag parsing.
   *
   * @param {Error|IssueError} issueError The error encountered.
   */
  _handleIssueError(issueError) {
    if (issueError instanceof IssueError) {
      return issueError.issue
    } else if (issueError instanceof Error) {
      return generateIssue('internalError', { message: issueError.message })
    }
  }

  /**
   * Create parsed HED groups from parsed tags and group specifications.
   *
   * @param {ParsedHedTag[]} tags The parsed HED tags.
   * @param {GroupSpec[]} groupSpecs The group specifications.
   * @returns {ParsedHedGroup[]} The parsed HED groups.
   */
  _createParsedGroups(tags, groupSpecs) {
    const tagGroups = []
    let index = 0

    for (const tag of tags) {
      if (Array.isArray(tag)) {
        const groupSpec = groupSpecs[index]
        tagGroups.push(
          new ParsedHedGroup(this._createParsedGroups(tag, groupSpec.children), this.hedString, groupSpec.bounds),
        )
        index++
      } else if (tag !== null) {
        tagGroups.push(tag)
      }
    }

    return tagGroups
  }
}

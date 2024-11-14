import ParsedHedTag from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { recursiveMap } from '../utils/array'
import { mergeParsingIssues } from '../utils/hedData'
import { HedStringTokenizer, ColumnSpliceSpec, TagSpec } from './tokenizer'
import { generateIssue, IssueError } from '../common/issues/issues'
import { Schemas } from '../schema/containers'

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
  /**
   * Any issues found during tag conversion.
   * @type {Issue[]}
   */
  conversionIssues
  /**
   * Any syntax issues found.
   * @type {Issue[]}
   */
  syntaxIssues

  /**
   * Constructor.
   *
   * @param {string} hedString The HED string to be split and parsed.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(hedString, hedSchemas) {
    this.hedString = hedString
    this.hedSchemas = hedSchemas
    this.conversionIssues = []
    this.syntaxIssues = []
  }

  /**
   * Split and parse a HED string into tags and groups.
   *
   * @returns {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED string data and any issues found.
   */
  splitHedString() {
    if (this.hedString === null || this.hedString === undefined || typeof this.hedString !== 'string') {
      return [null, { syntax: [generateIssue('invalidTagString', {})] }]
    }
    if (this.hedString.length === 0) {
      return [[], {}]
    }
    const [tagSpecs, groupBounds, tokenizingIssues] = new HedStringTokenizer(this.hedString).tokenize()
    if (tokenizingIssues.syntax.length > 0) {
      return [null, tokenizingIssues]
    }

    const [parsedTags, parsingIssues] = this._createParsedTags(tagSpecs, groupBounds)
    mergeParsingIssues(tokenizingIssues, parsingIssues)

    return [parsedTags, tokenizingIssues]
  }

  /**
   * Create parsed HED tags and groups from specifications.
   *
   * @param {TagSpec[]} tagSpecs The tag specifications.
   * @param {GroupSpec} groupSpecs The group specifications.
   * @returns {[ParsedHedSubstring[], Object<string, Issue[]>]} The parsed HED tags and any issues.
   */
  _createParsedTags(tagSpecs, groupSpecs) {
    // Create tags from specifications
    const parsedTags = recursiveMap((tagSpec) => this._createParsedTag(tagSpec), tagSpecs)

    // Create groups from the parsed tags
    const parsedTagsWithGroups = this._createParsedGroups(parsedTags, groupSpecs.children)

    const issues = { syntax: this.syntaxIssues, conversion: this.conversionIssues }
    return [parsedTagsWithGroups, issues]
  }

  /**
   * Create a parsed tag object based on the tag specification.
   *
   * @param {TagSpec|ColumnSpliceSpec} tagSpec The tag or column splice specification.
   * @returns {ParsedHedTag|ParsedHedColumnSplice|null} The parsed HED tag or column splice.
   */
  _createParsedTag(tagSpec) {
    if (tagSpec instanceof TagSpec) {
      try {
        return new ParsedHedTag(tagSpec, this.hedSchemas, this.hedString)
      } catch (issueError) {
        this._handleIssueError(issueError)
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
      this.conversionIssues.push(issueError.issue)
    } else if (issueError instanceof Error) {
      this.conversionIssues.push(generateIssue('internalError', { message: issueError.message }))
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
          new ParsedHedGroup(
            this._createParsedGroups(tag, groupSpec.children),
            this.hedSchemas,
            this.hedString,
            groupSpec.bounds,
          ),
        )
        index++
      } else if (tag !== null) {
        tagGroups.push(tag)
      }
    }

    return tagGroups
  }
}

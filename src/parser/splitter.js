/**
 * This module holds the classes for basic splitting of HED strings.
 * @module parser/splitter
 */

import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import ParsedHedTag from './parsedHedTag'
import { HedStringTokenizer, TagSpec } from './tokenizer'
import { generateIssue, IssueError } from '../issues/issues'
import { recursiveMap } from '../utils/array'

export default class HedStringSplitter {
  /**
   * The HED string being split.
   * @type {string}
   * @private
   */
  hedString

  /**
   * The collection of HED schemas.
   * @type {Schemas}
   * @private
   */
  hedSchemas

  /**
   * Any issues found.
   * @type {Issue[]}
   * @private
   */
  issues

  /**
   * The parsed HED substrings.
   * @type {ParsedHedSubstring[]|null|undefined}
   * @private
   */
  parsedTags

  /**
   * Constructor.
   *
   * @param {string} hedString - The HED string to be split and parsed.
   * @param {Schemas} hedSchemas - The collection of HED schemas.
   */
  constructor(hedString, hedSchemas) {
    this.hedString = hedString
    this.hedSchemas = hedSchemas
    this.issues = []
    this.parsedTags = undefined
  }

  /**
   * Split and parse a HED string into tags and groups.
   *
   * This method is idempotent. If called repeatedly, it will simply return the already-parsed substrings and issues.
   *
   * @returns {Array} A tuple [ParsedHedSubstring[]|null, Issue[]] representing the parsed HED string data and any issues found.
   */
  splitHedString() {
    if (this.parsedTags === undefined) {
      this._splitHedString() // This should set the field to something defined.
    }
    if (this.parsedTags === undefined) {
      IssueError.generateAndThrowInternalError('parsedTags should have been set by now')
    }
    return [this.parsedTags, this.issues]
  }

  /**
   * Split and parse a HED string into tags and groups.
   *
   * @private
   */
  _splitHedString() {
    if (typeof this.hedString !== 'string') {
      this.parsedTags = null
      this.issues.push(generateIssue('invalidTagString', {}))
      return
    }
    if (this.hedString === '') {
      this.parsedTags = []
      return
    }
    const [tagSpecs, groupBounds, issues] = new HedStringTokenizer(this.hedString).tokenize()
    if (groupBounds === null) {
      this.parsedTags = null
      this.issues.push(...issues)
      return
    }
    this.parsedTags = this._createParsedTags(tagSpecs, groupBounds)
  }

  /**
   * Create parsed HED tags and groups from specifications.
   *
   * @param {Array} tagSpecs - The tag specifications.
   * @param {GroupSpec} groupSpecs - The group specifications.
   * @returns {ParsedHedSubstring[]} The parsed HED tags and groups.
   * @private
   */
  _createParsedTags(tagSpecs, groupSpecs) {
    // Create tags from specifications
    const parsedTags = recursiveMap(tagSpecs, (tagSpec) => this._createParsedTag(tagSpec))

    // Create groups from the parsed tags
    return this._createParsedGroups(parsedTags, groupSpecs.children)
  }

  /**
   * Create a parsed HED tag or column splice from a specification.
   *
   * @param {TagSpec|ColumnSpliceSpec} tagSpec - The tag or column splice specification.
   * @returns {ParsedHedTag|ParsedHedColumnSplice|null} The parsed tag or column splice spec, or null if the tag parsing generated an error.
   * @private
   */
  _createParsedTag(tagSpec) {
    if (tagSpec instanceof TagSpec) {
      try {
        return new ParsedHedTag(tagSpec, this.hedSchemas)
      } catch (issueError) {
        this.issues.push(this._handleIssueError(issueError))
        return null
      }
    } else {
      return new ParsedHedColumnSplice(tagSpec.columnName, tagSpec.bounds)
    }
  }

  /**
   * Handle any issue encountered during tag parsing.
   *
   * @param {*} issueError - The error encountered.
   * @returns {Issue} The issue corresponding to the error.
   * @private
   */
  _handleIssueError(issueError) {
    if (issueError instanceof IssueError) {
      return issueError.issue
    } else if (issueError instanceof Error) {
      return generateIssue('internalError', { message: issueError.message })
    } else {
      return generateIssue('internalError', { message: 'Unknown error type' })
    }
  }

  /**
   * Create parsed HED groups from parsed tags and group specifications.
   *
   * @param {Array} tags - The parsed HED tags.
   * @param {GroupSpec[]} groupSpecs - The group specifications.
   * @returns {ParsedHedSubstring[]} The parsed HED groups.
   * @private
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

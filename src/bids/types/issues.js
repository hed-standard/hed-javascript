import groupBy from 'lodash/groupBy'

import { generateIssue, IssueError } from '../../issues/issues'

export class BidsHedIssue {
  /**
   * The file associated with this issue.
   * @type {Object}
   */
  file
  /**
   * The HED Issue object corresponding to this object.
   * @type {Issue}
   */
  hedIssue

  /**
   * Constructor.
   *
   * @param {Issue} hedIssue The HED issue object to be wrapped.
   * @param {Object} file The file this error occurred in.
   */
  constructor(hedIssue, file) {
    this.hedIssue = hedIssue
    this.file = file
  }

  /**
   * The BIDS issue code.
   * @returns {string}
   */
  get code() {
    if (this.hedIssue.level === 'warning') {
      return 'HED_WARNING'
    } else {
      return 'HED_ERROR'
    }
  }

  /**
   * The HED spec code for this issue.
   *
   * @returns {string}
   */
  get subCode() {
    return this.hedIssue.hedCode
  }

  /**
   * The evidence for this issue.
   * @returns {string}
   */
  get issueMessage() {
    return this.hedIssue.message
  }

  /**
   * The line at which the issue was found.
   * @returns {number}
   */
  get line() {
    return this.hedIssue.parameters.tsvLine
  }

  /**
   * The severity of this issue.
   * @returns {string}
   */
  get severity() {
    return this.hedIssue.level
  }

  /**
   * Split a list of issues into errors and warnings.
   *
   * @param {BidsHedIssue[]} issues A list of issues.
   * @returns {Object<string, BidsHedIssue[]>} The list of issues divided into errors and warnings.
   */
  static splitErrors(issues) {
    return groupBy(issues, (issue) => issue.severity)
  }

  /**
   * Convert one or more HED issues into BIDS-compatible issues.
   *
   * @param {Error|Issue[]} hedIssues One or more HED-format issues.
   * @param {Object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @param {Object?} extraParameters Any extra parameters to inject into the {@link Issue} objects.
   * @returns {BidsHedIssue[]} The passed issue(s) in BIDS-compatible format.
   */
  static fromHedIssues(hedIssues, file, extraParameters) {
    if (hedIssues.length === 0) {
      return []
    } else if (hedIssues instanceof IssueError) {
      return [BidsHedIssue.fromHedIssue(hedIssues.issue, file, extraParameters)]
    } else if (hedIssues instanceof Error) {
      return [new BidsHedIssue(generateIssue('internalError', { message: hedIssues.message }), file ?? null)]
    } else {
      return hedIssues.map((hedIssue) => BidsHedIssue.fromHedIssue(hedIssue, file, extraParameters))
    }
  }

  /**
   * Convert a single HED issue into a BIDS-compatible issue.
   *
   * @param {Issue} hedIssue One HED-format issue.
   * @param {Object} file A BIDS-format file object used to generate a {@link BidsHedIssue} object.
   * @param {Object?} extraParameters Any extra parameters to inject into the {@link Issue} object.
   * @returns {BidsHedIssue} The passed issue in BIDS-compatible format.
   */
  static fromHedIssue(hedIssue, file, extraParameters) {
    if (extraParameters) {
      Object.assign(hedIssue.parameters, extraParameters)
      hedIssue.generateMessage()
    }
    return new BidsHedIssue(hedIssue, file)
  }
}

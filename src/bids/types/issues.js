import groupBy from 'lodash/groupBy'

import { generateIssue, IssueError } from '../../issues/issues.js'

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
   * The BIDS issue code.
   * @type {string}
   */
  code

  /**
   * The HED spec code for this issue.
   * @type {string}
   */
  subCode

  /**
   * The severity of this issue.
   * @type {string}
   */
  severity

  /**
   * The issue message for this issue.
   * @type {string}
   */
  issueMessage

  /**
   * The line at which the issue was found.
   * @type {number}
   */
  line

  /**
   * The location of the file at which the issue was found.
   * @type {string}
   */
  location

  /**
   * Constructor.
   *
   * @param {Issue} hedIssue The HED issue object to be wrapped.
   * @param {Object} file The file this error occurred in.
   */
  constructor(hedIssue, file) {
    this.hedIssue = hedIssue
    this.file = file

    // BIDS fields
    if (hedIssue.level === 'warning') {
      this.code = 'HED_WARNING'
    } else {
      this.code = 'HED_ERROR'
    }
    this.subCode = hedIssue.hedCode
    this.severity = hedIssue.level
    this.issueMessage = hedIssue.message
    this.line = hedIssue.parameters?.tsvLine
    this.location = file?.path
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

  /**
   * Transform a list of mixed issues into BIDS-compatible issues.
   *
   * @param {(BidsHedIssue|IssueError|Error)[]} issues A list of mixed-format issues.
   * @param {Object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @returns {BidsHedIssue[]} The passed issues in BIDS-compatible format.
   */
  static transformToBids(issues, file = null) {
    return issues.map((issue) => {
      if (issue instanceof BidsHedIssue) {
        return issue
      } else if (issue instanceof IssueError) {
        const issueFile = issue.issue.file || file
        return BidsHedIssue.fromHedIssue(issue.issue, issueFile, issue.issue.parameters)
      } else if (issue instanceof Error) {
        return new BidsHedIssue(generateIssue('internalError', { message: issue.message }), file)
      } else {
        return new BidsHedIssue(generateIssue('internalError', { message: 'Unknown issue type' }), file)
      }
    })
  }
}

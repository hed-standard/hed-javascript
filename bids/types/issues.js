import { IssueError } from '../../common/issues/issues'

const bidsHedErrorCodes = new Set([104, 106, 107])

export class BidsIssue {
  /**
   * The BIDS issue code.
   * @type {number}
   */
  code
  /**
   * The file associated with this issue.
   * @type {Object}
   */
  file
  /**
   * The evidence for this issue.
   * @type {string}
   */
  evidence

  constructor(issueCode, file, evidence) {
    this.code = issueCode
    this.file = file
    this.evidence = evidence
  }

  /**
   * Whether this issue is an error.
   * @returns {boolean}
   */
  isError() {
    return bidsHedErrorCodes.has(this.code)
  }

  static generateInternalErrorPromise(error) {
    return Promise.resolve([new BidsIssue(106, null, error.message)])
  }
}

export class BidsHedIssue extends BidsIssue {
  /**
   * The HED Issue object corresponding to this object.
   * @type {Issue}
   */
  hedIssue

  constructor(hedIssue, file) {
    super(hedIssue.level === 'warning' ? 105 : 104, file, hedIssue.message)

    this.hedIssue = hedIssue
  }

  /**
   * Convert one or more HED issues into BIDS-compatible issues.
   *
   * @param {IssueError|Issue[]} hedIssues One or more HED-format issues.
   * @param {Object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @param {Object?} extraParameters Any extra parameters to inject into the {@link Issue} objects.
   * @returns {BidsHedIssue[]} The passed issue(s) in BIDS-compatible format.
   */
  static fromHedIssues(hedIssues, file, extraParameters) {
    if (hedIssues instanceof IssueError) {
      return [BidsHedIssue.fromHedIssue(hedIssues.issue, file, extraParameters)]
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

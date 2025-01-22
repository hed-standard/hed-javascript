import { generateIssue, IssueError } from '../../common/issues/issues'

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
   *
   * @returns {boolean}
   */
  isError() {
    return bidsHedErrorCodes.has(this.code)
  }

  /**
   * Determine if any of the passed issues are errors.
   *
   * @param {BidsIssue[]} issues A list of issues.
   * @returns {boolean} Whether any of the passed issues are errors (rather than warnings).
   */
  static anyAreErrors(issues) {
    return issues.some((issue) => issue.isError())
  }

  static async generateInternalErrorPromise(error, errorFile) {
    return [new BidsHedIssue(generateIssue('internalError', { message: error.message }), errorFile)]
  }
}

export class BidsHedIssue extends BidsIssue {
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
    super(BidsHedIssue._determineBidsIssueCode(hedIssue), file, hedIssue.message)

    this.hedIssue = hedIssue
  }

  /**
   * Determine the BIDS issue code for this issue.
   *
   * @param {Issue} hedIssue The HED issue object to be wrapped.
   * @returns {number} The BIDS issue code for this issue.
   * @private
   */
  static _determineBidsIssueCode(hedIssue) {
    if (hedIssue.internalCode === 'internalError' || hedIssue.internalCode === 'internalConsistencyError') {
      return 106
    }
    if (hedIssue.level === 'warning') {
      return 105
    }
    return 104
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
    if (hedIssues instanceof IssueError) {
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

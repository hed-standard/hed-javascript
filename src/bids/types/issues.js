import { generateIssue, IssueError } from '../../issues/issues'

export class BidsHedIssue {
  /**
   * The BIDS issue code.
   * @type {string}
   */
  bidsCode
  /**
   * The file associated with this issue.
   * @type {Object}
   */
  file
  /**
   * The evidence for this issue.
   * @type {string}
   */
  message
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
    this.bidsCode = BidsHedIssue._determineBidsIssueCode(hedIssue)
    this.message = hedIssue.message
    this.file = file
  }

  /**
   * The HED spec code for this issue.
   *
   * @returns {string}
   */
  get hedCode() {
    return this.hedIssue.hedCode
  }

  /**
   * Whether this issue is an error.
   *
   * @returns {boolean}
   */
  get isError() {
    return this.hedIssue.level === 'error'
  }

  /**
   * Determine if any of the passed issues are errors.
   *
   * @param {BidsHedIssue[]} issues A list of issues.
   * @returns {boolean} Whether any of the passed issues are errors (rather than warnings).
   */
  static anyAreErrors(issues) {
    return issues.some((issue) => issue.isError)
  }

  static splitErrors(issues) {
    const errors = issues.filter((item) => item.isError)
    const warnings = issues.filter((item) => !item.isError)
    return [errors, warnings]
  }

  /**
   * Determine the BIDS issue code for this issue.
   *
   * @param {Issue} hedIssue The HED issue object to be wrapped.
   * @returns {string} The BIDS issue code for this issue.
   * @private
   */
  static _determineBidsIssueCode(hedIssue) {
    if (hedIssue.internalCode === 'internalError') {
      return 'HED_INTERNAL_ERROR'
    }
    if (hedIssue.level === 'warning') {
      return 'HED_WARNING'
    }
    return 'HED_ERROR'
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

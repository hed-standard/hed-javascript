import mapValues from 'lodash/mapValues'

import issueData from './data'

export class IssueError extends Error {
  /**
   * The associated HED issue.
   * @type {Issue}
   */
  issue

  constructor(issue, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IssueError)
    }

    this.name = 'IssueError'
    this.issue = issue
    this.message = issue.message

    Object.setPrototypeOf(this, IssueError.prototype)
  }

  /**
   * Generate a new {@link Issue} object and immediately throw it as an {@link IssueError}.
   *
   * @param {string} internalCode The internal error code.
   * @param {Object<string, (string|number[])>?} parameters The error string parameters.
   * @throws {IssueError} Corresponding to the generated {@link Issue}.
   */
  static generateAndThrow(internalCode, parameters = {}) {
    throw new IssueError(generateIssue(internalCode, parameters))
  }
}

/**
 * A HED validation error or warning.
 */
export class Issue {
  /**
   * The internal error code.
   * @type {string}
   */
  internalCode

  /**
   * The HED 3 error code.
   * @type {string}
   */
  hedCode
  /**
   * The issue level (error or warning).
   * @type {string}
   */
  level
  /**
   * The detailed error message.
   * @type {string}
   */
  message
  /**
   * The parameters to the error message template. Object with string and map parameters.
   * @type {Object}
   */
  parameters

  /**
   * Constructor.
   * @param {string} internalCode The internal error code.
   * @param {string} hedCode The HED 3 error code.
   * @param {string} level The issue level (error or warning).
   * @param {Object} parameters The error string parameters.
   */
  constructor(internalCode, hedCode, level, parameters) {
    this.internalCode = internalCode
    this.hedCode = hedCode
    this.level = level
    this.parameters = parameters
    this.generateMessage()
  }

  /**
   * Whether this issue is an error.
   *
   * @returns {boolean}
   */
  isError() {
    return this.level === 'error'
  }

  /**
   * Override of {@link Object.prototype.toString}.
   *
   * @returns {string} This issue's message.
   */
  toString() {
    return this.message
  }

  /**
   * (Re-)generate the issue message.
   */
  generateMessage() {
    // Convert all parameters except the substring bounds (an integer array) to their string forms.
    this.parameters = mapValues(this.parameters, (value, key) => (key === 'bounds' ? value : String(value)))

    const bounds = this.parameters.bounds ?? []
    const messageTemplate = issueData[this.internalCode].message
    let message = messageTemplate(...bounds, this.parameters)

    // Special parameters
    if (this.parameters.sidecarKey) {
      message += ` Sidecar key: "${this.parameters.sidecarKey}".`
    }
    if (this.parameters.tsvLine) {
      message += ` TSV line: ${this.parameters.tsvLine}.`
    }
    if (this.parameters.hedString) {
      message += ` HED string: "${this.parameters.hedString}".`
    }

    // Append link to error code in HED spec.
    const hedCodeAnchor = this.hedCode.toLowerCase().replace(/_/g, '-')
    const hedSpecLink = `For more information on this HED ${this.level}, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#${hedCodeAnchor}`

    this.message = `${this.level.toUpperCase()}: [${this.hedCode}] ${message} (${hedSpecLink}.)`
  }

  /**
   * Return a tuple with a boolean denoting overall validity and all issues.
   *
   * @param {Issue[]} issues A list of issues.
   * @returns {Array} Returns [boolean, Issue[]] indicate if validation succeeded (i.e. any errors were found)and all issues (both errors and warnings).
   */
  static issueListWithValidStatus(issues) {
    return [!issues.some((issue) => issue.isError()), issues]
  }
}

/**
 * Generate a new issue object.
 *
 * @param {string} internalCode The internal error code.
 * @param {Object} parameters The error string parameters.
 * @returns {Issue} An object representing the issue.
 */
export const generateIssue = function (internalCode, parameters) {
  const issueCodeData = issueData[internalCode] ?? issueData.genericError
  const { hedCode, level } = issueCodeData
  if (issueCodeData === issueData.genericError) {
    parameters.internalCode = internalCode
    parameters.parameters = 'Issue parameters: ' + JSON.stringify(parameters)
  }

  return new Issue(internalCode, hedCode, level, parameters)
}

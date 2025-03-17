import mapValues from 'lodash/mapValues'

import issueData from './data'

export class IssueError extends Error {
  /**
   * The associated HED issue.
   * @type {Issue}
   */
  issue

  /**
   * Constructor.
   *
   * @param {Issue} issue The associated HED issue.
   * @param {...*} params Extra parameters (to be forwarded to the {@link Error} constructor).
   */
  constructor(issue, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(issue.message, ...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IssueError)
    }

    this.name = 'IssueError'
    this.issue = issue

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

  /**
   * Generate a new {@link Issue} object for an internal error and immediately throw it as an {@link IssueError}.
   *
   * @param {string} message A message describing the internal error.
   * @throws {IssueError} Corresponding to the generated internal error {@link Issue}.
   */
  static generateAndThrowInternalError(message = 'Unknown internal error') {
    IssueError.generateAndThrow('internalError', { message })
  }
}

/**
 * A HED validation error or warning.
 */
export class Issue {
  static SPECIAL_PARAMETERS = new Map([
    ['sidecarKey', 'Sidecar key'],
    ['tsvLine', 'TSV line'],
    ['hedString', 'HED string'],
  ])

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
   *
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
    this._stringifyParameters()
    const baseMessage = this._parseMessageTemplate()
    const specialParameterMessages = this._parseSpecialParameters()
    const hedSpecLink = this._generateHedSpecificationLink()

    this.message = `${this.level.toUpperCase()}: [${this.hedCode}] ${baseMessage} ${specialParameterMessages} (${hedSpecLink}.)`
  }

  /**
   * Convert all parameters except the substring bounds (an integer array) to their string forms.
   * @private
   */
  _stringifyParameters() {
    this.parameters = mapValues(this.parameters, (value, key) => (key === 'bounds' ? value : String(value)))
  }

  /**
   * Find and parse the appropriate message template.
   *
   * @returns {string} The parsed base message.
   * @private
   */
  _parseMessageTemplate() {
    const bounds = this.parameters.bounds ?? []
    const messageTemplate = issueData[this.internalCode].message
    return messageTemplate(...bounds, this.parameters)
  }

  /**
   * Parse "special" parameters.
   *
   * @returns {string} The parsed special parameters.
   * @private
   */
  _parseSpecialParameters() {
    const specialParameterMessages = []
    for (const [parameterName, parameterHeader] of Issue.SPECIAL_PARAMETERS) {
      if (this.parameters[parameterName]) {
        specialParameterMessages.push(`${parameterHeader}: "${this.parameters[parameterName]}".`)
      }
    }
    return specialParameterMessages.join(' ')
  }

  /**
   * Generate a link to the appropriate section in the HED specification.
   *
   * @returns {string} A link to the HED specification
   * @private
   */
  _generateHedSpecificationLink() {
    const hedCodeAnchor = this.hedCode.toLowerCase().replace(/_/g, '-')
    return `For more information on this HED ${this.level}, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#${hedCodeAnchor}`
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
    internalCode = 'genericError'
    parameters.parameters = 'Issue parameters: ' + JSON.stringify(parameters)
  }

  return new Issue(internalCode, hedCode, level, parameters)
}

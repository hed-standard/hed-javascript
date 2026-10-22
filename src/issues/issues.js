/**
 * This module holds the issue classes.
 * @module issues/issues
 */

import issueData from './data'
import { isNumberPair } from '../utils/types'

export class IssueError extends Error {
  /**
   * The associated HED issue.
   * @type {Issue}
   */
  issue

  /**
   * Constructor.
   *
   * @param {Issue} issue - The associated HED issue.
   */
  constructor(issue) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(issue.message)

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
   * @param {string} internalCode - The internal error code.
   * @param {Object<string, *>} parameters - The error string parameters.
   * @throws {IssueError} Corresponding to the generated {@link Issue}.
   */
  static generateAndThrow(internalCode, parameters = {}) {
    throw new IssueError(generateIssue(internalCode, parameters))
  }

  /**
   * Generate a new {@link Issue} object for an internal error and immediately throw it as an {@link IssueError}.
   *
   * @param {string} message - A message describing the internal error. The message should not end with any punctuation.
   * @throws {IssueError} Corresponding to the generated internal error {@link Issue}.
   */
  static generateAndThrowInternalError(message = 'Unknown internal error') {
    IssueError.generateAndThrow('internalError', { message: message })
  }

  /**
   * Generate and re-throw an error according to `generateFn`.
   *
   * This method will pass `error` to `generateFn`, unless it is not an {@link Error} object (in which case,
   * it will generate an internal error via {@link IssueError.generateAndThrowInternalError}). generateFn` is
   * expected to return an internal issue code and parameter object, which will be passed to
   * {@link IssueError.generateAndThrow}. Failure to provide an internal issue code will also result in an internal error.
   *
   * @param {*} error - This is expected to be an object of {@link Error} or a subclass.
   * @param {function(Error): Array} generateFn - A function which is passed the screened error object and returns an internal error code and parameter object.
   * @param {string} illegalErrorTypeMessage - A message to be used for an illegal error type.
   * @throws {IssueError} The generated issue.
   */
  static generateAndRethrow(error, generateFn, illegalErrorTypeMessage = 'Unknown internal error') {
    if (error instanceof Error) {
      const [internalCode, parameters] = generateFn(error)
      if (!internalCode) {
        IssueError.generateAndThrowInternalError('Failed to provide valid internal code to re-throw static method')
      }
      IssueError.generateAndThrow(internalCode, parameters)
    } else {
      IssueError.generateAndThrowInternalError(illegalErrorTypeMessage)
    }
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
    ['filePath', 'File path'],
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
   * The bounds of this issue.
   * @type {number[]|undefined}
   */
  _bounds

  /**
   * The parameters to the error message template.
   * @type {Object<string, string>}
   */
  _parameters

  /**
   * Constructor.
   *
   * @param {string} internalCode - The internal error code.
   * @param {string} hedCode - The HED 3 error code.
   * @param {string} level - The issue level (error or warning).
   * @param {Object<string, *>} parameters - The error string parameters.
   */
  constructor(internalCode, hedCode, level, parameters) {
    this.internalCode = internalCode
    this.hedCode = hedCode
    this.level = level
    this.parameters = parameters
  }

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns {string} This issue's message.
   */
  toString() {
    return this.message
  }

  /**
   * Generate the detailed error message.
   *
   * @returns {string} This issue's message.
   */
  get message() {
    const baseMessage = this._parseMessageTemplate()
    const specialParameterMessages = this._parseSpecialParameters()
    const hedSpecLink = this._generateHedSpecificationLink()

    return `${this.level.toUpperCase()}: [${this.hedCode}] ${baseMessage} ${specialParameterMessages} (${hedSpecLink}.)`
  }

  /**
   * Get the issue parameters.
   *
   * @returns {Object<string, string>} The issue parameters.
   */
  get parameters() {
    return this._parameters
  }

  /**
   * Get the issue's bounds.
   *
   * @returns {number[]|undefined} The issue bounds within the parent string.
   */
  get bounds() {
    return this._bounds
  }

  /**
   * Validate and set the issue's bounds.
   *
   * @param {*} value - The issue bounds within the parent string.
   * @private
   */
  set bounds(value) {
    if (this._bounds) {
      return
    }
    if (isNumberPair(value)) {
      this._bounds = value
    } else {
      IssueError.generateAndThrowInternalError('Bounds must be a numeric pair')
    }
  }

  /**
   * Set new parameters by converting all parameters except the substring bounds (an integer array) to their string forms.
   *
   * @param {Object<string, *>} parameters - The new issue parameters.
   */
  set parameters(parameters) {
    this._bounds = undefined
    this._parameters = {}
    this.addParameters(parameters ?? {})
  }

  /**
   * Determine whether this issue has a given parameter.
   *
   * @param {string} name - The parameter name to check.
   * @returns {boolean} Whether this issue already has a parameter by that name.
   */
  hasParameter(name) {
    if (name === 'bounds') {
      return this._bounds !== undefined
    }
    return Object.hasOwn(this._parameters, name)
  }

  /**
   * Add a new parameter value.
   *
   * @param {string} name - The parameter name.
   * @param {*} value - The new parameter value.
   */
  addParameter(name, value) {
    if (this.hasParameter(name)) {
      return
    }
    if (name === 'bounds') {
      this.bounds = value
      return
    }
    this._parameters[name] = String(value)
  }

  /**
   * Add multiple parameters for this Issue.
   *
   * @param {Object<string, *>} parameters - The new values of the parameters.
   */
  addParameters(parameters) {
    for (const [key, value] of Object.entries(parameters)) {
      this.addParameter(key, value)
    }
  }

  /**
   * (Re-)generate the issue message.
   *
   * @deprecated The message is a getter computed from the current parameters, so there is nothing to regenerate.
   */
  generateMessage() {}

  /**
   * Find and parse the appropriate message template.
   *
   * @returns {string} The parsed base message.
   * @private
   */
  _parseMessageTemplate() {
    const issueCodeData = issueData[this.internalCode]
    const bounds = this._bounds ?? []
    if (issueCodeData === undefined) {
      const messageTemplate = issueData.genericError.message
      const tempParameters = {
        internalCode: this.internalCode,
        parameters: JSON.stringify(this.parameters),
      }
      return messageTemplate(tempParameters)
    }
    const messageTemplate = issueCodeData.message
    return messageTemplate(this.parameters, ...bounds)
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
    return `For more information on this HED ${this.level}, see https://www.hedtags.org/hed-specification/Appendix_B.html#${hedCodeAnchor}`
  }
}

/**
 * Generate a new issue object.
 *
 * @param {string} internalCode - The internal error code.
 * @param {Object<string, *>} parameters - The error string parameters.
 * @returns {Issue} An object representing the issue.
 */
export function generateIssue(internalCode, parameters = {}) {
  const issueCodeData = issueData[internalCode] ?? issueData.genericError
  const { hedCode, level } = issueCodeData
  if (issueCodeData === issueData.genericError) {
    parameters.internalCode = internalCode
    internalCode = 'genericError'
    parameters.parameters = 'Issue parameters: ' + JSON.stringify(parameters)
  }

  return new Issue(internalCode, hedCode, level, parameters)
}

/**
 * Update the parameters of a list of issues.
 *
 * @param {Array<Issue|IssueError>} issues - The list of issues (different types can be intermixed).
 * @param {Object<string, *>} parameters - The parameters to add.
 */
export function addIssueParameters(issues, parameters) {
  for (const thisIssue of issues) {
    if (thisIssue instanceof IssueError) {
      thisIssue.issue.addParameters(parameters)
    } else if (thisIssue instanceof Issue) {
      thisIssue.addParameters(parameters)
    }
  }
}

/**
 * Update the parameters of a list of issues.
 *
 * @deprecated Use {@link addIssueParameters}.
 */
export const updateIssueParameters = addIssueParameters

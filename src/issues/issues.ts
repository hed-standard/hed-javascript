/** This module holds the issue classes.
 * @module issues/issues
 */

import issueData, { IssueLevel } from './data'

export class IssueError extends Error {
  /**
   * The associated HED issue.
   */
  issue: Issue

  /**
   * Constructor.
   *
   * @param issue The associated HED issue.
   * @param params Extra parameters (to be forwarded to the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error | Error} constructor).
   */
  constructor(issue: Issue, ...params: any[]) {
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
   * @param internalCode The internal error code.
   * @param parameters The error string parameters.
   * @throws {IssueError} Corresponding to the generated {@link Issue}.
   */
  static generateAndThrow(internalCode: string, parameters: Record<string, string | [number, number]> = {}) {
    throw new IssueError(generateIssue(internalCode, parameters))
  }

  /**
   * Generate a new {@link Issue} object for an internal error and immediately throw it as an {@link IssueError}.
   *
   * @param message A message describing the internal error.
   * @throws {IssueError} Corresponding to the generated internal error {@link Issue}.
   */
  static generateAndThrowInternalError(message: string = 'Unknown internal error') {
    IssueError.generateAndThrow('internalError', { message: message })
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
   */
  internalCode: string

  /**
   * The HED 3 error code.
   */
  hedCode: string

  /**
   * The issue level (error or warning).
   */
  level: IssueLevel

  /**
   * The detailed error message.
   */
  message: string

  /**
   * The bounds of this issue.
   */
  _bounds: [number, number]

  /**
   * The parameters to the error message template.
   */
  _parameters: Record<string, string>

  /**
   * Constructor.
   *
   * @param internalCode The internal error code.
   * @param hedCode The HED 3 error code.
   * @param level The issue level (error or warning).
   * @param parameters The error string parameters.
   */
  constructor(internalCode: string, hedCode: string, level: IssueLevel, parameters: Record<string, any>) {
    this.internalCode = internalCode
    this.hedCode = hedCode
    this.level = level
    this.parameters = parameters
    this.generateMessage()
  }

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns This issue's message.
   */
  public toString(): string {
    return this.message
  }

  /**
   * (Re-)generate the issue message.
   */
  public generateMessage(): void {
    this.parameters = this._parameters
    const baseMessage = this._parseMessageTemplate()
    const specialParameterMessages = this._parseSpecialParameters()
    const hedSpecLink = this._generateHedSpecificationLink()

    this.message = `${this.level.toUpperCase()}: [${this.hedCode}] ${baseMessage} ${specialParameterMessages} (${hedSpecLink}.)`
  }

  /**
   * Get the issue parameters.
   *
   * @returns The issue parameters.
   */
  get parameters(): Record<string, string> {
    return this._parameters
  }

  /**
   * Get the issue's bounds.
   *
   * @returns The issue bounds within the parent string.
   */
  get bounds(): [number, number] {
    return this._bounds
  }

  /**
   * Set new parameters by converting all parameters except the substring bounds (an integer array) to their string forms.
   *
   * @param parameters The new issue parameters.
   */
  set parameters(parameters: Record<string, any>) {
    this._parameters = {}
    for (const [key, value] of Object.entries(parameters)) {
      if (key === 'bounds') {
        if (!Array.isArray(value) || value.length !== 2 || !value.every((bound) => typeof bound === 'number')) {
          IssueError.generateAndThrowInternalError('Passed bounds are not a numeric pair')
        }
        this._bounds = value
        continue
      }
      this._parameters[key] = String(value)
    }
  }

  /**
   * Find and parse the appropriate message template.
   *
   * @returns The parsed base message.
   */
  private _parseMessageTemplate(): string {
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
   * @returns The parsed special parameters.
   */
  private _parseSpecialParameters(): string {
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
   * @returns A link to the HED specification
   */
  private _generateHedSpecificationLink(): string {
    const hedCodeAnchor = this.hedCode.toLowerCase().replace(/_/g, '-')
    return `For more information on this HED ${this.level}, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#${hedCodeAnchor}`
  }
}

/**
 * Generate a new issue object.
 *
 * @param internalCode The internal error code.
 * @param parameters The error string parameters.
 * @returns An object representing the issue.
 */
export function generateIssue(internalCode: string, parameters: Record<string, any> = {}): Issue {
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
 * @param issues The list of issues (different types can be intermixed).
 * @param parameters The parameters to add.
 */
export function updateIssueParameters(issues: IssueError[] | Issue[], parameters: Record<string, any>) {
  for (const thisIssue of issues) {
    if (thisIssue instanceof IssueError) {
      _updateIssueParameters(thisIssue.issue, parameters)
    } else if (thisIssue instanceof Issue) {
      _updateIssueParameters(thisIssue, parameters)
    }
  }
}

/**
 * Update the parameters for an Issue.
 *
 * Note: the issue is modified in place.
 *
 * @param issue The issue to be updated.
 * @param parameters The parameters to add.
 */
function _updateIssueParameters(issue: Issue, parameters: Record<string, any>) {
  if (!issue._parameters) {
    issue._parameters = {}
  }

  let changed = false
  for (const [key, value] of Object.entries(parameters)) {
    if (!Object.hasOwn(issue._parameters, key)) {
      issue.parameters[key] = String(value)
      changed = true
    }
  }

  if (changed) {
    issue.generateMessage()
  }
}

import issueData from './data'

/**
 * A HED validation error or warning.
 */
export class Issue {
  /**
   * Constructor.
   * @param {string} internalCode The internal error code.
   * @param {string} hedCode The HED 3 error code.
   * @param {string} level The issue level (error or warning).
   * @param {string} message The detailed error message.
   */
  constructor(internalCode, hedCode, level, message) {
    /**
     * The internal error code.
     * @type {string}
     */
    this.internalCode = internalCode
    /**
     * Also the internal error code.
     *
     * TODO: This is kept for backward compatibility until the next major version bump.
     * @deprecated
     * @type {string}
     */
    this.code = internalCode
    /**
     * The HED 3 error code.
     * @type {string}
     */
    this.hedCode = hedCode
    /**
     * The issue level (error or warning).
     * @type {string}
     */
    this.level = level
    /**
     * The detailed error message.
     * @type {string}
     */
    this.message = `${level.toUpperCase()}: [${hedCode}] ${message}`
  }
}

/**
 * Generate a new issue object.
 *
 * @param {string} internalCode The internal error code.
 * @param {Object<string, (string|number[])>} parameters The error string parameters.
 * @return {Issue} An object representing the issue.
 */
export const generateIssue = function (internalCode, parameters) {
  const issueCodeData = issueData[internalCode] || issueData.genericError
  const { hedCode, level, message } = issueCodeData
  const bounds = parameters.bounds ?? []
  if (issueCodeData === issueData.genericError) {
    parameters.internalCode = internalCode
    parameters.parameters = 'Issue parameters: ' + JSON.stringify(parameters)
  }
  const parsedMessage = message(...bounds, parameters)

  return new Issue(internalCode, hedCode, level, parsedMessage)
}

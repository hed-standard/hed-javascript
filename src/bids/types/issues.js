/**
 * Provides a wrapper for HED validation issues that is compatible with the BIDS validator.
 * @module bids/types/issues
 */

import cloneDeep from 'lodash/cloneDeep'

import { generateIssue, Issue, IssueError } from '../../issues/issues'

/**
 * A wrapper for a HED validation issue that is compatible with the BIDS validator.
 *
 * This class encapsulates a HED {@link Issue} object and provides additional properties and methods for BIDS-specific
 * error reporting.
 */
export class BidsHedIssue {
  /**
   * The file associated with this issue.
   * @type {object|null}
   */
  file

  /**
   * The underlying HED issue object.
   * @type {Issue}
   */
  hedIssue

  /**
   * The BIDS-compliant issue code.
   * @type {string}
   */
  code

  /**
   * The HED-specific issue code.
   * @type {string}
   */
  subCode

  /**
   * The severity of the issue (e.g., 'error' or 'warning').
   * @type {string}
   */
  severity

  /**
   * The human-readable issue message.
   * @type {string}
   */
  issueMessage

  /**
   * The line number where the issue occurred.
   * @type {string}
   */
  line

  /**
   * The path to the file where the issue occurred.
   * @type {string|undefined}
   */
  location

  /**
   * Constructs a BidsHedIssue object.
   *
   * Direct use of this constructor is not recommended. Use {@link BidsHedIssue.fromHedIssues}.
   *
   * @param {Issue} hedIssue - The HED issue object to be wrapped.
   * @param {object|null} file - The file object associated with this issue.
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
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns {string} The issue message.
   */
  toString() {
    return this.issueMessage
  }

  /**
   * Transform a list of issues into a Map, keyed by severity level.
   *
   * @param {BidsHedIssue[]} issues - A list of BIDS HED issues.
   * @returns {Map<string, BidsHedIssue[]>} A map where keys are severity levels and values are arrays of issues.
   */
  static splitErrors(issues) {
    const issueMap = new Map()
    for (const issue of issues) {
      if (!issueMap.has(issue.severity)) {
        issueMap.set(issue.severity, [])
      }
      issueMap.get(issue.severity)?.push(issue)
    }
    return issueMap
  }

  /**
   * Categorize a list of issues by their subCode values.
   *
   * @param {BidsHedIssue[]} issues - A list of BIDS HED issues.
   * @returns {Map<string, BidsHedIssue[]>} A map where keys are HED issue codes and values are arrays of issues.
   */
  static categorizeByCode(issues) {
    const codeMap = new Map()
    for (const issue of issues) {
      if (!codeMap.has(issue.subCode)) {
        codeMap.set(issue.subCode, [])
      }
      codeMap.get(issue.subCode)?.push(issue)
    }
    return codeMap
  }

  /**
   * Reduce a list of issues to one of each subCode that occurred in the incoming list, summarizing the occurrences.
   *
   * @param {BidsHedIssue[]} issues - A list of BIDS HED issues.
   * @returns {BidsHedIssue[]} A new list of issues with one issue of each type.
   */
  static reduceIssues(issues) {
    const categorizedIssues = BidsHedIssue.categorizeByCode(issues)
    const reducedIssues = []
    for (const issueList of categorizedIssues.values()) {
      if (issueList.length === 0) {
        continue
      }
      const firstIssue = issueList[0]
      // Deep copy the HED issue object to avoid modifying the original.
      const hedIssueCopy = cloneDeep(firstIssue.hedIssue)
      const newIssue = new BidsHedIssue(hedIssueCopy, firstIssue.file)

      const numErrors = issueList.length
      const numFiles = new Set(issueList.map((issue) => issue.location)).size
      newIssue.issueMessage += ` There are ${numErrors} total issues of this type in ${numFiles} unique files.`

      reducedIssues.push(newIssue)
    }
    return reducedIssues
  }

  /**
   * Filter and reduce a list of issues based on severity and user options, producing a new list.
   *
   * If `checkWarnings` is true, warnings will be included in the output, otherwise only errors will be included.
   * If `limitErrors` is true, the output will be reduced to one issue of each subCode type in the list.
   * The message of each "representative" issue will be updated to summarize the number of occurrences and files.
   *
   * @param {BidsHedIssue[]} issues - A list of BIDS HED issues.
   * @param {boolean} checkWarnings - Whether to include warnings in the output.
   * @param {boolean} limitErrors - Whether to reduce the list of issues to one of each type.
   * @returns {BidsHedIssue[]} The processed list of issues.
   */
  static processIssues(issues, checkWarnings = false, limitErrors = false) {
    const issueMap = BidsHedIssue.splitErrors(issues)
    const errorIssues = issueMap.get('error') ?? []
    const warningIssues = issueMap.get('warning') ?? []

    let processedIssues = [...errorIssues]
    if (checkWarnings) {
      processedIssues.push(...warningIssues)
    }

    if (limitErrors) {
      processedIssues = BidsHedIssue.reduceIssues(processedIssues)
    }

    return processedIssues
  }

  /**
   * Convert one or more HED issues into BIDS-compatible issues.
   *
   * @param {*} hedIssues - One or more HED-format issues.
   * @param {object|null} file - A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @param {Object<string, *>} extraParameters - Any extra parameters to inject into the {@link Issue} objects.
   * @returns {BidsHedIssue[]} An array of BIDS-compatible issues.
   */
  static fromHedIssues(hedIssues, file, extraParameters = {}) {
    if (hedIssues instanceof IssueError) {
      return [BidsHedIssue.fromHedIssue(hedIssues.issue, file, extraParameters)]
    } else if (hedIssues instanceof Error) {
      return [new BidsHedIssue(generateIssue('internalError', { message: hedIssues.message }), file ?? null)]
    } else if (!Array.isArray(hedIssues) || !hedIssues.every((issue) => issue instanceof Issue)) {
      return [new BidsHedIssue(generateIssue('internalError', { message: 'Unknown issue type' }), file ?? null)]
    } else {
      return hedIssues.map((hedIssue) => BidsHedIssue.fromHedIssue(hedIssue, file, extraParameters))
    }
  }

  /**
   * Convert a single HED issue into a BIDS-compatible issue.
   *
   * @param {Issue} hedIssue - A HED-format issue.
   * @param {object|null} file - A BIDS-format file object used to generate a {@link BidsHedIssue} object.
   * @param {Object<string, *>} extraParameters - Any extra parameters to inject into the {@link Issue} object.
   * @returns {BidsHedIssue} The BIDS-compatible issue.
   */
  static fromHedIssue(hedIssue, file, extraParameters = {}) {
    hedIssue.addParameters(extraParameters)
    return new BidsHedIssue(hedIssue, file)
  }

  /**
   * Transform a list of mixed-format issues into BIDS-compatible issues.
   *
   * @param {Array<BidsHedIssue|Error>} issues - A list of mixed-format issues.
   * @param {object|null} file - A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @returns {BidsHedIssue[]} An array of BIDS-compatible issues.
   */
  static transformToBids(issues, file = null) {
    return issues.map((issue) => {
      if (issue instanceof BidsHedIssue) {
        return issue
      } else if (issue instanceof IssueError) {
        return BidsHedIssue.fromHedIssue(issue.issue, issue.issue.file || file)
      } else if (issue instanceof Error) {
        return new BidsHedIssue(generateIssue('internalError', { message: issue.message }), file)
      } else {
        return new BidsHedIssue(generateIssue('internalError', { message: 'Unknown issue type' }), file)
      }
    })
  }

  /**
   * Add new parameters to the underlying HED issues of a list of BIDS issues and regenerate the issue messages.
   *
   * @param {BidsHedIssue[]} issues - A list of BIDS-compatible issues.
   * @param {Object<string, *>} parameters - The parameters to add.
   */
  static addIssueParameters(issues, parameters) {
    for (const issue of issues) {
      const hedIssue = issue.hedIssue
      hedIssue.addParameters(parameters)
      issue.issueMessage = hedIssue.message
    }
  }
}

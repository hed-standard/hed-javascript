/**
 * Provides a wrapper for HED validation issues that is compatible with the BIDS validator.
 * @module bids/types/issues
 */
import { generateIssue, IssueError } from '../../issues/issues.js'

/**
 * @typedef {import('../../issues/issues.js').Issue} Issue
 */

/**
 * A wrapper for a HED validation issue that is compatible with the BIDS validator.
 *
 * This class encapsulates a HED {@link Issue} object and provides additional properties and methods for BIDS-specific
 * error reporting.
 */
export class BidsHedIssue {
  /**
   * The file associated with this issue.
   * @type {object}
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
   * @type {number}
   */
  line

  /**
   * The path to the file where the issue occurred.
   * @type {string}
   */
  location

  /**
   * Constructs a BidsHedIssue object.
   *
   * @param {Issue} hedIssue The HED issue object to be wrapped.
   * @param {object} file The file object associated with this issue.
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
   * Transforms a list of issues into a Map, keyed by severity level.
   *
   * @param {BidsHedIssue[]} issues A list of BIDS HED issues.
   * @returns {Map<string, BidsHedIssue[]>} A map where keys are severity levels and values are arrays of issues.
   */
  static splitErrors(issues) {
    const issueMap = new Map()
    for (const issue of issues) {
      if (!issueMap.has(issue.severity)) {
        issueMap.set(issue.severity, [])
      }
      issueMap.get(issue.severity).push(issue)
    }
    return issueMap
  }

  /**
   * Categorizes a list of issues by their subCode values.
   *
   * @param {BidsHedIssue[]} issues A list of BIDS HED issues.
   * @returns {Map<string, BidsHedIssue[]>} A map where keys are HED issue codes and values are arrays of issues.
   */
  static categorizeByCode(issues) {
    const codeMap = new Map()
    for (const issue of issues) {
      if (!codeMap.has(issue.subCode)) {
        codeMap.set(issue.subCode, [])
      }
      codeMap.get(issue.subCode).push(issue)
    }
    return codeMap
  }

  /**
   * Reduces a list of issues to one of each subCode that occurred in the incoming list, summarizing the occurrences.
   *
   * @param {BidsHedIssue[]} issues A list of BIDS HED issues.
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
      const hedIssueCopy = JSON.parse(JSON.stringify(firstIssue.hedIssue))
      const newIssue = new BidsHedIssue(hedIssueCopy, firstIssue.file)

      const numErrors = issueList.length
      const numFiles = new Set(issueList.map((issue) => issue.location)).size
      newIssue.issueMessage += ` There are ${numErrors} total issues of this type in ${numFiles} unique files.`

      reducedIssues.push(newIssue)
    }
    return reducedIssues
  }

  /**
   * Filters and reduces a list of issues based on severity and user options, producing a new list.
   *
   * If `checkWarnings` is true, warnings will be included in the output, otherwise only errors will be included.
   * If `limitErrors` is true, the output will be reduced to one issue of each subCode type in the list.
   * The message of each "representative" issue will be updated to summarize the number of occurrences and files.
   *
   * @param {BidsHedIssue[]} issues A list of BIDS HED issues.
   * @param {boolean} checkWarnings Whether to include warnings in the output.
   * @param {boolean} limitErrors Whether to reduce the list of issues to one of each type.
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
   * Converts one or more HED issues into BIDS-compatible issues.
   *
   * @param {Error|Issue[]} hedIssues One or more HED-format issues.
   * @param {object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @param {object?} extraParameters Any extra parameters to inject into the {@link Issue} objects.
   * @returns {BidsHedIssue[]} An array of BIDS-compatible issues.
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
   * Converts a single HED issue into a BIDS-compatible issue.
   *
   * @param {Issue} hedIssue A HED-format issue.
   * @param {object} file A BIDS-format file object used to generate a {@link BidsHedIssue} object.
   * @param {object?} extraParameters Any extra parameters to inject into the {@link Issue} object.
   * @returns {BidsHedIssue} The BIDS-compatible issue.
   */
  static fromHedIssue(hedIssue, file, extraParameters) {
    Object.assign(hedIssue.parameters, extraParameters)
    hedIssue.generateMessage()
    return new BidsHedIssue(hedIssue, file)
  }

  /**
   * Transforms a list of mixed-format issues into BIDS-compatible issues.
   *
   * @param {Array<BidsHedIssue|IssueError|Error>} issues A list of mixed-format issues.
   * @param {object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @returns {BidsHedIssue[]} An array of BIDS-compatible issues.
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

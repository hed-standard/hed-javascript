/**
 * Provides a wrapper for HED validation issues that is compatible with the BIDS validator.
 * @module bids/types/issues
 */

import { generateIssue, Issue, IssueError } from '../../issues/issues'
import { IssueLevel } from '../../issues/data'

type BidsIssueCode = 'HED_ERROR' | 'HED_WARNING'

/**
 * A wrapper for a HED validation issue that is compatible with the BIDS validator.
 *
 * This class encapsulates a HED {@link Issue} object and provides additional properties and methods for BIDS-specific
 * error reporting.
 */
export class BidsHedIssue {
  /**
   * The file associated with this issue.
   */
  public readonly file: any

  /**
   * The underlying HED issue object.
   */
  public readonly hedIssue: Issue

  /**
   * The BIDS-compliant issue code.
   */
  public readonly code: BidsIssueCode

  /**
   * The HED-specific issue code.
   */
  public readonly subCode: string

  /**
   * The severity of the issue (e.g., 'error' or 'warning').
   */
  public readonly severity: IssueLevel

  /**
   * The human-readable issue message.
   */
  public issueMessage: string

  /**
   * The line number where the issue occurred.
   */
  public readonly line: string

  /**
   * The path to the file where the issue occurred.
   */
  public readonly location: string

  /**
   * Constructs a BidsHedIssue object.
   *
   * @deprecated Direct use of this constructor is not recommended. Use {@link BidsHedIssue.fromHedIssues}.
   *
   * @param hedIssue The HED issue object to be wrapped.
   * @param file The file object associated with this issue.
   */
  public constructor(hedIssue: Issue, file: any) {
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
   * @returns The issue message.
   */
  public toString(): string {
    return this.issueMessage
  }

  /**
   * Transforms a list of issues into a Map, keyed by severity level.
   *
   * @param issues A list of BIDS HED issues.
   * @returns A map where keys are severity levels and values are arrays of issues.
   */
  public static splitErrors(issues: BidsHedIssue[]): Map<IssueLevel, BidsHedIssue[]> {
    const issueMap = new Map<IssueLevel, BidsHedIssue[]>()
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
   * @param issues A list of BIDS HED issues.
   * @returns A map where keys are HED issue codes and values are arrays of issues.
   */
  public static categorizeByCode(issues: BidsHedIssue[]): Map<string, BidsHedIssue[]> {
    const codeMap = new Map<string, BidsHedIssue[]>()
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
   * @param issues A list of BIDS HED issues.
   * @returns A new list of issues with one issue of each type.
   */
  public static reduceIssues(issues: BidsHedIssue[]): BidsHedIssue[] {
    const categorizedIssues = BidsHedIssue.categorizeByCode(issues)
    const reducedIssues: BidsHedIssue[] = []
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
   * @param issues A list of BIDS HED issues.
   * @param checkWarnings Whether to include warnings in the output.
   * @param limitErrors Whether to reduce the list of issues to one of each type.
   * @returns The processed list of issues.
   */
  public static processIssues(
    issues: BidsHedIssue[],
    checkWarnings: boolean = false,
    limitErrors: boolean = false,
  ): BidsHedIssue[] {
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
   * @param hedIssues One or more HED-format issues.
   * @param file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @param extraParameters Any extra parameters to inject into the {@link Issue} objects.
   * @returns An array of BIDS-compatible issues.
   */
  public static fromHedIssues(
    hedIssues: Error | Issue[],
    file: object,
    extraParameters: Record<string, any> = {},
  ): BidsHedIssue[] {
    if (hedIssues instanceof IssueError) {
      return [BidsHedIssue.fromHedIssue(hedIssues.issue, file, extraParameters)]
    } else if (hedIssues instanceof Error) {
      return [new BidsHedIssue(generateIssue('internalError', { message: hedIssues.message }), file ?? null)]
    } else if (hedIssues.length === 0) {
      return []
    } else {
      return hedIssues.map((hedIssue) => BidsHedIssue.fromHedIssue(hedIssue, file, extraParameters))
    }
  }

  /**
   * Converts a single HED issue into a BIDS-compatible issue.
   *
   * @param hedIssue A HED-format issue.
   * @param file A BIDS-format file object used to generate a {@link BidsHedIssue} object.
   * @param extraParameters Any extra parameters to inject into the {@link Issue} object.
   * @returns The BIDS-compatible issue.
   */
  public static fromHedIssue(hedIssue: Issue, file: object, extraParameters: Record<string, any> = {}): BidsHedIssue {
    hedIssue.addParameters(extraParameters)
    return new BidsHedIssue(hedIssue, file)
  }

  /**
   * Transforms a list of mixed-format issues into BIDS-compatible issues.
   *
   * @param issues A list of mixed-format issues.
   * @param file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
   * @returns An array of BIDS-compatible issues.
   */
  public static transformToBids(issues: Array<BidsHedIssue | Error>, file: object = null): BidsHedIssue[] {
    return issues.map((issue) => {
      if (issue instanceof BidsHedIssue) {
        return issue
      } else if (issue instanceof IssueError) {
        return BidsHedIssue.fromHedIssue(issue.issue, file, issue.issue.parameters)
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
   * @param issues A list of BIDS-compatible issues.
   * @param parameters The parameters to add.
   */
  public static addIssueParameters(issues: BidsHedIssue[], parameters: Record<string, any>): void {
    for (const issue of issues) {
      const hedIssue = issue.hedIssue
      hedIssue.addParameters(parameters)
      issue.issueMessage = hedIssue.message
    }
  }
}

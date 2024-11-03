import { BidsHedIssue } from '../bids/types/issues'
import { parseHedString } from '../parser/parser'

export function shouldRun(name, testname, runMap) {
  if (runMap.size === 0) return true
  if (runMap.get(name) === undefined) return false

  const cases = runMap.get(name)
  if (cases.length === 0) return true

  return !!cases.includes(testname)
}

// Return an array of hedCode values extracted from an issues list.
export function extractHedCodes(issues) {
  const errors = []
  for (const issue of issues) {
    if (issue instanceof BidsHedIssue) {
      errors.push(`${issue.hedIssue.hedCode}`)
    } else {
      errors.push(`${issue.hedCode}`)
    }
  }
  return errors
}

// Parse the hed string
export function getHedString(hedString, hedSchemas) {
  const [parsedString, issues] = parseHedString(hedString, hedSchemas)
  const flattenedIssues = Object.values(issues).flat()
  let errorIssues = []
  let warningIssues = []
  if (flattenedIssues.length !== 0) {
    errorIssues = flattenedIssues.filter((obj) => obj.level === 'error')
    warningIssues = flattenedIssues.filter((obj) => obj.level !== 'error')
  }
  if (errorIssues.length > 0) {
    return [null, errorIssues, warningIssues]
  } else {
    return [parsedString, errorIssues, warningIssues]
  }
}

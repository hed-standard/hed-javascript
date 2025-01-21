import { BidsHedIssue } from '../bids/types/issues'
import { parseHedString } from '../parser/parser'

export function shouldRun(name, testname, runAll, runMap, skipMap) {
  if (runAll) {
    // Run everything except what is in skipMap
    if (skipMap.get(name) === undefined) return true
    const cases = skipMap.get(name)
    return !cases.includes(testname)
  }

  if (runMap.get(name) === undefined) return false
  const runCases = runMap.get(name)
  if (runCases.length === 0) return true
  return !!runCases.includes(testname)
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

// Parse the HED string
export function getHedString(hedString, hedSchemas, definitionsAllowed, placeholdersAllowed) {
  const [parsedString, issues] = parseHedString(hedString, hedSchemas, definitionsAllowed, placeholdersAllowed)
  let errorIssues = []
  let warningIssues = []
  if (issues.length !== 0) {
    errorIssues = issues.filter((obj) => obj.level === 'error')
    warningIssues = issues.filter((obj) => obj.level !== 'error')
  }
  if (errorIssues.length > 0) {
    return [null, errorIssues, warningIssues]
  } else {
    return [parsedString, errorIssues, warningIssues]
  }
}

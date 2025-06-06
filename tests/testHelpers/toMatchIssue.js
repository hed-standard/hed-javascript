import { generateIssue, IssueError } from '../../src/issues/issues'


export function toMatchIssue(receivedError, expectedCode, expectedParams = {}) {
  const expectedIssue = generateIssue(expectedCode, expectedParams)

  const passType = receivedError instanceof IssueError
  const passMessage = receivedError.message === expectedIssue.message

  if (passType && passMessage) {
    return {
      pass: true,
      message: () =>
        `Expected error not to match IssueError with message "${expectedIssue.message}", but it did.`,
    }
  } else {
    return {
      pass: false,
      message: () => {
        let msg = ''
        if (!passType) {
          msg += `Expected error to be instance of IssueError but got ${receivedError.constructor.name}\n`
        }
        if (!passMessage) {
          msg += `Expected message:\n  "${expectedIssue.message}"\nReceived:\n  "${receivedError.message}"`
        }
        return msg
      },
    }
  }
}
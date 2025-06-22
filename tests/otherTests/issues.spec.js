import { BidsHedIssue } from '../../src/bids/types/issues.js'
import { IssueError, generateIssue } from '../../src/issues/issues.js'

describe('BidsHedIssue', () => {
  describe('transformToBids', () => {
    const testFile = { path: '/test/file.tsv' }

    it('should return BidsHedIssue objects directly', () => {
      const issue = new BidsHedIssue(generateIssue('genericError'), testFile)
      const issues = [issue]
      const result = BidsHedIssue.transformToBids(issues, testFile)
      expect(result[0]).toBe(issue)
    })

    it('should transform IssueError objects', () => {
      const issueError = new IssueError(generateIssue('genericError'), testFile)
      const issues = [issueError]
      const result = BidsHedIssue.transformToBids(issues, testFile)
      expect(result[0]).toBeInstanceOf(BidsHedIssue)
      expect(result[0].file).toBe(testFile)
    })

    it('should use the file from IssueError if available', () => {
      const issueFile = { path: '/test/issueFile.tsv' }
      const issue = generateIssue('genericError')
      issue.file = issueFile
      const issueError = new IssueError(issue)
      const issues = [issueError]
      const result = BidsHedIssue.transformToBids(issues, testFile)
      expect(result[0].file).toBe(issueFile)
    })

    it('should transform generic Error objects', () => {
      const error = new Error('a generic error')
      const issues = [error]
      const result = BidsHedIssue.transformToBids(issues, testFile)
      expect(result[0]).toBeInstanceOf(BidsHedIssue)
      expect(result[0].file).toBe(testFile)
      expect(result[0].hedIssue.internalCode).toBe('internalError')
    })

    it('should handle unknown issue types', () => {
      const issues = ['a string issue']
      const result = BidsHedIssue.transformToBids(issues, testFile)
      expect(result[0]).toBeInstanceOf(BidsHedIssue)
      expect(result[0].file).toBe(testFile)
      expect(result[0].hedIssue.internalCode).toBe('internalError')
    })
  })
})

import { BidsHedIssue } from '../../src/bids/types/issues'
import { Issue, IssueError, generateIssue } from '../../src/issues/issues'

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

  describe('splitErrors', () => {
    it('should split issues by severity', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('warning1', 'HED_WARNING_1', 'warning', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file2.tsv' }),
      ]

      const split = BidsHedIssue.splitErrors(issues)

      expect(split.has('error')).toBe(true)
      expect(split.has('warning')).toBe(true)
      expect(split.get('error').length).toBe(2)
      expect(split.get('warning').length).toBe(1)
      expect(split.get('error')).toEqual([issues[0], issues[2]])
      expect(split.get('warning')).toEqual([issues[1]])
    })

    it('should handle an empty array of issues', () => {
      const issues = []
      const split = BidsHedIssue.splitErrors(issues)
      expect(split).toBeInstanceOf(Map)
      expect(split.size).toBe(0)
    })

    it('should handle issues with only one severity', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file2.tsv' }),
      ]

      const split = BidsHedIssue.splitErrors(issues)

      expect(split.has('error')).toBe(true)
      expect(split.has('warning')).toBe(false)
      expect(split.get('error').length).toBe(2)
      expect(split.get('error')).toEqual(issues)
    })

    it('should handle issues with various severity strings', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('warning1', 'HED_WARNING_1', 'warning', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('info1', 'HED_INFO_1', 'info', {}), { path: 'file2.tsv' }),
      ]

      const split = BidsHedIssue.splitErrors(issues)

      expect(split.has('error')).toBe(true)
      expect(split.has('warning')).toBe(true)
      expect(split.has('info')).toBe(true)
      expect(split.get('error').length).toBe(1)
      expect(split.get('warning').length).toBe(1)
      expect(split.get('info').length).toBe(1)
    })
  })

  describe('categorizeByCode', () => {
    it('should categorize issues by sub-code', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file2.tsv' }),
      ]
      issues[0].subCode = 'HED_ERROR_1'
      issues[1].subCode = 'HED_ERROR_2'
      issues[2].subCode = 'HED_ERROR_1'

      const categorized = BidsHedIssue.categorizeByCode(issues)

      expect(categorized.has('HED_ERROR_1')).toBe(true)
      expect(categorized.has('HED_ERROR_2')).toBe(true)
      expect(categorized.get('HED_ERROR_1').length).toBe(2)
      expect(categorized.get('HED_ERROR_2').length).toBe(1)
      expect(categorized.get('HED_ERROR_1')).toEqual([issues[0], issues[2]])
      expect(categorized.get('HED_ERROR_2')).toEqual([issues[1]])
    })

    it('should return an empty map for an empty array of issues', () => {
      const issues = []
      const categorized = BidsHedIssue.categorizeByCode(issues)
      expect(categorized).toBeInstanceOf(Map)
      expect(categorized.size).toBe(0)
    })
  })

  describe('reduceIssues', () => {
    it('should reduce a list of issues to one of each type', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file2.tsv' }),
      ]
      issues[0].subCode = 'HED_ERROR_1'
      issues[1].subCode = 'HED_ERROR_2'
      issues[2].subCode = 'HED_ERROR_1'

      const reduced = BidsHedIssue.reduceIssues(issues)
      expect(reduced.length).toBe(2)
      const reducedError1 = reduced.find((issue) => issue.subCode === 'HED_ERROR_1')
      const reducedError2 = reduced.find((issue) => issue.subCode === 'HED_ERROR_2')
      expect(reducedError1.issueMessage).toContain('There are 2 total issues of this type in 2 unique files.')
      expect(reducedError2.issueMessage).toContain('There are 1 total issues of this type in 1 unique files.')
    })

    it('should handle a list with one of each issue type', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file1.tsv' }),
      ]
      issues[0].subCode = 'HED_ERROR_1'
      issues[1].subCode = 'HED_ERROR_2'

      const reduced = BidsHedIssue.reduceIssues(issues)
      expect(reduced.length).toBe(2)
      const reducedError1 = reduced.find((issue) => issue.subCode === 'HED_ERROR_1')
      const reducedError2 = reduced.find((issue) => issue.subCode === 'HED_ERROR_2')
      expect(reducedError1.issueMessage).toContain('There are 1 total issues of this type in 1 unique files.')
      expect(reducedError2.issueMessage).toContain('There are 1 total issues of this type in 1 unique files.')
    })

    it('should handle an empty list of issues', () => {
      const issues = []
      const reduced = BidsHedIssue.reduceIssues(issues)
      expect(reduced.length).toBe(0)
    })

    it('should not modify the original list of issues', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file2.tsv' }),
      ]
      issues[0].subCode = 'HED_ERROR_1'
      issues[1].subCode = 'HED_ERROR_2'
      issues[2].subCode = 'HED_ERROR_1'
      const originalIssues = JSON.parse(JSON.stringify(issues))

      BidsHedIssue.reduceIssues(issues)
      expect(issues).toEqual(originalIssues)
    })

    it('should correctly count unique files when multiple errors of the same type are in the same file', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file2.tsv' }),
      ]
      issues[0].subCode = 'HED_ERROR_1'
      issues[1].subCode = 'HED_ERROR_1'
      issues[2].subCode = 'HED_ERROR_1'

      const reduced = BidsHedIssue.reduceIssues(issues)
      expect(reduced.length).toBe(1)
      expect(reduced[0].issueMessage).toContain('There are 3 total issues of this type in 2 unique files.')
    })
  })

  describe('processIssues', () => {
    const issues = [
      new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
      new BidsHedIssue(new Issue('warning1', 'HED_WARNING_1', 'warning', {}), { path: 'file1.tsv' }),
      new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file2.tsv' }),
      new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file2.tsv' }),
    ]
    issues[0].subCode = 'HED_ERROR_1'
    issues[1].subCode = 'HED_WARNING_1'
    issues[2].subCode = 'HED_ERROR_2'
    issues[3].subCode = 'HED_ERROR_1'

    it('should return only errors when checkWarnings is false and limitErrors is false', () => {
      const processed = BidsHedIssue.processIssues(issues, false, false)
      expect(processed.length).toBe(3)
      expect(processed.every((issue) => issue.severity === 'error')).toBe(true)
    })

    it('should return errors and warnings when checkWarnings is true and limitErrors is false', () => {
      const processed = BidsHedIssue.processIssues(issues, true, false)
      expect(processed.length).toBe(4)
      expect(processed.some((issue) => issue.severity === 'warning')).toBe(true)
    })

    it('should return reduced errors when checkWarnings is false and limitErrors is true', () => {
      const processed = BidsHedIssue.processIssues(issues, false, true)
      expect(processed.length).toBe(2)
      const error1 = processed.find((issue) => issue.subCode === 'HED_ERROR_1')
      expect(error1.issueMessage).toContain('There are 2 total issues of this type in 2 unique files.')
    })

    it('should return reduced errors and warnings when checkWarnings is true and limitErrors is true', () => {
      const processed = BidsHedIssue.processIssues(issues, true, true)
      expect(processed.length).toBe(3)
      const error1 = processed.find((issue) => issue.subCode === 'HED_ERROR_1')
      const warning1 = processed.find((issue) => issue.subCode === 'HED_WARNING_1')
      expect(error1.issueMessage).toContain('There are 2 total issues of this type in 2 unique files.')
      expect(warning1.issueMessage).toContain('There are 1 total issues of this type in 1 unique files.')
    })
  })
})

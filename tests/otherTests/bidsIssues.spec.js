import chai from 'chai'
const assert = chai.assert
import { describe, test } from '@jest/globals'
import { BidsHedIssue } from '../../src/bids/types/issues'
import { Issue } from '../../src/issues/issues'

describe('BidsHedIssue', () => {
  describe('splitErrors', () => {
    test('should split issues by severity', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('warning1', 'HED_WARNING_1', 'warning', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file2.tsv' }),
      ]

      const split = BidsHedIssue.splitErrors(issues)

      assert.isTrue(split.has('error'))
      assert.isTrue(split.has('warning'))
      assert.strictEqual(split.get('error').length, 2)
      assert.strictEqual(split.get('warning').length, 1)
      assert.deepStrictEqual(split.get('error'), [issues[0], issues[2]])
      assert.deepStrictEqual(split.get('warning'), [issues[1]])
    })

    test('should handle an empty array of issues', () => {
      const issues = []
      const split = BidsHedIssue.splitErrors(issues)
      assert.isTrue(split instanceof Map)
      assert.strictEqual(split.size, 0)
    })

    test('should handle issues with only one severity', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file2.tsv' }),
      ]

      const split = BidsHedIssue.splitErrors(issues)

      assert.isTrue(split.has('error'))
      assert.isFalse(split.has('warning'))
      assert.strictEqual(split.get('error').length, 2)
      assert.deepStrictEqual(split.get('error'), issues)
    })

    test('should handle issues with various severity strings', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('warning1', 'HED_WARNING_1', 'warning', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('info1', 'HED_INFO_1', 'info', {}), { path: 'file2.tsv' }),
      ]

      const split = BidsHedIssue.splitErrors(issues)

      assert.isTrue(split.has('error'))
      assert.isTrue(split.has('warning'))
      assert.isTrue(split.has('info'))
      assert.strictEqual(split.get('error').length, 1)
      assert.strictEqual(split.get('warning').length, 1)
      assert.strictEqual(split.get('info').length, 1)
    })
  })

  describe('categorizeByCode', () => {
    test('should categorize issues by sub-code', () => {
      const issues = [
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error2', 'HED_ERROR_2', 'error', {}), { path: 'file1.tsv' }),
        new BidsHedIssue(new Issue('error1', 'HED_ERROR_1', 'error', {}), { path: 'file2.tsv' }),
      ]
      issues[0].subCode = 'HED_ERROR_1'
      issues[1].subCode = 'HED_ERROR_2'
      issues[2].subCode = 'HED_ERROR_1'

      const categorized = BidsHedIssue.categorizeByCode(issues)

      assert.isTrue(categorized.has('HED_ERROR_1'))
      assert.isTrue(categorized.has('HED_ERROR_2'))
      assert.strictEqual(categorized.get('HED_ERROR_1').length, 2)
      assert.strictEqual(categorized.get('HED_ERROR_2').length, 1)
      assert.deepStrictEqual(categorized.get('HED_ERROR_1'), [issues[0], issues[2]])
      assert.deepStrictEqual(categorized.get('HED_ERROR_2'), [issues[1]])
    })

    test('should return an empty map for an empty array of issues', () => {
      const issues = []
      const categorized = BidsHedIssue.categorizeByCode(issues)
      assert.isTrue(categorized instanceof Map)
      assert.strictEqual(categorized.size, 0)
    })
  })
})

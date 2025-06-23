import chai from 'chai'
const assert = chai.assert
import { describe, test } from '@jest/globals'
import { BidsHedIssue } from '../../../src/bids/types/issues'
import { Issue } from '../../../src/issues/issues'

describe('BidsHedIssue', () => {
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

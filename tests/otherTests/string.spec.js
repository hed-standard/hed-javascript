import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'

import * as stringUtils from '../../src/utils/string'

describe('String utility functions', () => {
  describe('Character counts', () => {
    it('must be correct', () => {
      const testString = 'abcabcaaabccccdddfdddd'
      const resultA = stringUtils.getCharacterCount(testString, 'a')
      const resultB = stringUtils.getCharacterCount(testString, 'b')
      const resultC = stringUtils.getCharacterCount(testString, 'c')
      const resultD = stringUtils.getCharacterCount(testString, 'd')
      const resultE = stringUtils.getCharacterCount(testString, 'e')
      const resultF = stringUtils.getCharacterCount(testString, 'f')
      assert.strictEqual(resultA, 5)
      assert.strictEqual(resultB, 3)
      assert.strictEqual(resultC, 6)
      assert.strictEqual(resultD, 7)
      assert.strictEqual(resultE, 0)
      assert.strictEqual(resultF, 1)
    })
  })
})

import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'

import * as arrayUtils from '../../utils/array'

describe('Array utility functions', () => {
  describe('Element counts', () => {
    it('must be correct', () => {
      const testArray = [
        'a',
        'b',
        'c',
        'a',
        'b',
        'c',
        'a',
        'a',
        'a',
        'b',
        'c',
        'c',
        'c',
        'c',
        'd',
        'd',
        'd',
        'f',
        'd',
        'd',
        'd',
        'd',
      ]
      const resultA = arrayUtils.getElementCount(testArray, 'a')
      const resultB = arrayUtils.getElementCount(testArray, 'b')
      const resultC = arrayUtils.getElementCount(testArray, 'c')
      const resultD = arrayUtils.getElementCount(testArray, 'd')
      const resultE = arrayUtils.getElementCount(testArray, 'e')
      const resultF = arrayUtils.getElementCount(testArray, 'f')
      assert.strictEqual(resultA, 5)
      assert.strictEqual(resultB, 3)
      assert.strictEqual(resultC, 6)
      assert.strictEqual(resultD, 7)
      assert.strictEqual(resultE, 0)
      assert.strictEqual(resultF, 1)
    })
  })
})

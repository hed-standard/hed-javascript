const assert = require('assert')
const utils = require('../')

describe('Element counts', function() {
  it('must be correct', function() {
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
    const resultA = utils.array.getElementCount(testArray, 'a')
    const resultB = utils.array.getElementCount(testArray, 'b')
    const resultC = utils.array.getElementCount(testArray, 'c')
    const resultD = utils.array.getElementCount(testArray, 'd')
    const resultE = utils.array.getElementCount(testArray, 'e')
    const resultF = utils.array.getElementCount(testArray, 'f')
    assert.strictEqual(resultA, 5)
    assert.strictEqual(resultB, 3)
    assert.strictEqual(resultC, 6)
    assert.strictEqual(resultD, 7)
    assert.strictEqual(resultE, 0)
    assert.strictEqual(resultF, 1)
  })
})

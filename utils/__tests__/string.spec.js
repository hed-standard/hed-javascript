const assert = require('assert')
const utils = require('../')

describe('Blank strings', function() {
  it('may be empty', function() {
    const emptyString = ''
    const result = utils.string.stringIsEmpty(emptyString)
    assert.strictEqual(result, true)
  })

  it('may have only whitespace', function() {
    const spaceString = '     '
    const result = utils.string.stringIsEmpty(spaceString)
    assert.strictEqual(result, true)
  })

  it('may not contain letters', function() {
    const aString = 'a'
    const result = utils.string.stringIsEmpty(aString)
    assert.strictEqual(result, false)
  })

  it('may not contain numbers', function() {
    const oneString = '1'
    const result = utils.string.stringIsEmpty(oneString)
    assert.strictEqual(result, false)
  })

  it('may not contain punctuation', function() {
    const slashString = '/'
    const result = utils.string.stringIsEmpty(slashString)
    assert.strictEqual(result, false)
  })
})

describe('Capitalized strings', function() {
  it('must have a capitalized first letter', function() {
    const testString = 'to be'
    const result = utils.string.capitalizeString(testString)
    assert.strictEqual(result, 'To be')
  })

  it('must not change letters after the first letter', function() {
    const testString = 'to BE or NOT to BE'
    const result = utils.string.capitalizeString(testString)
    assert.strictEqual(result, 'To BE or NOT to BE')
  })
})

describe('Character counts', function() {
  it('must be correct', function() {
    const testString = 'abcabcaaabccccdddfdddd'
    const resultA = utils.string.getCharacterCount(testString, 'a')
    const resultB = utils.string.getCharacterCount(testString, 'b')
    const resultC = utils.string.getCharacterCount(testString, 'c')
    const resultD = utils.string.getCharacterCount(testString, 'd')
    const resultE = utils.string.getCharacterCount(testString, 'e')
    const resultF = utils.string.getCharacterCount(testString, 'f')
    assert.strictEqual(resultA, 5)
    assert.strictEqual(resultB, 3)
    assert.strictEqual(resultC, 6)
    assert.strictEqual(resultD, 7)
    assert.strictEqual(resultE, 0)
    assert.strictEqual(resultF, 1)
  })
})

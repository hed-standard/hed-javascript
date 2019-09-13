const assert = require('assert')
const utils = require('../')

describe('Blank strings', function() {
  it('may be empty', function() {
    const emptyString = ''
    const result = utils.string.stringIsEmpty(emptyString)
    assert.strictEqual(result, true)
  })

  it('may have only whitespace', function() {
    const spaceString = ' \n  \t  '
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

describe('Valid HED times', function() {
  it('must be of the form HH:MM', function() {
    const validTime1 = '23:52'
    const validTime2 = '00:55'
    const validTime3 = '11:00'
    const validTime4 = '8:24'
    const invalidTime1 = '8/8/2019'
    const invalidTime2 = '25:11'
    const invalidTime3 = '12:65'
    const invalidTime4 = 'not a time'
    const validTime1Result = utils.string.isHourMinuteTime(validTime1)
    const validTime2Result = utils.string.isHourMinuteTime(validTime2)
    const validTime3Result = utils.string.isHourMinuteTime(validTime3)
    const validTime4Result = utils.string.isHourMinuteTime(validTime4)
    const invalidTime1Result = utils.string.isHourMinuteTime(invalidTime1)
    const invalidTime2Result = utils.string.isHourMinuteTime(invalidTime2)
    const invalidTime3Result = utils.string.isHourMinuteTime(invalidTime3)
    const invalidTime4Result = utils.string.isHourMinuteTime(invalidTime4)
    assert.strictEqual(validTime1Result, true)
    assert.strictEqual(validTime2Result, true)
    assert.strictEqual(validTime3Result, true)
    assert.strictEqual(validTime4Result, true)
    assert.strictEqual(invalidTime1Result, false)
    assert.strictEqual(invalidTime2Result, false)
    assert.strictEqual(invalidTime3Result, false)
    assert.strictEqual(invalidTime4Result, false)
  })
})

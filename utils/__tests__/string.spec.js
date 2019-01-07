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

const assert = require('assert')
const validate = require('../index')

describe('Blank strings', function() {
  it('may be empty', function() {
    const emptyString = ''
    const result = validate.HED.hedStringIsEmpty(emptyString)
    assert.strictEqual(result, true)
  })

  it('may have only whitespace', function() {
    const spaceString = '     '
    const result = validate.HED.hedStringIsEmpty(spaceString)
    assert.strictEqual(result, true)
  })

  it('may not contain letters', function() {
    const aString = 'a'
    const result = validate.HED.hedStringIsEmpty(aString)
    assert.strictEqual(result, false)
  })

  it('may not contain numbers', function() {
    const oneString = '1'
    const result = validate.HED.hedStringIsEmpty(oneString)
    assert.strictEqual(result, false)
  })

  it('may not contain punctuation', function() {
    const slashString = '/'
    const result = validate.HED.hedStringIsEmpty(slashString)
    assert.strictEqual(result, false)
  })
})

describe('Lists of HED Tags', function() {
  it('should be an array', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.splitHedString(hedStr, issues)
    assert(result instanceof Array)
  })

  it('should have the correct number of elements', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.splitHedString(hedStr, issues)
    assert.equal(result.length, 3)
  })
})

describe('HED Tags', function() {
  it('should comprise valid comma-separated paths', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.validateHedString(hedStr, issues)
    assert.strictEqual(result, true)
  })

  it('should not have invalid paths', function() {
    const hedStr =
      'Event/Category|Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.validateHedString(hedStr, issues)
    assert.strictEqual(result, false)
  })
})

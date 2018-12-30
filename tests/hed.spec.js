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

  it('should include each top-level tag as its own single element', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.splitHedString(hedStr, issues)
    assert.equal(result.length, 3)
  })

  it('should include each group as its own single element', function() {
    const hedStr =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const issues = []
    const result = validate.HED.splitHedString(hedStr, issues)
    assert.equal(result.length, 4)
  })
})

describe('Formatted HED Tags', function() {
  it('should be lowercase and not have leading or trailing double quotes or slashes', function() {
    // Correct formatting
    const formattedHedTag = 'event/category/experimental stimulus'
    // Bad formatting
    const openingDoubleQuoteHedTag = '"Event/Category/Experimental stimulus'
    const closingDoubleQuoteHedTag = 'Event/Category/Experimental stimulus"'
    const openingAndClosingDoubleQuoteHedTag =
      '"Event/Category/Experimental stimulus"'
    const openingSlashHedTag = '/Event/Category/Experimental stimulus'
    const closingSlashHedTag = 'Event/Category/Experimental stimulus/'
    const openingAndClosingSlashHedTag =
      '/Event/Category/Experimental stimulus/'
    const openingDoubleQuotedSlashHedTag =
      '"/Event/Category/Experimental stimulus'
    const closingDoubleQuotedSlashHedTag =
      'Event/Category/Experimental stimulus/"'
    const openingSlashClosingDoubleQuoteHedTag =
      '/Event/Category/Experimental stimulus"'
    const closingSlashOpeningDoubleQuoteHedTag =
      '"Event/Category/Experimental stimulus/'
    const openingAndClosingDoubleQuotedSlashHedTag =
      '"/Event/Category/Experimental stimulus/"'
    const badlyFormattedTags = [
      openingDoubleQuoteHedTag,
      closingDoubleQuoteHedTag,
      openingAndClosingDoubleQuoteHedTag,
      openingSlashHedTag,
      closingSlashHedTag,
      openingAndClosingSlashHedTag,
      openingDoubleQuotedSlashHedTag,
      closingDoubleQuotedSlashHedTag,
      openingSlashClosingDoubleQuoteHedTag,
      closingSlashOpeningDoubleQuoteHedTag,
      openingAndClosingDoubleQuotedSlashHedTag,
    ]
    // Tests
    let result = validate.HED.formatHedTag(formattedHedTag)
    assert.equal(result, formattedHedTag)
    for (let badlyFormattedTag of badlyFormattedTags) {
      result = validate.HED.formatHedTag(badlyFormattedTag)
      assert.equal(formattedHedTag, result)
    }
  })
})

describe('Top-level HED Tags', function() {
  it('should not include groups', function() {
    const hedStr =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const issues = []
    const hedTags = validate.HED.splitHedString(hedStr, issues)
    const result = validate.HED.findTopLevelTags(hedTags)
    assert.equal(hedTags.length, 4)
    assert.equal(result.length, 3)
    assert.equal(issues.length, 0)
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

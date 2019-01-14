const assert = require('assert')
const validate = require('../index')

describe('HED strings', function() {
  it('cannot have invalid characters', function() {
    const invalidString1 =
      '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm'
    const invalidString2 =
      '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm'
    const issues1 = []
    const issues2 = []
    const result1 = validate.stringParser.splitHedString(
      invalidString1,
      issues1,
    )
    const result2 = validate.stringParser.splitHedString(
      invalidString2,
      issues2,
    )
    assert.strictEqual(issues1.length, 1)
    assert.strictEqual(issues2.length, 1)
    assert.strictEqual(result1.length, 3)
    assert.strictEqual(result2.length, 3)
  })
})

describe('HED tag groups', function() {
  it('must be surrounded by parentheses', function() {
    const groupString =
      '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)'
    const nonGroupString =
      '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm'
    const groupResult = validate.stringParser.hedStringIsAGroup(groupString)
    const nonGroupResult = validate.stringParser.hedStringIsAGroup(
      nonGroupString,
    )
    assert.strictEqual(groupResult, true)
    assert.strictEqual(nonGroupResult, false)
  })

  it('can have its parentheses removed', function() {
    const groupString =
      '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)'
    const formattedString =
      '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm'
    const result = validate.stringParser.removeGroupParentheses(groupString)
    assert.strictEqual(result, formattedString)
  })
})

describe('Lists of HED Tags', function() {
  it('should be an array', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.stringParser.splitHedString(hedStr, issues)
    assert(result instanceof Array)
  })

  it('should include each top-level tag as its own single element', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.stringParser.splitHedString(hedStr, issues)
    assert.strictEqual(result.length, 3)
  })

  it('should include each group as its own single element', function() {
    const hedStr =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const issues = []
    const result = validate.stringParser.splitHedString(hedStr, issues)
    assert.strictEqual(result.length, 4)
  })

  it('should handle tildes', function() {
    const hedStr =
      '/Item/Object/Vehicle/Car ~ /Attribute/Object control/Perturb'
    const issues = []
    const result = validate.stringParser.splitHedString(hedStr, issues)
    assert.strictEqual(issues.length, 0)
    assert.strictEqual(result.length, 3)
    assert.strictEqual(result[1], '~')
  })

  it('should not include double quotes', function() {
    const doubleQuoteString =
      'Event/Category/Experimental stimulus,"Item/Object/Vehicle/Train",Attribute/Visual/Color/Purple'
    const normalString =
      'Event/Category/Experimental stimulus,"Item/Object/Vehicle/Train",Attribute/Visual/Color/Purple'
    const doubleQuoteIssues = []
    const normalIssues = []
    const doubleQuoteResult = validate.stringParser.splitHedString(
      doubleQuoteString,
      doubleQuoteIssues,
    )
    const normalResult = validate.stringParser.splitHedString(
      normalString,
      normalIssues,
    )
    assert.strictEqual(doubleQuoteIssues.length, 0)
    assert.strictEqual(normalIssues.length, 0)
    assert.deepStrictEqual(doubleQuoteResult, normalResult)
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
    let result = validate.stringParser.formatHedTag(formattedHedTag)
    assert.strictEqual(result, formattedHedTag)
    for (let badlyFormattedTag of badlyFormattedTags) {
      result = validate.stringParser.formatHedTag(badlyFormattedTag)
      assert.strictEqual(formattedHedTag, result)
    }
  })
})

describe('Top-level HED Tags', function() {
  it('should not include groups', function() {
    const hedStr =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const issues = []
    const parsedString = validate.stringParser.parseHedString(hedStr, issues)
    assert.strictEqual(parsedString.topLevelTags.length, 3)
  })
})

describe('Parsed HED Tags', function() {
  it('must have the correct number of tags, top-level tags, and groups', function() {
    const hedStr =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const issues = []
    const parsedString = validate.stringParser.parseHedString(hedStr, issues)
    assert.strictEqual(parsedString.tags.length, 5)
    assert.strictEqual(parsedString.topLevelTags.length, 3)
    assert.strictEqual(parsedString.groupTags.length, 1)
  })

  it('must include properly formatted tags', function() {
    const hedStr =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const formattedHedStr =
      'action/reach/to touch,(attribute/object side/left,participant/effect/body part/arm),attribute/location/screen/top/70 px,attribute/location/screen/left/23 px'
    const issues = []
    const parsedString = validate.stringParser.parseHedString(hedStr, issues)
    const parsedFormattedString = validate.stringParser.parseHedString(
      formattedHedStr,
      issues,
    )
    assert.deepStrictEqual(
      parsedString.formattedTags,
      parsedFormattedString.tags,
    )
    assert.deepStrictEqual(
      parsedString.formattedGroupTags,
      parsedFormattedString.groupTags,
    )
    assert.deepStrictEqual(
      parsedString.formattedTopLevelTags,
      parsedFormattedString.topLevelTags,
    )
  })
})

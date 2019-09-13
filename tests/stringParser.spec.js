const assert = require('assert')
const validate = require('../validators')

describe('HED strings', function() {
  it('cannot have invalid characters', function() {
    const invalidString1 =
      '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm'
    const invalidString2 =
      '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm'
    const invalidString3 =
      '/Attribute/Object side/Left,/Participant/Effect[/Body part/Arm'
    const invalidString4 =
      '/Attribute/Object side/Left,/Participant/Effect]/Body part/Arm'
    const issues1 = []
    const issues2 = []
    const issues3 = []
    const issues4 = []
    const result1 = validate.stringParser.splitHedString(
      invalidString1,
      issues1,
    )
    const result2 = validate.stringParser.splitHedString(
      invalidString2,
      issues2,
    )
    const result3 = validate.stringParser.splitHedString(
      invalidString3,
      issues3,
    )
    const result4 = validate.stringParser.splitHedString(
      invalidString4,
      issues4,
    )
    assert.strictEqual(issues1.length, 1)
    assert.strictEqual(issues2.length, 1)
    assert.strictEqual(issues3.length, 1)
    assert.strictEqual(issues4.length, 1)
    assert.strictEqual(result1.length, 3)
    assert.strictEqual(result2.length, 3)
    assert.strictEqual(result3.length, 3)
    assert.strictEqual(result4.length, 3)
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

  it('should not include blanks', function() {
    const doubleTildeString =
      '/Item/Object/Vehicle/Car~~/Attribute/Object control/Perturb'
    const doubleCommaString =
      '/Item/Object/Vehicle/Car,,/Attribute/Object control/Perturb'
    const doubleInvalidCharacterString =
      '/Item/Object/Vehicle/Car[]/Attribute/Object control/Perturb'
    const trailingBlankString =
      '/Item/Object/Vehicle/Car,/Attribute/Object control/Perturb,'
    const doubleTildeIssues = []
    const doubleCommaIssues = []
    const doubleInvalidCharacterIssues = []
    const trailingBlankIssues = []
    const correctDoubleTildeList = [
      '/Item/Object/Vehicle/Car',
      '~',
      '~',
      '/Attribute/Object control/Perturb',
    ]
    const correctDoubleCommaList = [
      '/Item/Object/Vehicle/Car',
      '/Attribute/Object control/Perturb',
    ]
    const correctDoubleInvalidCharacterList = correctDoubleCommaList
    const correctTrailingCharacterList = correctDoubleCommaList
    const doubleTildeResult = validate.stringParser.splitHedString(
      doubleTildeString,
      doubleTildeIssues,
    )
    const doubleCommaResult = validate.stringParser.splitHedString(
      doubleCommaString,
      doubleCommaIssues,
    )
    const doubleInvalidCharacterResult = validate.stringParser.splitHedString(
      doubleInvalidCharacterString,
      doubleInvalidCharacterIssues,
    )
    const trailingBlankResult = validate.stringParser.splitHedString(
      trailingBlankString,
      trailingBlankIssues,
    )
    assert.deepStrictEqual(doubleTildeResult, correctDoubleTildeList)
    assert.deepStrictEqual(doubleCommaResult, correctDoubleCommaList)
    assert.deepStrictEqual(
      doubleInvalidCharacterResult,
      correctDoubleInvalidCharacterList,
    )
    assert.deepStrictEqual(trailingBlankResult, correctTrailingCharacterList)
    assert.strictEqual(doubleTildeIssues.length, 0)
    assert.strictEqual(doubleCommaIssues.length, 0)
    assert.strictEqual(doubleInvalidCharacterIssues.length, 2)
    assert.strictEqual(trailingBlankIssues.length, 0)
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
    for (const badlyFormattedTag of badlyFormattedTags) {
      result = validate.stringParser.formatHedTag(badlyFormattedTag)
      assert.strictEqual(result, formattedHedTag)
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
    assert.strictEqual(parsedString.tagGroups.length, 1)
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
      parsedString.formattedTagGroups,
      parsedFormattedString.tagGroups,
    )
    assert.deepStrictEqual(
      parsedString.formattedTopLevelTags,
      parsedFormattedString.topLevelTags,
    )
  })
})

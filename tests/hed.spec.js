const assert = require('assert')
const validate = require('../index')

describe('Full HED Strings', function() {
  it('should not have mismatched parentheses', function() {
    const extraOpeningString =
      '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const extraClosingString =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const validString =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const extraOpeningIssues = []
    const extraOpeningResult = validate.HED.validateFullHedString(
      extraOpeningString,
      extraOpeningIssues,
    )
    const extraClosingIssues = []
    const extraClosingResult = validate.HED.validateFullHedString(
      extraClosingString,
      extraClosingIssues,
    )
    const validIssues = []
    const validResult = validate.HED.validateFullHedString(
      validString,
      validIssues,
    )
    assert.strictEqual(extraOpeningResult, false)
    assert.strictEqual(extraClosingResult, false)
    assert.strictEqual(validResult, true)
    /* This also triggers a comma error, which means 2 issues. */
    assert.strictEqual(extraOpeningIssues.length, 2)
    assert.strictEqual(extraClosingIssues.length, 2)
    assert.strictEqual(validIssues.length, 0)
  })

  it('should not have missing commas', function() {
    const missingOpeningString =
      '/Action/Reach/To touch(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const missingClosingString =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const validString =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const missingOpeningIssues = []
    const missingOpeningResult = validate.HED.validateFullHedString(
      missingOpeningString,
      missingOpeningIssues,
    )
    const missingClosingIssues = []
    const missingClosingResult = validate.HED.validateFullHedString(
      missingClosingString,
      missingClosingIssues,
    )
    const validIssues = []
    const validResult = validate.HED.validateFullHedString(
      validString,
      validIssues,
    )
    assert.strictEqual(missingOpeningResult, false)
    assert.strictEqual(missingClosingResult, false)
    assert.strictEqual(validResult, true)
    assert.strictEqual(missingOpeningIssues.length, 1)
    assert.strictEqual(missingClosingIssues.length, 1)
    assert.strictEqual(validIssues.length, 0)
  })
})

describe('Individual HED Tags', function() {
  it('should have properly capitalized names', function() {
    const properTag = 'Event/Category/Experimental stimulus'
    const camelCaseTag = 'DoubleEvent/Something'
    const badTag = 'Event/something'
    const properTagIssues = []
    const camelCaseTagIssues = []
    const badTagIssues = []
    const parsedProperTag = validate.stringParser.parseHedString(
      properTag,
      properTagIssues,
    )
    const parsedCamelCaseTag = validate.stringParser.parseHedString(
      camelCaseTag,
      camelCaseTagIssues,
    )
    const parsedBadTag = validate.stringParser.parseHedString(
      badTag,
      badTagIssues,
    )
    const properTagResult = validate.HED.validateIndividualHedTags(
      parsedProperTag,
      properTagIssues,
      true,
    )
    const camelCaseTagResult = validate.HED.validateIndividualHedTags(
      parsedCamelCaseTag,
      camelCaseTagIssues,
      true,
    )
    const badTagResult = validate.HED.validateIndividualHedTags(
      parsedBadTag,
      badTagIssues,
      true,
    )
    assert.strictEqual(properTagResult, true)
    assert.strictEqual(camelCaseTagResult, true)
    assert.strictEqual(badTagResult, false)
    assert.strictEqual(properTagIssues.length, 0)
    assert.strictEqual(camelCaseTagIssues.length, 0)
    assert.strictEqual(badTagIssues.length, 1)
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

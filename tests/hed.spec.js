const assert = require('assert')
const validate = require('../validators')

describe('Full HED Strings', function() {
  it('should not have mismatched parentheses', function() {
    const extraOpeningString =
      '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const extraClosingString =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const validString =
      '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
    const [
      extraOpeningResult,
      extraOpeningIssues,
    ] = validate.HED.validateHedString(extraOpeningString)
    const [
      extraClosingResult,
      extraClosingIssues,
    ] = validate.HED.validateHedString(extraClosingString)
    const [validResult, validIssues] = validate.HED.validateHedString(
      validString,
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
    const [
      missingOpeningResult,
      missingOpeningIssues,
    ] = validate.HED.validateHedString(missingOpeningString)
    const [
      missingClosingResult,
      missingClosingIssues,
    ] = validate.HED.validateHedString(missingClosingString)
    const [validResult, validIssues] = validate.HED.validateHedString(
      validString,
    )
    assert.strictEqual(missingOpeningResult, false)
    assert.strictEqual(missingClosingResult, false)
    assert.strictEqual(validResult, true)
    assert.strictEqual(missingOpeningIssues.length, 1)
    assert.strictEqual(missingClosingIssues.length, 1)
    assert.strictEqual(validIssues.length, 0)
  })

  it('should not have invalid characters', function() {
    const invalidString1 =
      '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm'
    const invalidString2 =
      '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm'
    const invalidString3 =
      '/Attribute/Object side/Left,/Participant/Effect[/Body part/Arm'
    const invalidString4 =
      '/Attribute/Object side/Left,/Participant/Effect]/Body part/Arm'
    const [result1, issues1] = validate.HED.validateHedString(invalidString1)
    const [result2, issues2] = validate.HED.validateHedString(invalidString2)
    const [result3, issues3] = validate.HED.validateHedString(invalidString3)
    const [result4, issues4] = validate.HED.validateHedString(invalidString4)
    assert.strictEqual(result1, false)
    assert.strictEqual(result2, false)
    assert.strictEqual(result3, false)
    assert.strictEqual(result4, false)
    assert.strictEqual(issues1.length, 1)
    assert.strictEqual(issues2.length, 1)
    assert.strictEqual(issues3.length, 1)
    assert.strictEqual(issues4.length, 1)
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
      false,
      true,
    )
    const camelCaseTagResult = validate.HED.validateIndividualHedTags(
      parsedCamelCaseTag,
      camelCaseTagIssues,
      false,
      true,
    )
    const badTagResult = validate.HED.validateIndividualHedTags(
      parsedBadTag,
      badTagIssues,
      false,
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

describe('HED Tag Levels', function() {
  it('should not contain duplicates', function() {
    const topLevelDuplicateString =
      'Event/Category/Experimental stimulus,Event/Category/Experimental stimulus'
    const groupDuplicateString =
      'Item/Object/Vehicle/Train,(Event/Category/Experimental stimulus,Attribute/Visual/Color/Purple,Event/Category/Experimental stimulus)'
    const noDuplicateString =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const legalDuplicateString =
      'Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)'
    const topLevelDuplicateIssues = []
    const groupDuplicateIssues = []
    const noDuplicateIssues = []
    const legalDuplicateIssues = []
    const parsedTopLevelDuplicateString = validate.stringParser.parseHedString(
      topLevelDuplicateString,
      topLevelDuplicateIssues,
    )
    const parsedGroupDuplicateString = validate.stringParser.parseHedString(
      groupDuplicateString,
      groupDuplicateIssues,
    )
    const parsedNoDuplicateString = validate.stringParser.parseHedString(
      noDuplicateString,
      noDuplicateIssues,
    )
    const parsedLegalDuplicateString = validate.stringParser.parseHedString(
      legalDuplicateString,
      legalDuplicateIssues,
    )
    const topLevelDuplicateResult = validate.HED.validateHedTagLevels(
      parsedTopLevelDuplicateString,
      topLevelDuplicateIssues,
      false,
    )
    const groupDuplicateResult = validate.HED.validateHedTagLevels(
      parsedGroupDuplicateString,
      groupDuplicateIssues,
      false,
    )
    const noDuplicateResult = validate.HED.validateHedTagLevels(
      parsedNoDuplicateString,
      noDuplicateIssues,
      false,
    )
    const legalDuplicateResult = validate.HED.validateHedTagLevels(
      parsedLegalDuplicateString,
      legalDuplicateIssues,
      false,
    )
    assert.strictEqual(topLevelDuplicateResult, false)
    assert.strictEqual(groupDuplicateResult, false)
    assert.strictEqual(legalDuplicateResult, true)
    assert.strictEqual(noDuplicateResult, true)
    assert.strictEqual(topLevelDuplicateIssues.length, 1)
    assert.strictEqual(groupDuplicateIssues.length, 1)
    assert.strictEqual(noDuplicateIssues.length, 0)
    assert.strictEqual(legalDuplicateIssues.length, 0)
  })
})

describe('HED Tags', function() {
  it('should comprise valid comma-separated paths', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const [result, issues] = validate.HED.validateHedString(hedStr)
    assert.strictEqual(result, true)
    assert.deepStrictEqual(issues, [])
  })
})

describe('HED Tag Groups', function() {
  it('should have no more than two tildes', function() {
    const noTildeGroupString =
      'Event/Category/Experimental stimulus,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)'
    const oneTildeGroupString =
      'Event/Category/Experimental stimulus,(Item/Object/Vehicle/Car ~ Attribute/Object control/Perturb)'
    const twoTildeGroupString =
      'Event/Category/Experimental stimulus,(Participant/ID 1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red)'
    const invalidTildeGroupString =
      'Event/Category/Experimental stimulus,(Participant/ID 1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red ~ Attribute/Object control/Perturb)'
    const noTildeGroupIssues = []
    const oneTildeGroupIssues = []
    const twoTildeGroupIssues = []
    const invalidTildeGroupIssues = []
    const parsedNoTildeGroupString = validate.stringParser.parseHedString(
      noTildeGroupString,
      noTildeGroupIssues,
    )
    const parsedOneTildeGroupString = validate.stringParser.parseHedString(
      oneTildeGroupString,
      oneTildeGroupIssues,
    )
    const parsedTwoTildeGroupString = validate.stringParser.parseHedString(
      twoTildeGroupString,
      twoTildeGroupIssues,
    )
    const parsedInvalidTildeGroupString = validate.stringParser.parseHedString(
      invalidTildeGroupString,
      invalidTildeGroupIssues,
    )
    const noTildeGroupResult = validate.HED.validateHedTagGroups(
      parsedNoTildeGroupString,
      noTildeGroupIssues,
    )
    const oneTildeGroupResult = validate.HED.validateHedTagGroups(
      parsedOneTildeGroupString,
      oneTildeGroupIssues,
    )
    const twoTildeGroupResult = validate.HED.validateHedTagGroups(
      parsedTwoTildeGroupString,
      twoTildeGroupIssues,
    )
    const invalidTildeGroupResult = validate.HED.validateHedTagGroups(
      parsedInvalidTildeGroupString,
      invalidTildeGroupIssues,
    )
    assert.strictEqual(noTildeGroupResult, true)
    assert.strictEqual(oneTildeGroupResult, true)
    assert.strictEqual(twoTildeGroupResult, true)
    assert.strictEqual(invalidTildeGroupResult, false)
    assert.strictEqual(noTildeGroupIssues.length, 0)
    assert.strictEqual(oneTildeGroupIssues.length, 0)
    assert.strictEqual(twoTildeGroupIssues.length, 0)
    assert.strictEqual(invalidTildeGroupIssues.length, 1)
  })
})

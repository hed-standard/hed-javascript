const assert = require('chai').assert
const validate = require('../validators')
const generateIssue = require('../utils/issues')

const localHedSchemaFile = 'tests/data/HEDTest.xml'

describe('HED strings', function() {
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = validate.schema.buildSchema({ path: localHedSchemaFile })
  })

  describe('Full HED Strings', function() {
    const validator = function(testStrings, expectedResults, expectedIssues) {
      for (const testStringKey in testStrings) {
        const [testResult, testIssues] = validate.HED.validateHedString(
          testStrings[testStringKey],
        )
        assert.strictEqual(
          testResult,
          expectedResults[testStringKey],
          testStrings[testStringKey],
        )
        assert.sameDeepMembers(
          testIssues,
          expectedIssues[testStringKey],
          testStrings[testStringKey],
        )
      }
    }

    it('should not have mismatched parentheses', function() {
      const testStrings = {
        extraOpeningString:
          '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        // The extra comma is needed to avoid a comma error.
        extraClosingString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        validString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
      }
      const expectedResults = {
        extraOpeningString: false,
        extraClosingString: false,
        validString: true,
      }
      const expectedIssues = {
        extraOpeningString: [
          generateIssue('parentheses', { opening: 2, closing: 1 }),
        ],
        extraClosingString: [
          generateIssue('parentheses', { opening: 1, closing: 2 }),
        ],
        validString: [],
      }
      validator(testStrings, expectedResults, expectedIssues)
    })

    it('should not have malformed delimiters', function() {
      const testStrings = {
        missingOpeningCommaString:
          '/Action/Reach/To touch(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        missingClosingCommaString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        extraOpeningCommaString:
          ',/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        extraClosingCommaString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px,',
        extraOpeningTildeString:
          '~/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        extraClosingTildeString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px~',
        multipleExtraOpeningDelimiterString:
          ',~,/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        multipleExtraClosingDelimiterString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px,~~,',
        multipleExtraMiddleDelimiterString:
          '/Action/Reach/To touch,,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,~,/Attribute/Location/Screen/Left/23 px',
        validString:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        validNestedParenthesesString:
          '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px),Event/Duration/3 ms',
      }
      const expectedResults = {
        missingOpeningCommaString: false,
        missingClosingCommaString: false,
        extraOpeningCommaString: false,
        extraClosingCommaString: false,
        extraOpeningTildeString: false,
        extraClosingTildeString: false,
        multipleExtraOpeningDelimiterString: false,
        multipleExtraClosingDelimiterString: false,
        multipleExtraMiddleDelimiterString: false,
        validString: true,
        validNestedParenthesesString: true,
      }
      const expectedIssues = {
        missingOpeningCommaString: [
          generateIssue('invalidTag', { tag: '/Action/Reach/To touch(' }),
        ],
        missingClosingCommaString: [
          generateIssue('commaMissing', {
            tag: '/Participant/Effect/Body part/Arm)/',
          }),
        ],
        extraOpeningCommaString: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: 0,
            string: testStrings.extraOpeningCommaString,
          }),
        ],
        extraClosingCommaString: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: testStrings.extraClosingCommaString.length - 1,
            string: testStrings.extraClosingCommaString,
          }),
        ],
        extraOpeningTildeString: [
          generateIssue('extraDelimiter', {
            character: '~',
            index: 0,
            string: testStrings.extraOpeningTildeString,
          }),
        ],
        extraClosingTildeString: [
          generateIssue('extraDelimiter', {
            character: '~',
            index: testStrings.extraClosingTildeString.length - 1,
            string: testStrings.extraClosingTildeString,
          }),
        ],
        multipleExtraOpeningDelimiterString: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: 0,
            string: testStrings.multipleExtraOpeningDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: 1,
            string: testStrings.multipleExtraOpeningDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: ',',
            index: 2,
            string: testStrings.multipleExtraOpeningDelimiterString,
          }),
        ],
        multipleExtraClosingDelimiterString: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: testStrings.multipleExtraClosingDelimiterString.length - 1,
            string: testStrings.multipleExtraClosingDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: testStrings.multipleExtraClosingDelimiterString.length - 2,
            string: testStrings.multipleExtraClosingDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: testStrings.multipleExtraClosingDelimiterString.length - 3,
            string: testStrings.multipleExtraClosingDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: ',',
            index: testStrings.multipleExtraClosingDelimiterString.length - 4,
            string: testStrings.multipleExtraClosingDelimiterString,
          }),
        ],
        multipleExtraMiddleDelimiterString: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: 23,
            string: testStrings.multipleExtraMiddleDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: 125,
            string: testStrings.multipleExtraMiddleDelimiterString,
          }),
          generateIssue('extraDelimiter', {
            character: ',',
            index: 126,
            string: testStrings.multipleExtraMiddleDelimiterString,
          }),
        ],
        validString: [],
        validNestedParenthesesString: [],
      }
      validator(testStrings, expectedResults, expectedIssues)
    })

    it('should not have invalid characters', function() {
      const testStrings = {
        openingBraceString:
          '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm',
        closingBraceString:
          '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm',
        openingBracketString:
          '/Attribute/Object side/Left,/Participant/Effect[/Body part/Arm',
        closingBracketString:
          '/Attribute/Object side/Left,/Participant/Effect]/Body part/Arm',
      }
      const expectedResults = {
        openingBraceString: false,
        closingBraceString: false,
        openingBracketString: false,
        closingBracketString: false,
      }
      const expectedIssues = {
        openingBraceString: [
          generateIssue('invalidCharacter', {
            character: '{',
            index: 47,
            string: testStrings.openingBraceString,
          }),
        ],
        closingBraceString: [
          generateIssue('invalidCharacter', {
            character: '}',
            index: 47,
            string: testStrings.closingBraceString,
          }),
        ],
        openingBracketString: [
          generateIssue('invalidCharacter', {
            character: '[',
            index: 47,
            string: testStrings.openingBracketString,
          }),
        ],
        closingBracketString: [
          generateIssue('invalidCharacter', {
            character: ']',
            index: 47,
            string: testStrings.closingBracketString,
          }),
        ],
      }
      validator(testStrings, expectedResults, expectedIssues)
    })
  })

  describe('Individual HED Tags', function() {
    it('should exist in the schema or be an allowed extension', async done => {
      // Legal takesValue tag
      const properTag1 = 'Event/Duration/3 ms'
      // Legal "full" tag
      const properTag2 = 'Attribute/Object side/Left'
      // Legal extensionAllowed tag
      const properTag3 = 'Item/Object/Person/Driver'
      // Leaf tag (extension allowed with flag)
      const properTag4 = 'Action/Hum/Song'
      // Illegal tag (not in schema, no extension allowed)
      const badTag1 = 'Item/Nonsense'
      // Illegal comma
      const badTag2 = 'Event/Label/This is a label,This/Is/A/Tag'
      const properTag1Issues = []
      const properTag2Issues = []
      const properTag3Issues = []
      const properTag4Issues = []
      const badTag1Issues = []
      const badTag2Issues = []
      const parsedProperTag1 = validate.stringParser.parseHedString(
        properTag1,
        properTag1Issues,
      )
      const parsedProperTag2 = validate.stringParser.parseHedString(
        properTag2,
        properTag2Issues,
      )
      const parsedProperTag3 = validate.stringParser.parseHedString(
        properTag3,
        properTag3Issues,
      )
      const parsedProperTag4 = validate.stringParser.parseHedString(
        properTag4,
        properTag4Issues,
      )
      const parsedBadTag1 = validate.stringParser.parseHedString(
        badTag1,
        badTag1Issues,
      )
      const parsedBadTag2 = validate.stringParser.parseHedString(
        badTag2,
        badTag2Issues,
      )
      hedSchemaPromise.then(hedSchema => {
        const properTag1Result = validate.HED.validateIndividualHedTags(
          parsedProperTag1,
          hedSchema,
          properTag1Issues,
          true,
          false,
          false,
        )
        const properTag2Result = validate.HED.validateIndividualHedTags(
          parsedProperTag2,
          hedSchema,
          properTag2Issues,
          true,
          false,
          false,
        )
        const properTag3Result = validate.HED.validateIndividualHedTags(
          parsedProperTag3,
          hedSchema,
          properTag3Issues,
          true,
          false,
          false,
        )
        const properTag4Result = validate.HED.validateIndividualHedTags(
          parsedProperTag4,
          hedSchema,
          properTag4Issues,
          true,
          false,
          true,
        )
        const badTag1Result = validate.HED.validateIndividualHedTags(
          parsedBadTag1,
          hedSchema,
          badTag1Issues,
          true,
          false,
          false,
        )
        const badTag2Result = validate.HED.validateIndividualHedTags(
          parsedBadTag2,
          hedSchema,
          badTag2Issues,
          true,
          false,
          false,
        )
        assert.strictEqual(properTag1Result, true)
        assert.strictEqual(properTag2Result, true)
        assert.strictEqual(properTag3Result, true)
        assert.strictEqual(properTag4Result, true)
        assert.strictEqual(badTag1Result, false)
        assert.strictEqual(badTag2Result, false)
        assert.strictEqual(properTag1Issues.length, 0)
        assert.strictEqual(properTag2Issues.length, 0)
        assert.strictEqual(properTag3Issues.length, 0)
        assert.strictEqual(properTag4Issues.length, 0)
        assert.strictEqual(badTag1Issues.length, 1)
        assert.strictEqual(badTag2Issues.length, 1)
        done()
      })
    })

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
        {},
        properTagIssues,
        false,
        true,
      )
      const camelCaseTagResult = validate.HED.validateIndividualHedTags(
        parsedCamelCaseTag,
        {},
        camelCaseTagIssues,
        false,
        true,
      )
      const badTagResult = validate.HED.validateIndividualHedTags(
        parsedBadTag,
        {},
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

    it('should have a child when required', async done => {
      const properTag = 'Event/Category/Experimental stimulus'
      const badTag = 'Event/Category'
      const properTagIssues = []
      const badTagIssues = []
      const parsedProperTag = validate.stringParser.parseHedString(
        properTag,
        properTagIssues,
      )
      const parsedBadTag = validate.stringParser.parseHedString(
        badTag,
        badTagIssues,
      )
      hedSchemaPromise.then(hedSchema => {
        const properTagResult = validate.HED.validateIndividualHedTags(
          parsedProperTag,
          hedSchema,
          properTagIssues,
          true,
          true,
        )
        const badTagResult = validate.HED.validateIndividualHedTags(
          parsedBadTag,
          hedSchema,
          badTagIssues,
          true,
          true,
        )
        assert.strictEqual(properTagResult, true)
        assert.strictEqual(badTagResult, false)
        assert.strictEqual(properTagIssues.length, 0)
        assert.strictEqual(badTagIssues.length, 1)
        done()
      })
    })

    it('should have a unit when required', async done => {
      const properTag = 'Event/Duration/3 ms'
      const badTag = 'Event/Duration/3'
      const noUnitRequiredTag1 = 'Attribute/Color/Red/0.5'
      const noUnitRequiredTag2 = 'Attribute/Color/Red/5.2e-1'
      const properTimeTag = 'Item/2D shape/Clock face/8:30'
      const properTagIssues = []
      const badTagIssues = []
      const noUnitRequiredTag1Issues = []
      const noUnitRequiredTag2Issues = []
      const properTimeTagIssues = []
      const expectedBadTagIssues = [
        generateIssue('unitClassDefaultUsed', {
          defaultUnit: 's',
          tag: badTag,
        }),
      ]
      const parsedProperTag = validate.stringParser.parseHedString(
        properTag,
        properTagIssues,
      )
      const parsedBadTag = validate.stringParser.parseHedString(
        badTag,
        badTagIssues,
      )
      const parsedNoUnitRequiredTag1 = validate.stringParser.parseHedString(
        noUnitRequiredTag1,
        noUnitRequiredTag1Issues,
      )
      const parsedNoUnitRequiredTag2 = validate.stringParser.parseHedString(
        noUnitRequiredTag2,
        noUnitRequiredTag2Issues,
      )
      const parsedProperTimeTag = validate.stringParser.parseHedString(
        properTimeTag,
        properTimeTagIssues,
      )
      hedSchemaPromise.then(hedSchema => {
        const properTagResult = validate.HED.validateIndividualHedTags(
          parsedProperTag,
          hedSchema,
          properTagIssues,
          true,
          true,
        )
        const badTagResult = validate.HED.validateIndividualHedTags(
          parsedBadTag,
          hedSchema,
          badTagIssues,
          true,
          true,
        )
        const noUnitRequiredTag1Result = validate.HED.validateIndividualHedTags(
          parsedNoUnitRequiredTag1,
          hedSchema,
          noUnitRequiredTag1Issues,
          true,
          true,
        )
        const noUnitRequiredTag2Result = validate.HED.validateIndividualHedTags(
          parsedNoUnitRequiredTag2,
          hedSchema,
          noUnitRequiredTag2Issues,
          true,
          true,
        )
        const properTimeTagResult = validate.HED.validateIndividualHedTags(
          parsedProperTimeTag,
          hedSchema,
          properTimeTagIssues,
          true,
          false,
        )
        assert.strictEqual(properTagResult, true)
        assert.strictEqual(badTagResult, false)
        assert.strictEqual(noUnitRequiredTag1Result, true)
        assert.strictEqual(noUnitRequiredTag2Result, true)
        assert.strictEqual(properTimeTagResult, true)
        assert.sameDeepMembers(properTagIssues, [])
        assert.sameDeepMembers(badTagIssues, expectedBadTagIssues)
        assert.sameDeepMembers(noUnitRequiredTag1Issues, [])
        assert.sameDeepMembers(noUnitRequiredTag2Issues, [])
        assert.sameDeepMembers(properTimeTagIssues, [])
        done()
      })
    })

    it('should have a proper unit when required', async done => {
      const properTag1 = 'Event/Duration/3 ms'
      const properTag2 = 'Event/Duration/3.5e1 ms'
      const badUnitTag = 'Event/Duration/3 cm'
      const noUnitRequiredTag1 = 'Attribute/Color/Red/0.5'
      const noUnitRequiredTag2 = 'Attribute/Color/Red/5e-1'
      const properTimeTag = 'Item/2D shape/Clock face/8:30'
      const badTimeTag = 'Item/2D shape/Clock face/54:54'
      const properTag1Issues = []
      const properTag2Issues = []
      const badUnitTagIssues = []
      const noUnitRequiredTag1Issues = []
      const noUnitRequiredTag2Issues = []
      const properTimeTagIssues = []
      const badTimeTagIssues = []
      const parsedProperTag1 = validate.stringParser.parseHedString(
        properTag1,
        properTag1Issues,
      )
      const parsedProperTag2 = validate.stringParser.parseHedString(
        properTag2,
        properTag2Issues,
      )
      const parsedBadUnitTag = validate.stringParser.parseHedString(
        badUnitTag,
        badUnitTagIssues,
      )
      const parsedNoUnitRequiredTag1 = validate.stringParser.parseHedString(
        noUnitRequiredTag1,
        noUnitRequiredTag1Issues,
      )
      const parsedNoUnitRequiredTag2 = validate.stringParser.parseHedString(
        noUnitRequiredTag2,
        noUnitRequiredTag2Issues,
      )
      const parsedProperTimeTag = validate.stringParser.parseHedString(
        properTimeTag,
        properTimeTagIssues,
      )
      const parsedBadTimeTag = validate.stringParser.parseHedString(
        badTimeTag,
        badTimeTagIssues,
      )
      hedSchemaPromise.then(hedSchema => {
        const properTag1Result = validate.HED.validateIndividualHedTags(
          parsedProperTag1,
          hedSchema,
          properTag1Issues,
          true,
          false,
        )
        const properTag2Result = validate.HED.validateIndividualHedTags(
          parsedProperTag2,
          hedSchema,
          properTag2Issues,
          true,
          false,
        )
        const badUnitTagResult = validate.HED.validateIndividualHedTags(
          parsedBadUnitTag,
          hedSchema,
          badUnitTagIssues,
          true,
          false,
        )
        const noUnitRequiredTag1Result = validate.HED.validateIndividualHedTags(
          parsedNoUnitRequiredTag1,
          hedSchema,
          noUnitRequiredTag1Issues,
          true,
          false,
        )
        const noUnitRequiredTag2Result = validate.HED.validateIndividualHedTags(
          parsedNoUnitRequiredTag2,
          hedSchema,
          noUnitRequiredTag2Issues,
          true,
          false,
        )
        const properTimeTagResult = validate.HED.validateIndividualHedTags(
          parsedProperTimeTag,
          hedSchema,
          properTimeTagIssues,
          true,
          false,
        )
        const badTimeTagResult = validate.HED.validateIndividualHedTags(
          parsedBadTimeTag,
          hedSchema,
          badTimeTagIssues,
          true,
          false,
        )
        assert.strictEqual(properTag1Result, true)
        assert.strictEqual(properTag2Result, true)
        assert.strictEqual(badUnitTagResult, false)
        assert.strictEqual(noUnitRequiredTag1Result, true)
        assert.strictEqual(noUnitRequiredTag2Result, true)
        assert.strictEqual(properTimeTagResult, true)
        assert.strictEqual(badTimeTagResult, false)
        assert.strictEqual(properTag1Issues.length, 0)
        assert.strictEqual(properTag2Issues.length, 0)
        assert.strictEqual(badUnitTagIssues.length, 1)
        assert.strictEqual(noUnitRequiredTag1Issues.length, 0)
        assert.strictEqual(noUnitRequiredTag2Issues.length, 0)
        assert.strictEqual(properTimeTagIssues.length, 0)
        assert.strictEqual(badTimeTagIssues.length, 1)
        done()
      })
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
        {},
        topLevelDuplicateIssues,
        false,
      )
      const groupDuplicateResult = validate.HED.validateHedTagLevels(
        parsedGroupDuplicateString,
        {},
        groupDuplicateIssues,
        false,
      )
      const noDuplicateResult = validate.HED.validateHedTagLevels(
        parsedNoDuplicateString,
        {},
        noDuplicateIssues,
        false,
      )
      const legalDuplicateResult = validate.HED.validateHedTagLevels(
        parsedLegalDuplicateString,
        {},
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

    it('should not have multiple copies of a unique tag', async done => {
      const legalString =
        'Event/Description/Rail vehicles,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)'
      const multipleDescString =
        'Event/Description/Rail vehicles,Event/Description/Locomotive-pulled or multiple units,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)'
      const legalIssues = []
      const multipleDescIssues = []
      const expectedMultipleDescIssues = [
        generateIssue('multipleUniqueTags', { tag: 'event/description' }),
      ]
      const parsedLegalString = validate.stringParser.parseHedString(
        legalString,
        legalIssues,
      )
      const parsedMultipleDescString = validate.stringParser.parseHedString(
        multipleDescString,
        multipleDescIssues,
      )
      hedSchemaPromise.then(schema => {
        const legalResult = validate.HED.validateHedTagLevels(
          parsedLegalString,
          schema,
          legalIssues,
          true,
        )
        const multipleDescResult = validate.HED.validateHedTagLevels(
          parsedMultipleDescString,
          schema,
          multipleDescIssues,
          true,
        )
        assert.strictEqual(legalResult, true)
        assert.strictEqual(multipleDescResult, false)
        assert.sameDeepMembers(legalIssues, [])
        assert.sameDeepMembers(multipleDescIssues, expectedMultipleDescIssues)
        done()
      })
    })
  })

  describe('Top-level Tags', function() {
    it('should include all required tags', async done => {
      const completeString =
        'Event/Label/Bus,Event/Category/Experimental stimulus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus'
      const incompleteString1 =
        'Event/Category/Experimental stimulus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus'
      const incompleteString2 =
        'Event/Label/Bus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus'
      const incompleteString3 =
        'Event/Label/Bus,Event/Category/Experimental stimulus,Item/Object/Vehicle/Bus'
      const completeIssues = []
      const incompleteIssues1 = []
      const incompleteIssues2 = []
      const incompleteIssues3 = []
      const parsedCompleteString = validate.stringParser.parseHedString(
        completeString,
        completeIssues,
      )
      const parsedIncompleteString1 = validate.stringParser.parseHedString(
        incompleteString1,
        incompleteIssues1,
      )
      const parsedIncompleteString2 = validate.stringParser.parseHedString(
        incompleteString2,
        incompleteIssues2,
      )
      const parsedIncompleteString3 = validate.stringParser.parseHedString(
        incompleteString3,
        incompleteIssues3,
      )
      hedSchemaPromise.then(schema => {
        const completeResult = validate.HED.validateTopLevelTags(
          parsedCompleteString,
          schema,
          completeIssues,
        )
        const incompleteResult1 = validate.HED.validateTopLevelTags(
          parsedIncompleteString1,
          schema,
          incompleteIssues1,
        )
        const incompleteResult2 = validate.HED.validateTopLevelTags(
          parsedIncompleteString2,
          schema,
          incompleteIssues2,
        )
        const incompleteResult3 = validate.HED.validateTopLevelTags(
          parsedIncompleteString3,
          schema,
          incompleteIssues3,
        )
        assert.strictEqual(completeResult, true)
        assert.strictEqual(incompleteResult1, false)
        assert.strictEqual(incompleteResult2, false)
        assert.strictEqual(incompleteResult3, false)
        assert.strictEqual(completeIssues.length, 0)
        assert.strictEqual(incompleteIssues1.length, 1)
        assert.strictEqual(incompleteIssues2.length, 1)
        assert.strictEqual(incompleteIssues3.length, 1)
        done()
      })
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
      const expectedInvalidTildeGroupIssues = [
        generateIssue('tooManyTildes', {
          tagGroup:
            'Participant/ID 1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red ~ Attribute/Object control/Perturb',
        }),
      ]
      assert.strictEqual(noTildeGroupResult, true)
      assert.strictEqual(oneTildeGroupResult, true)
      assert.strictEqual(twoTildeGroupResult, true)
      assert.strictEqual(invalidTildeGroupResult, false)
      assert.sameDeepMembers(noTildeGroupIssues, [])
      assert.sameDeepMembers(oneTildeGroupIssues, [])
      assert.sameDeepMembers(twoTildeGroupIssues, [])
      // assert.sameDeepMembers(invalidTildeGroupIssues, expectedInvalidTildeGroupIssues)
      // assert.strictEqual(noTildeGroupIssues.length, 0)
      // assert.strictEqual(oneTildeGroupIssues.length, 0)
      // assert.strictEqual(twoTildeGroupIssues.length, 0)
      assert.strictEqual(invalidTildeGroupIssues.length, 1)
    })
  })
})

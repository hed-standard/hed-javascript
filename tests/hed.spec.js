const assert = require('chai').assert
const validate = require('../validators')
const generateIssue = require('../utils/issues')

const localHedSchemaFile = 'tests/data/HEDTest.xml'

describe('HED strings', function() {
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = validate.schema.buildSchema({ path: localHedSchemaFile })
  })

  const validatorSemanticBase = function(
    testStrings,
    expectedResults,
    expectedIssues,
    done,
    testFunction,
  ) {
    hedSchemaPromise.then(schema => {
      for (const testStringKey in testStrings) {
        const testIssues = []
        const parsedTestString = validate.stringParser.parseHedString(
          testStrings[testStringKey],
          testIssues,
        )
        const testResult = testFunction(parsedTestString, testIssues, schema)
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
      done()
    })
  }

  const validatorSyntacticBase = function(
    testStrings,
    expectedResults,
    expectedIssues,
    testFunction,
  ) {
    for (const testStringKey in testStrings) {
      const testIssues = []
      const parsedTestString = validate.stringParser.parseHedString(
        testStrings[testStringKey],
        testIssues,
      )
      const testResult = testFunction(parsedTestString, testIssues)
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
        extraOpening:
          '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        // The extra comma is needed to avoid a comma error.
        extraClosing:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        valid:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
      }
      const expectedResults = {
        extraOpening: false,
        extraClosing: false,
        valid: true,
      }
      const expectedIssues = {
        extraOpening: [
          generateIssue('parentheses', { opening: 2, closing: 1 }),
        ],
        extraClosing: [
          generateIssue('parentheses', { opening: 1, closing: 2 }),
        ],
        valid: [],
      }
      validator(testStrings, expectedResults, expectedIssues)
    })

    it('should not have malformed delimiters', function() {
      const testStrings = {
        missingOpeningComma:
          '/Action/Reach/To touch(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        missingClosingComma:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        extraOpeningComma:
          ',/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        extraClosingComma:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px,',
        extraOpeningTilde:
          '~/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        extraClosingTilde:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px~',
        multipleExtraOpeningDelimiter:
          ',~,/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        multipleExtraClosingDelimiter:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px,~~,',
        multipleExtraMiddleDelimiter:
          '/Action/Reach/To touch,,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,~,/Attribute/Location/Screen/Left/23 px',
        valid:
          '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        validNestedParentheses:
          '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px),Event/Duration/3 ms',
      }
      const expectedResults = {
        missingOpeningComma: false,
        missingClosingComma: false,
        extraOpeningComma: false,
        extraClosingComma: false,
        extraOpeningTilde: false,
        extraClosingTilde: false,
        multipleExtraOpeningDelimiter: false,
        multipleExtraClosingDelimiter: false,
        multipleExtraMiddleDelimiter: false,
        valid: true,
        validNestedParentheses: true,
      }
      const expectedIssues = {
        missingOpeningComma: [
          generateIssue('invalidTag', { tag: '/Action/Reach/To touch(' }),
        ],
        missingClosingComma: [
          generateIssue('commaMissing', {
            tag: '/Participant/Effect/Body part/Arm)/',
          }),
        ],
        extraOpeningComma: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: 0,
            string: testStrings.extraOpeningComma,
          }),
        ],
        extraClosingComma: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: testStrings.extraClosingComma.length - 1,
            string: testStrings.extraClosingComma,
          }),
        ],
        extraOpeningTilde: [
          generateIssue('extraDelimiter', {
            character: '~',
            index: 0,
            string: testStrings.extraOpeningTilde,
          }),
        ],
        extraClosingTilde: [
          generateIssue('extraDelimiter', {
            character: '~',
            index: testStrings.extraClosingTilde.length - 1,
            string: testStrings.extraClosingTilde,
          }),
        ],
        multipleExtraOpeningDelimiter: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: 0,
            string: testStrings.multipleExtraOpeningDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: 1,
            string: testStrings.multipleExtraOpeningDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: ',',
            index: 2,
            string: testStrings.multipleExtraOpeningDelimiter,
          }),
        ],
        multipleExtraClosingDelimiter: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: testStrings.multipleExtraClosingDelimiter.length - 1,
            string: testStrings.multipleExtraClosingDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: testStrings.multipleExtraClosingDelimiter.length - 2,
            string: testStrings.multipleExtraClosingDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: testStrings.multipleExtraClosingDelimiter.length - 3,
            string: testStrings.multipleExtraClosingDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: ',',
            index: testStrings.multipleExtraClosingDelimiter.length - 4,
            string: testStrings.multipleExtraClosingDelimiter,
          }),
        ],
        multipleExtraMiddleDelimiter: [
          generateIssue('extraDelimiter', {
            character: ',',
            index: 23,
            string: testStrings.multipleExtraMiddleDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: '~',
            index: 125,
            string: testStrings.multipleExtraMiddleDelimiter,
          }),
          generateIssue('extraDelimiter', {
            character: ',',
            index: 126,
            string: testStrings.multipleExtraMiddleDelimiter,
          }),
        ],
        valid: [],
        validNestedParentheses: [],
      }
      validator(testStrings, expectedResults, expectedIssues)
    })

    it('should not have invalid characters', function() {
      const testStrings = {
        openingBrace:
          '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm',
        closingBrace:
          '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm',
        openingBracket:
          '/Attribute/Object side/Left,/Participant/Effect[/Body part/Arm',
        closingBracket:
          '/Attribute/Object side/Left,/Participant/Effect]/Body part/Arm',
      }
      const expectedResults = {
        openingBrace: false,
        closingBrace: false,
        openingBracket: false,
        closingBracket: false,
      }
      const expectedIssues = {
        openingBrace: [
          generateIssue('invalidCharacter', {
            character: '{',
            index: 47,
            string: testStrings.openingBrace,
          }),
        ],
        closingBrace: [
          generateIssue('invalidCharacter', {
            character: '}',
            index: 47,
            string: testStrings.closingBrace,
          }),
        ],
        openingBracket: [
          generateIssue('invalidCharacter', {
            character: '[',
            index: 47,
            string: testStrings.openingBracket,
          }),
        ],
        closingBracket: [
          generateIssue('invalidCharacter', {
            character: ']',
            index: 47,
            string: testStrings.closingBracket,
          }),
        ],
      }
      validator(testStrings, expectedResults, expectedIssues)
    })
  })

  describe('Individual HED Tags', function() {
    const validatorSyntactic = function(
      testStrings,
      expectedResults,
      expectedIssues,
      checkForWarnings,
    ) {
      validatorSyntacticBase(
        testStrings,
        expectedResults,
        expectedIssues,
        function(parsedTestString, testIssues) {
          return validate.HED.validateIndividualHedTags(
            parsedTestString,
            {},
            testIssues,
            false,
            checkForWarnings,
          )
        },
      )
    }

    const validatorSemantic = function(
      testStrings,
      expectedResults,
      expectedIssues,
      checkForWarnings,
      done,
    ) {
      validatorSemanticBase(
        testStrings,
        expectedResults,
        expectedIssues,
        done,
        function(parsedTestString, testIssues, schema) {
          return validate.HED.validateIndividualHedTags(
            parsedTestString,
            schema,
            testIssues,
            true,
            checkForWarnings,
          )
        },
      )
    }

    it('should exist in the schema or be an allowed extension', async done => {
      const testStrings = {
        takesValue: 'Event/Duration/3 ms',
        full: 'Attribute/Object side/Left',
        extensionAllowed: 'Item/Object/Person/Driver',
        leafExtension: 'Action/Hum/Song',
        nonExtensionAllowed: 'Item/Nonsense',
        illegalComma: 'Event/Label/This is a label,This/Is/A/Tag',
      }
      const expectedResults = {
        takesValue: true,
        full: true,
        extensionAllowed: true,
        leafExtension: false,
        nonExtensionAllowed: false,
        illegalComma: false,
      }
      const expectedIssues = {
        takesValue: [],
        full: [],
        extensionAllowed: [],
        leafExtension: [
          generateIssue('invalidTag', { tag: testStrings.leafExtension }),
        ],
        nonExtensionAllowed: [
          generateIssue('invalidTag', { tag: testStrings.nonExtensionAllowed }),
        ],
        illegalComma: [
          generateIssue('extraCommaOrInvalid', {
            previousTag: 'Event/Label/This is a label',
            tag: 'This/Is/A/Tag',
          }),
        ],
      }
      validatorSemantic(
        testStrings,
        expectedResults,
        expectedIssues,
        false,
        done,
      )
    })

    it('should have properly capitalized names', function() {
      const testStrings = {
        proper: 'Event/Category/Experimental stimulus',
        camelCase: 'DoubleEvent/Something',
        takesValue: 'Attribute/Temporal rate/20 Hz',
        numeric: 'Attribute/Repetition/20',
        lowercase: 'Event/something',
      }
      const expectedResults = {
        proper: true,
        camelCase: true,
        takesValue: true,
        numeric: true,
        lowercase: false,
      }
      const expectedIssues = {
        proper: [],
        camelCase: [],
        takesValue: [],
        numeric: [],
        lowercase: [
          generateIssue('capitalization', { tag: testStrings.lowercase }),
        ],
      }
      validatorSyntactic(testStrings, expectedResults, expectedIssues, true)
    })

    it('should have a child when required', async done => {
      const testStrings = {
        hasChild: 'Event/Category/Experimental stimulus',
        missingChild: 'Event/Category',
      }
      const expectedResults = {
        hasChild: true,
        missingChild: false,
      }
      const expectedIssues = {
        hasChild: [],
        missingChild: [
          generateIssue('childRequired', { tag: testStrings.missingChild }),
        ],
      }
      validatorSemantic(
        testStrings,
        expectedResults,
        expectedIssues,
        true,
        done,
      )
    })

    it('should have a unit when required', async done => {
      const testStrings = {
        hasRequiredUnit: 'Event/Duration/3 ms',
        missingRequiredUnit: 'Event/Duration/3',
        notRequiredNumber: 'Attribute/Color/Red/0.5',
        notRequiredScientific: 'Attribute/Color/Red/5.2e-1',
        timeValue: 'Item/2D shape/Clock face/8:30',
      }
      const expectedResults = {
        hasRequiredUnit: true,
        missingRequiredUnit: false,
        notRequiredNumber: true,
        notRequiredScientific: true,
        timeValue: true,
      }
      const expectedIssues = {
        hasRequiredUnit: [],
        missingRequiredUnit: [
          generateIssue('unitClassDefaultUsed', {
            defaultUnit: 's',
            tag: testStrings.missingRequiredUnit,
          }),
        ],
        notRequiredNumber: [],
        notRequiredScientific: [],
        timeValue: [],
      }
      validatorSemantic(
        testStrings,
        expectedResults,
        expectedIssues,
        true,
        done,
      )
    })

    it('should have a proper unit when required', async done => {
      const testStrings = {
        correctUnit: 'Event/Duration/3 ms',
        correctUnitScientific: 'Event/Duration/3.5e1 ms',
        incorrectUnit: 'Event/Duration/3 cm',
        notRequiredNumber: 'Attribute/Color/Red/0.5',
        notRequiredScientific: 'Attribute/Color/Red/5e-1',
        properTime: 'Item/2D shape/Clock face/8:30',
        invalidTime: 'Item/2D shape/Clock face/54:54',
      }
      const expectedResults = {
        correctUnit: true,
        correctUnitScientific: true,
        incorrectUnit: false,
        notRequiredNumber: true,
        notRequiredScientific: true,
        properTime: true,
        invalidTime: false,
      }
      const legalTimeUnits = [
        's',
        'second',
        'seconds',
        'centiseconds',
        'centisecond',
        'cs',
        'hour:min',
        'day',
        'days',
        'ms',
        'milliseconds',
        'millisecond',
        'minute',
        'minutes',
        'hour',
        'hours',
      ]
      const expectedIssues = {
        correctUnit: [],
        correctUnitScientific: [],
        incorrectUnit: [
          generateIssue('unitClassInvalidUnit', {
            tag: testStrings.incorrectUnit,
            unitClassUnits: legalTimeUnits.sort().join(','),
          }),
        ],
        notRequiredNumber: [],
        notRequiredScientific: [],
        properTime: [],
        invalidTime: [
          generateIssue('unitClassInvalidUnit', {
            tag: testStrings.invalidTime,
            unitClassUnits: legalTimeUnits.sort().join(','),
          }),
        ],
      }
      validatorSemantic(
        testStrings,
        expectedResults,
        expectedIssues,
        false,
        done,
      )
    })
  })

  describe('HED Tag Levels', function() {
    const validatorSyntactic = function(
      testStrings,
      expectedResults,
      expectedIssues,
    ) {
      validatorSyntacticBase(
        testStrings,
        expectedResults,
        expectedIssues,
        function(parsedTestString, testIssues) {
          return validate.HED.validateHedTagLevels(
            parsedTestString,
            {},
            testIssues,
            false,
          )
        },
      )
    }

    const validatorSemantic = function(
      testStrings,
      expectedResults,
      expectedIssues,
      done,
    ) {
      validatorSemanticBase(
        testStrings,
        expectedResults,
        expectedIssues,
        done,
        function(parsedTestString, testIssues, schema) {
          return validate.HED.validateHedTagLevels(
            parsedTestString,
            schema,
            testIssues,
            true,
          )
        },
      )
    }

    it('should not contain duplicates', function() {
      const testStrings = {
        topLevelDuplicate:
          'Event/Category/Experimental stimulus,Event/Category/Experimental stimulus',
        groupDuplicate:
          'Item/Object/Vehicle/Train,(Event/Category/Experimental stimulus,Attribute/Visual/Color/Purple,Event/Category/Experimental stimulus)',
        noDuplicate:
          'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple',
        legalDuplicate:
          'Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
      }
      const expectedResults = {
        topLevelDuplicate: false,
        groupDuplicate: false,
        legalDuplicate: true,
        noDuplicate: true,
      }
      const expectedIssues = {
        topLevelDuplicate: [
          generateIssue('duplicateTag', {
            tag: 'Event/Category/Experimental stimulus',
          }),
        ],
        groupDuplicate: [
          generateIssue('duplicateTag', {
            tag: 'Event/Category/Experimental stimulus',
          }),
        ],
        legalDuplicate: [],
        noDuplicate: [],
      }
      validatorSyntactic(testStrings, expectedResults, expectedIssues)
    })

    it('should not have multiple copies of a unique tag', async done => {
      const testStrings = {
        legal:
          'Event/Description/Rail vehicles,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
        multipleDesc:
          'Event/Description/Rail vehicles,Event/Description/Locomotive-pulled or multiple units,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
      }
      const expectedResults = {
        legal: true,
        multipleDesc: false,
      }
      const expectedIssues = {
        legal: [],
        multipleDesc: [
          generateIssue('multipleUniqueTags', { tag: 'event/description' }),
        ],
      }
      validatorSemantic(testStrings, expectedResults, expectedIssues, done)
    })
  })

  describe('Top-level Tags', function() {
    const validator = function(
      testStrings,
      expectedResults,
      expectedIssues,
      done,
    ) {
      validatorSemanticBase(
        testStrings,
        expectedResults,
        expectedIssues,
        done,
        function(parsedTestString, testIssues, schema) {
          return validate.HED.validateTopLevelTags(
            parsedTestString,
            schema,
            testIssues,
          )
        },
      )
    }

    it('should include all required tags', async done => {
      const testStrings = {
        complete:
          'Event/Label/Bus,Event/Category/Experimental stimulus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus',
        missingLabel:
          'Event/Category/Experimental stimulus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus',
        missingCategory:
          'Event/Label/Bus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus',
        missingDescription:
          'Event/Label/Bus,Event/Category/Experimental stimulus,Item/Object/Vehicle/Bus',
        missingAllRequired: 'Item/Object/Vehicle/Bus',
      }
      const expectedResults = {
        complete: true,
        missingLabel: false,
        missingCategory: false,
        missingDescription: false,
        missingAllRequired: false,
      }
      const expectedIssues = {
        complete: [],
        missingLabel: [
          generateIssue('requiredPrefixMissing', { tagPrefix: 'event/label' }),
        ],
        missingCategory: [
          generateIssue('requiredPrefixMissing', {
            tagPrefix: 'event/category',
          }),
        ],
        missingDescription: [
          generateIssue('requiredPrefixMissing', {
            tagPrefix: 'event/description',
          }),
        ],
        missingAllRequired: [
          generateIssue('requiredPrefixMissing', {
            tagPrefix: 'event/label',
          }),
          generateIssue('requiredPrefixMissing', {
            tagPrefix: 'event/category',
          }),
          generateIssue('requiredPrefixMissing', {
            tagPrefix: 'event/description',
          }),
        ],
      }
      validator(testStrings, expectedResults, expectedIssues, done)
    })
  })

  describe('HED Tag Groups', function() {
    const validator = function(testStrings, expectedResults, expectedIssues) {
      validatorSyntacticBase(
        testStrings,
        expectedResults,
        expectedIssues,
        function(parsedTestString, testIssues) {
          return validate.HED.validateHedTagGroups(parsedTestString, testIssues)
        },
      )
    }

    it('should have no more than two tildes', function() {
      const testStrings = {
        noTildeGroup:
          'Event/Category/Experimental stimulus,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
        oneTildeGroup:
          'Event/Category/Experimental stimulus,(Item/Object/Vehicle/Car ~ Attribute/Object control/Perturb)',
        twoTildeGroup:
          'Event/Category/Experimental stimulus,(Participant/ID 1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red)',
        invalidTildeGroup:
          'Event/Category/Experimental stimulus,(Participant/ID 1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red ~ Attribute/Object control/Perturb)',
      }
      const expectedResults = {
        noTildeGroup: true,
        oneTildeGroup: true,
        twoTildeGroup: true,
        invalidTildeGroup: false,
      }
      const expectedIssues = {
        noTildeGroup: [],
        oneTildeGroup: [],
        twoTildeGroup: [],
        invalidTildeGroup: [
          generateIssue('tooManyTildes', {
            tagGroup:
              '(Participant/ID 1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red ~ Attribute/Object control/Perturb)',
          }),
        ],
      }
      validator(testStrings, expectedResults, expectedIssues)
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
})

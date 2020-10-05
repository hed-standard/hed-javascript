const assert = require('chai').assert
const stringParser = require('../validator/stringParser')
const generateIssue = require('../utils/issues')

describe('HED string parsing', () => {
  const validatorWithoutIssues = function(
    testStrings,
    expectedResults,
    testFunction,
  ) {
    for (const testStringKey in testStrings) {
      const testResult = testFunction(testStrings[testStringKey])
      assert.deepStrictEqual(
        testResult,
        expectedResults[testStringKey],
        testStrings[testStringKey],
      )
    }
  }

  const validatorWithIssues = function(
    testStrings,
    expectedResults,
    expectedIssues,
    testFunction,
  ) {
    for (const testStringKey in testStrings) {
      const testIssues = []
      const testResult = testFunction(testStrings[testStringKey], testIssues)
      assert.sameDeepMembers(
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

  describe('HED strings', () => {
    it('cannot have invalid characters', () => {
      const testStrings = {
        openingCurly:
          '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm',
        closingCurly:
          '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm',
        openingSquare:
          '/Attribute/Object side/Left,/Participant/Effect[/Body part/Arm',
        closingSquare:
          '/Attribute/Object side/Left,/Participant/Effect]/Body part/Arm',
      }
      const expectedResultList = [
        '/Attribute/Object side/Left',
        '/Participant/Effect',
        '/Body part/Arm',
      ]
      const expectedResults = {
        openingCurly: expectedResultList,
        closingCurly: expectedResultList,
        openingSquare: expectedResultList,
        closingSquare: expectedResultList,
      }
      const expectedIssues = {
        openingCurly: [
          generateIssue('invalidCharacter', {
            character: '{',
            index: 47,
            string: testStrings.openingCurly,
          }),
        ],
        closingCurly: [
          generateIssue('invalidCharacter', {
            character: '}',
            index: 47,
            string: testStrings.closingCurly,
          }),
        ],
        openingSquare: [
          generateIssue('invalidCharacter', {
            character: '[',
            index: 47,
            string: testStrings.openingSquare,
          }),
        ],
        closingSquare: [
          generateIssue('invalidCharacter', {
            character: ']',
            index: 47,
            string: testStrings.closingSquare,
          }),
        ],
      }
      validatorWithIssues(
        testStrings,
        expectedResults,
        expectedIssues,
        (string, issues) => {
          return stringParser.splitHedString(string, issues)
        },
      )
    })
  })

  describe('HED tag groups', () => {
    it('must be surrounded by parentheses', () => {
      const groupString =
        '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)'
      const nonGroupString =
        '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm'
      const groupResult = stringParser.hedStringIsAGroup(groupString)
      const nonGroupResult = stringParser.hedStringIsAGroup(nonGroupString)
      assert.strictEqual(groupResult, true)
      assert.strictEqual(nonGroupResult, false)
    })

    it('can have its parentheses removed', () => {
      const groupString =
        '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)'
      const formattedString =
        '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm'
      const result = stringParser.removeGroupParentheses(groupString)
      assert.strictEqual(result, formattedString)
    })
  })

  describe('Lists of HED Tags', () => {
    it('should be an array', () => {
      const hedString =
        'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
      const issues = []
      const result = stringParser.splitHedString(hedString, issues)
      assert(result instanceof Array)
    })

    it('should include each top-level tag as its own single element', () => {
      const hedString =
        'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
      const issues = []
      const result = stringParser.splitHedString(hedString, issues)
      assert.deepStrictEqual(result, [
        'Event/Category/Experimental stimulus',
        'Item/Object/Vehicle/Train',
        'Attribute/Visual/Color/Purple',
      ])
    })

    it('should include each group as its own single element', () => {
      const hedString =
        '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
      const issues = []
      const result = stringParser.splitHedString(hedString, issues)
      assert.deepStrictEqual(result, [
        '/Action/Reach/To touch',
        '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)',
        '/Attribute/Location/Screen/Top/70 px',
        '/Attribute/Location/Screen/Left/23 px',
      ])
    })

    it('should handle tildes', () => {
      const hedString =
        '/Item/Object/Vehicle/Car ~ /Attribute/Object control/Perturb'
      const issues = []
      const result = stringParser.splitHedString(hedString, issues)
      assert.deepStrictEqual(issues, [])
      assert.deepStrictEqual(result, [
        '/Item/Object/Vehicle/Car',
        '~',
        '/Attribute/Object control/Perturb',
      ])
    })

    it('should not include double quotes', () => {
      const doubleQuoteString =
        'Event/Category/Experimental stimulus,"Item/Object/Vehicle/Train",Attribute/Visual/Color/Purple'
      const normalString =
        'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
      const doubleQuoteIssues = []
      const normalIssues = []
      const doubleQuoteResult = stringParser.splitHedString(
        doubleQuoteString,
        doubleQuoteIssues,
      )
      const normalResult = stringParser.splitHedString(
        normalString,
        normalIssues,
      )
      assert.deepStrictEqual(doubleQuoteIssues, [])
      assert.deepStrictEqual(normalIssues, [])
      assert.deepStrictEqual(doubleQuoteResult, normalResult)
    })

    it('should not include blanks', () => {
      const testStrings = {
        doubleTilde:
          '/Item/Object/Vehicle/Car~~/Attribute/Object control/Perturb',
        doubleComma:
          '/Item/Object/Vehicle/Car,,/Attribute/Object control/Perturb',
        doubleInvalidCharacter:
          '/Item/Object/Vehicle/Car[]/Attribute/Object control/Perturb',
        trailingBlank:
          '/Item/Object/Vehicle/Car,/Attribute/Object control/Perturb,',
      }
      const expectedList = [
        '/Item/Object/Vehicle/Car',
        '/Attribute/Object control/Perturb',
      ]
      const expectedResults = {
        doubleTilde: [
          '/Item/Object/Vehicle/Car',
          '~',
          '~',
          '/Attribute/Object control/Perturb',
        ],
        doubleComma: expectedList,
        doubleInvalidCharacter: expectedList,
        trailingBlank: expectedList,
      }
      const expectedIssues = {
        doubleTilde: [],
        doubleComma: [],
        doubleInvalidCharacter: [
          generateIssue('invalidCharacter', {
            character: '[',
            index: 24,
            string: testStrings.doubleInvalidCharacter,
          }),
          generateIssue('invalidCharacter', {
            character: ']',
            index: 25,
            string: testStrings.doubleInvalidCharacter,
          }),
        ],
        trailingBlank: [],
      }
      validatorWithIssues(
        testStrings,
        expectedResults,
        expectedIssues,
        (string, issues) => {
          return stringParser.splitHedString(string, issues)
        },
      )
    })
  })

  describe('Formatted HED Tags', () => {
    it('should be lowercase and not have leading or trailing double quotes or slashes', () => {
      // Correct formatting
      const formattedHedTag = 'event/category/experimental stimulus'
      const testStrings = {
        formatted: 'event/category/experimental stimulus',
        openingDoubleQuote: '"Event/Category/Experimental stimulus',
        closingDoubleQuote: 'Event/Category/Experimental stimulus"',
        openingAndClosingDoubleQuote: '"Event/Category/Experimental stimulus"',
        openingSlash: '/Event/Category/Experimental stimulus',
        closingSlash: 'Event/Category/Experimental stimulus/',
        openingAndClosingSlash: '/Event/Category/Experimental stimulus/',
        openingDoubleQuotedSlash: '"/Event/Category/Experimental stimulus',
        closingDoubleQuotedSlash: 'Event/Category/Experimental stimulus/"',
        openingSlashClosingDoubleQuote:
          '/Event/Category/Experimental stimulus"',
        closingSlashOpeningDoubleQuote:
          '"Event/Category/Experimental stimulus/',
        openingAndClosingDoubleQuotedSlash:
          '"/Event/Category/Experimental stimulus/"',
      }
      const expectedResults = {
        formatted: formattedHedTag,
        openingDoubleQuote: formattedHedTag,
        closingDoubleQuote: formattedHedTag,
        openingAndClosingDoubleQuote: formattedHedTag,
        openingSlash: formattedHedTag,
        closingSlash: formattedHedTag,
        openingAndClosingSlash: formattedHedTag,
        openingDoubleQuotedSlash: formattedHedTag,
        closingDoubleQuotedSlash: formattedHedTag,
        openingSlashClosingDoubleQuote: formattedHedTag,
        closingSlashOpeningDoubleQuote: formattedHedTag,
        openingAndClosingDoubleQuotedSlash: formattedHedTag,
      }
      validatorWithoutIssues(testStrings, expectedResults, string => {
        return stringParser.formatHedTag(string)
      })
    })
  })

  describe('Parsed HED Tags', () => {
    it('must have the correct number of tags, top-level tags, and groups', () => {
      const hedString =
        '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
      const [parsedString, issues] = stringParser.parseHedString(hedString)
      assert.deepStrictEqual(issues, [])
      assert.sameDeepMembers(parsedString.tags, [
        '/Action/Reach/To touch',
        '/Attribute/Object side/Left',
        '/Participant/Effect/Body part/Arm',
        '/Attribute/Location/Screen/Top/70 px',
        '/Attribute/Location/Screen/Left/23 px',
      ])
      assert.sameDeepMembers(parsedString.topLevelTags, [
        '/Action/Reach/To touch',
        '/Attribute/Location/Screen/Top/70 px',
        '/Attribute/Location/Screen/Left/23 px',
      ])
      assert.sameDeepMembers(parsedString.tagGroups, [
        ['/Attribute/Object side/Left', '/Participant/Effect/Body part/Arm'],
      ])
    })

    it('must include properly formatted tags', () => {
      const hedString =
        '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px'
      const formattedHedString =
        'action/reach/to touch,(attribute/object side/left,participant/effect/body part/arm),attribute/location/screen/top/70 px,attribute/location/screen/left/23 px'
      const [parsedString, issues] = stringParser.parseHedString(hedString)
      const [
        parsedFormattedString,
        formattedIssues,
      ] = stringParser.parseHedString(formattedHedString)
      assert.deepStrictEqual(issues, [])
      assert.deepStrictEqual(formattedIssues, [])
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
})

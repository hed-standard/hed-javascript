const assert = require('chai').assert
const converter = require('../converter')
const schema = require('../schema')
const generateIssue = require('../issues')

describe('HED string conversion', () => {
  const hedSchemaFile = 'tests/data/HEDv1.6.10-reduced.xml'
  let mappingPromise

  beforeAll(() => {
    mappingPromise = schema.buildMapping({ path: hedSchemaFile })
  })

  const validatorBase = function(
    testStrings,
    expectedResults,
    expectedIssues,
    testFunction,
  ) {
    return mappingPromise.then(mapping => {
      for (const testStringKey in testStrings) {
        const [testResult, issues] = testFunction(
          mapping,
          testStrings[testStringKey],
        )
        assert.strictEqual(
          testResult,
          expectedResults[testStringKey],
          testStrings[testStringKey],
        )
        assert.sameDeepMembers(
          issues,
          expectedIssues[testStringKey],
          testStrings[testStringKey],
        )
      }
    })
  }

  describe('Short-to-long', () => {
    const validator = function(testStrings, expectedResults, expectedIssues) {
      return validatorBase(
        testStrings,
        expectedResults,
        expectedIssues,
        converter.convertHedStringToLong,
      )
    }

    it('should convert basic HED tags to long form', () => {
      const testStrings = {
        singleLevel: 'Event',
        twoLevel: 'Sensory-event',
        alreadyLong: 'Item/Object/Geometric',
        partialLong: 'Object/Geometric',
        fullShort: 'Geometric',
      }
      const expectedResults = {
        singleLevel: 'Event',
        twoLevel: 'Event/Sensory-event',
        alreadyLong: 'Item/Object/Geometric',
        partialLong: 'Item/Object/Geometric',
        fullShort: 'Item/Object/Geometric',
      }
      const expectedIssues = {
        singleLevel: [],
        twoLevel: [],
        alreadyLong: [],
        partialLong: [],
        fullShort: [],
      }
      return validator(testStrings, expectedResults, expectedIssues)
    })

    it('should convert HED tags with values to long form', () => {
      const testStrings = {
        uniqueValue: 'Environmental-sound/Unique Value',
        multiLevel: 'Environmental-sound/Long Unique Value With/Slash Marks',
        partialPath: 'Sound/Environmental-sound/Unique Value',
      }
      const expectedResults = {
        uniqueValue: 'Item/Sound/Environmental-sound/Unique Value',
        multiLevel:
          'Item/Sound/Environmental-sound/Long Unique Value With/Slash Marks',
        partialPath: 'Item/Sound/Environmental-sound/Unique Value',
      }
      const expectedIssues = {
        uniqueValue: [],
        multiLevel: [],
        partialPath: [],
      }
      return validator(testStrings, expectedResults, expectedIssues)
    })
  })

  describe('Long-to-short', () => {
    const validator = function(testStrings, expectedResults, expectedIssues) {
      return validatorBase(
        testStrings,
        expectedResults,
        expectedIssues,
        converter.convertHedStringToShort,
      )
    }

    it('should convert basic HED tags to short form', () => {
      const testStrings = {
        singleLevel: 'Event',
        twoLevel: 'Event/Sensory-event',
        fullLong: 'Item/Object/Geometric',
        partialShort: 'Object/Geometric',
        alreadyShort: 'Geometric',
      }
      const expectedResults = {
        singleLevel: 'Event',
        twoLevel: 'Sensory-event',
        fullLong: 'Geometric',
        partialShort: 'Geometric',
        alreadyShort: 'Geometric',
      }
      const expectedIssues = {
        singleLevel: [],
        twoLevel: [],
        fullLong: [],
        partialShort: [],
        alreadyShort: [],
      }
      return validator(testStrings, expectedResults, expectedIssues)
    })

    it('should convert HED tags with values to short form', () => {
      const testStrings = {
        uniqueValue: 'Item/Sound/Environmental-sound/Unique Value',
        multiLevel:
          'Item/Sound/Environmental-sound/Long Unique Value With/Slash Marks',
        partialPath: 'Sound/Environmental-sound/Unique Value',
      }
      const expectedResults = {
        uniqueValue: 'Environmental-sound/Unique Value',
        multiLevel: 'Environmental-sound/Long Unique Value With/Slash Marks',
        partialPath: 'Environmental-sound/Unique Value',
      }
      const expectedIssues = {
        uniqueValue: [],
        multiLevel: [],
        partialPath: [],
      }
      return validator(testStrings, expectedResults, expectedIssues)
    })
  })
})

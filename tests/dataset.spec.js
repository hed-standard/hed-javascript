const assert = require('chai').assert
const hed = require('../validator/dataset')
const schema = require('../validator/schema/init')
const generateValidationIssue = require('../common/issues/issues').generateIssue
const generateConverterIssue = require('../converter/issues')

describe('HED dataset validation', () => {
  const hedSchemaFile = 'tests/data/HED8.0.0.xml'
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = schema.buildSchema({ path: hedSchemaFile })
  })

  describe('Basic HED string lists', () => {
    /**
     * Test-validate a dataset.
     *
     * @param {object<string, string[]>} testDatasets The datasets to test.
     * @param {object<string, Issue[]>} expectedIssues The expected issues.
     */
    const validator = function (testDatasets, expectedIssues) {
      return hedSchemaPromise.then((hedSchema) => {
        for (const testDatasetKey in testDatasets) {
          const [, testIssues] = hed.validateHedEvents(
            testDatasets[testDatasetKey],
            hedSchema,
            null,
            true,
          )
          assert.sameDeepMembers(
            testIssues,
            expectedIssues[testDatasetKey],
            testDatasets[testDatasetKey].join(','),
          )
        }
      })
    }

    it('should properly validate simple HED datasets', () => {
      const testDatasets = {
        empty: [],
        singleValidLong: ['Event/Sensory-event'],
        singleValidShort: ['Sensory-event'],
        multipleValidLong: [
          'Event/Sensory-event',
          'Item/Object/Man-made-object/Vehicle/Train',
          'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5',
        ],
        multipleValidShort: ['Sensory-event', 'Train', 'RGB-red/0.5'],
        multipleValidMixed: ['Event/Sensory-event', 'Train', 'RGB-red/0.5'],
        multipleInvalid: ['Duration/0.5 cm', 'InvalidEvent'],
      }
      const legalTimeUnits = ['s', 'second', 'day', 'minute', 'hour']
      const expectedIssues = {
        empty: [],
        singleValidLong: [],
        singleValidShort: [],
        multipleValidLong: [],
        multipleValidShort: [],
        multipleValidMixed: [],
        multipleInvalid: [
          generateValidationIssue('unitClassInvalidUnit', {
            tag: testDatasets.multipleInvalid[0],
            unitClassUnits: legalTimeUnits.sort().join(','),
          }),
          // TODO: Duplication temporary
          generateValidationIssue('invalidTag', {
            tag: testDatasets.multipleInvalid[1],
          }),
          generateConverterIssue(
            'invalidTag',
            testDatasets.multipleInvalid[1],
            {},
            [0, 12],
          ),
        ],
      }
      return validator(testDatasets, expectedIssues)
    })
  })
})

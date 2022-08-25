const assert = require('chai').assert
const hed = require('../validator/dataset')
const { buildSchemas } = require('../validator/schema/init')
const generateValidationIssue = require('../common/issues/issues').generateIssue
const generateConverterIssue = require('../converter/issues')
const { SchemaSpec, SchemasSpec } = require('../common/schema/types')

describe('HED dataset validation', () => {
  const hedSchemaFile = 'tests/data/HED8.0.0.xml'
  let hedSchemaPromise

  beforeAll(() => {
    const spec1 = new SchemaSpec('', '8.0.0', '', hedSchemaFile)
    const specs = new SchemasSpec().addSchemaSpec(spec1)
    hedSchemaPromise = buildSchemas(specs)
  })

  describe('Basic HED string lists', () => {
    /**
     * Test-validate a dataset.
     *
     * @param {Object<string, string[]>} testDatasets The datasets to test.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues.
     */
    const validator = function (testDatasets, expectedIssues) {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        for (const [testDatasetKey, testDataset] of Object.entries(testDatasets)) {
          assert.property(expectedIssues, testDatasetKey, testDatasetKey + ' is not in expectedIssues')
          const [, testIssues] = hed.validateHedEvents(testDataset, hedSchemas, null, true)
          assert.sameDeepMembers(testIssues, expectedIssues[testDatasetKey], testDataset.join(','))
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
          generateConverterIssue('invalidTag', testDatasets.multipleInvalid[1], {}, [0, 12]),
        ],
      }
      return validator(testDatasets, expectedIssues)
    })
  })

  describe('Full HED datasets', () => {
    /**
     * Test-validate a dataset.
     *
     * @param {Object<string, string[]>} testDatasets The datasets to test.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues.
     */
    const validator = function (testDatasets, expectedIssues) {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        for (const [testDatasetKey, testDataset] of Object.entries(testDatasets)) {
          assert.property(expectedIssues, testDatasetKey, testDatasetKey + ' is not in expectedIssues')
          const [, testIssues] = hed.validateHedDataset(testDataset, hedSchemas, true)
          assert.sameDeepMembers(testIssues, expectedIssues[testDatasetKey], testDataset.join(','))
        }
      })
    }

    it('should properly validate HED datasets without definitions', () => {
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
          generateConverterIssue('invalidTag', testDatasets.multipleInvalid[1], {}, [0, 12]),
        ],
      }
      return validator(testDatasets, expectedIssues)
    })

    it('should properly validate HED datasets with definitions', () => {
      const testDatasets = {
        valid: ['(Definition/BlueSquare,(Blue,Square))', '(Definition/RedCircle,(Red,Circle))'],
        equalDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(Definition/BlueSquare,(Blue,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
        nonEqualDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(Definition/BlueSquare,(RGB-blue/1.0,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
        valueDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(Definition/BlueSquare/#,(RGB-blue/#,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
      }
      const expectedIssues = {
        valid: [],
        equalDuplicateDefinition: [],
        nonEqualDuplicateDefinition: [
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(Definition/BlueSquare,(Blue,Square))',
          }),
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(Definition/BlueSquare,(RGB-blue/1.0,Square))',
          }),
        ],
        valueDuplicateDefinition: [
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(Definition/BlueSquare,(Blue,Square))',
          }),
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(Definition/BlueSquare/#,(RGB-blue/#,Square))',
          }),
        ],
      }
      return validator(testDatasets, expectedIssues)
    })
  })
})

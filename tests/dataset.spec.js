import chai from 'chai'
const assert = chai.assert
import * as hed from '../validator/dataset'
import { buildSchemas } from '../validator/schema/init'
import { generateIssue as generateValidationIssue } from '../common/issues/issues'
import generateConverterIssue from '../converter/issues'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'

describe('HED dataset validation', () => {
  const hedSchemaFile = 'tests/data/HED8.2.0.xml'
  const hedLibrarySchemaFile = 'tests/data/HED_testlib_2.0.0.xml'
  let hedSchemaPromise

  beforeAll(() => {
    const spec1 = new SchemaSpec('', '8.2.0', '', hedSchemaFile)
    const spec2 = new SchemaSpec('testlib', '2.0.0', 'testlib', hedLibrarySchemaFile)
    const specs = new SchemasSpec().addSchemaSpec(spec1).addSchemaSpec(spec2)
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
        multipleInvalid: ['Time-value/0.5 cm', 'InvalidEvent'],
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
        multipleInvalid: ['Time-value/0.5 cm', 'InvalidEvent'],
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
        equalPartneredDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(testlib:Definition/BlueSquare,(Blue,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
        nonEqualDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(Definition/BlueSquare,(RGB-blue/1.0,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
        nonEqualPartneredDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(testlib:Definition/BlueSquare,(RGB-blue/1.0,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
        valueDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(Definition/BlueSquare/#,(RGB-blue/#,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
        valuePartneredDuplicateDefinition: [
          '(Definition/BlueSquare,(Blue,Square))',
          '(testlib:Definition/BlueSquare/#,(RGB-blue/#,Square))',
          '(Definition/RedCircle,(Red,Circle))',
        ],
      }
      const expectedIssues = {
        valid: [],
        equalDuplicateDefinition: [],
        equalPartneredDuplicateDefinition: [],
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
        nonEqualPartneredDuplicateDefinition: [
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(Definition/BlueSquare,(Blue,Square))',
          }),
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(testlib:Definition/BlueSquare,(RGB-blue/1.0,Square))',
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
        valuePartneredDuplicateDefinition: [
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(Definition/BlueSquare,(Blue,Square))',
          }),
          generateValidationIssue('duplicateDefinition', {
            definition: 'BlueSquare',
            tagGroup: '(testlib:Definition/BlueSquare/#,(RGB-blue/#,Square))',
          }),
        ],
      }
      return validator(testDatasets, expectedIssues)
    })
  })

  describe('Full HED datasets with context', () => {
    /**
     * Test-validate a dataset.
     *
     * @param {Object<string, string[]>} testDatasets The datasets to test.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues.
     */
    const validator = function (testDatasets, testContext, expectedIssues) {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        for (const [testDatasetKey, testDataset] of Object.entries(testDatasets)) {
          assert.property(expectedIssues, testDatasetKey, testDatasetKey + ' is not in expectedIssues')
          const [, testIssues] = hed.validateHedDatasetWithContext(testDataset, testContext, hedSchemas, true)
          assert.sameDeepMembers(testIssues, expectedIssues[testDatasetKey], testDataset.join(','))
        }
      })
    }

    it('should properly validate onset and offset ordering', () => {
      const testContext = ['(Definition/Acc/#, (Acceleration/#, Red))', '(Definition/MyColor, (Label/Pie))']
      const testDatasets = {
        singleOnsetOffset: ['(Def/MyColor, Onset)', '(Def/MyColor, Offset)', 'Red'],
        singleOnsetInset: ['(Def/MyColor, Onset)', '(Def/MyColor, Inset)', 'Red'],
        singleOnsetInsetOffset: ['(Def/MyColor, Onset)', '(Def/MyColor, Inset)', '(Def/MyColor, Offset)', 'Red'],
        offsetForSameValue: ['(Def/Acc/4.2 m-per-s^2, Onset)', '(Def/Acc/4.2 m-per-s^2, Offset)', 'Red'],
        insetForSameValue: ['(Def/Acc/4.2 m-per-s^2, Onset)', '(Def/Acc/4.2 m-per-s^2, Inset)', 'Red'],
        insetOffsetForSameValue: [
          '(Def/Acc/4.2 m-per-s^2, Onset)',
          '(Def/Acc/4.2 m-per-s^2, Inset)',
          '(Def/Acc/4.2 m-per-s^2, Offset)',
          'Red',
        ],
        repeatedOnsetForNoValue: ['(Def/MyColor, Onset)', '(Def/MyColor, Onset)', 'Red', '(Def/MyColor, Offset)'],
        repeatedOnsetForSameValue: [
          '(Def/Acc/4.2 m-per-s^2, Onset)',
          'Red',
          '(Def/Acc/4.2 m-per-s^2, Onset)',
          '(Def/Acc/4.2 m-per-s^2, Offset)',
        ],
        onsetOffsetForDifferentValues: [
          '(Def/Acc/4.2 m-per-s^2, Onset)',
          '(Def/Acc/5.3 m-per-s^2, Onset)',
          '(Def/Acc/4.2 m-per-s^2, Offset)',
          '(Def/Acc/5.3 m-per-s^2, Offset)',
        ],
        onsetOffsetMixedInsetForDifferentValues: [
          '(Def/Acc/4.2 m-per-s^2, Onset)',
          '(Def/Acc/5.3 m-per-s^2, Onset)',
          '(Def/Acc/4.2 m-per-s^2, Offset)',
          '(Def/Acc/5.3 m-per-s^2, Inset)',
          '(Def/Acc/5.3 m-per-s^2, Offset)',
        ],
        repeatedInset: [
          '(Def/MyColor, Onset)',
          '(Def/MyColor, Inset)',
          '(Def/MyColor, Inset)',
          '(Def/MyColor, Offset)',
          'Red',
        ],
        repeatedOffset: ['(Def/MyColor, Onset)', '(Def/MyColor, Offset)', 'Red', '(Def/MyColor, Offset)'],
        offsetFirst: ['(Def/MyColor, Offset)', '(Def/MyColor, Onset)', 'Red', '(Def/MyColor, Offset)'],
        offsetForDifferentValue: ['(Def/Acc/4.2 m-per-s^2, Onset)', '(Def/Acc/5.3 m-per-s^2, Offset)', 'Red'],
        duplicateTemporal: ['(Def/MyColor, Onset), (Def/MyColor, Offset)', '(Def/MyColor, Offset)', 'Red'],
      }
      const expectedIssues = {
        singleOnsetOffset: [],
        singleOnsetInset: [],
        singleOnsetInsetOffset: [],
        offsetForSameValue: [],
        insetForSameValue: [],
        insetOffsetForSameValue: [],
        repeatedOnsetForNoValue: [],
        repeatedOnsetForSameValue: [],
        onsetOffsetForDifferentValues: [],
        onsetOffsetMixedInsetForDifferentValues: [],
        repeatedInset: [],
        repeatedOffset: [
          generateValidationIssue('inactiveOnset', {
            definition: 'MyColor',
          }),
        ],
        offsetFirst: [
          generateValidationIssue('inactiveOnset', {
            definition: 'MyColor',
          }),
        ],
        offsetForDifferentValue: [
          generateValidationIssue('inactiveOnset', {
            definition: 'Acc/5.3 m-per-s^2',
          }),
        ],
        duplicateTemporal: [
          generateValidationIssue('duplicateTemporal', {
            string: testDatasets.duplicateTemporal[0],
            definition: 'MyColor',
          }),
          generateValidationIssue('inactiveOnset', {
            definition: 'MyColor',
          }),
        ],
      }
      return validator(testDatasets, testContext, expectedIssues)
    })
  })
})

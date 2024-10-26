import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import * as converter from '../converter/converter'
import { generateIssue } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import { buildSchemas } from '../validator/schema/init'

describe('HED string conversion', () => {
  const hedSchemaFile = 'tests/data/HED8.0.0.xml'
  let hedSchemas

  beforeAll(async () => {
    const spec1 = new SchemaSpec('', '8.0.0', '', hedSchemaFile)
    const specs = new SchemasSpec().addSchemaSpec(spec1)
    hedSchemas = await buildSchemas(specs)
  })

  describe('HED tags', () => {
    /**
     * Base validation function.
     *
     * @param {Object<string, string>} testStrings The test strings.
     * @param {Object<string, string>} expectedResults The expected results.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues.
     * @param {function (Schema, string): [string, Issue[]]} testFunction The test function.
     * @returns {Promise}
     */
    const validatorBase = async function (testStrings, expectedResults, expectedIssues, testFunction) {
      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        const [testResult, issues] = testFunction(hedSchemas, testString)
        assert.strictEqual(testResult, expectedResults[testStringKey], testString)
        assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
      }
    }

    describe('Long-to-short', () => {
      const validator = function (testStrings, expectedResults, expectedIssues) {
        return validatorBase(testStrings, expectedResults, expectedIssues, converter.convertHedStringToShort)
      }

      it('should convert basic HED tags to short form', () => {
        const testStrings = {
          singleLevel: 'Event',
          twoLevel: 'Event/Sensory-event',
          fullLong: 'Item/Object/Geometric-object',
          partialShort: 'Object/Geometric-object',
          alreadyShort: 'Geometric-object',
        }
        const expectedResults = {
          singleLevel: 'Event',
          twoLevel: 'Sensory-event',
          fullLong: 'Geometric-object',
          partialShort: 'Geometric-object',
          alreadyShort: 'Geometric-object',
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
          multiLevel: 'Item/Sound/Environmental-sound/Long Unique Value With/Slash Marks',
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

      it('should raise an issue if a "value" is an already valid node', () => {
        const testStrings = {
          singleLevel: 'Item/Sound/Environmental-sound/Event',
          multiLevel: 'Item/Sound/Environmental-sound/Event/Sensory-event',
          mixed: 'Item/Sound/Event/Sensory-event/Environmental-sound',
        }
        const expectedResults = {
          singleLevel: 'Item/Sound/Environmental-sound/Event',
          multiLevel: 'Item/Sound/Environmental-sound/Event/Sensory-event',
          mixed: 'Item/Sound/Event/Sensory-event/Environmental-sound',
        }
        const expectedIssues = {
          singleLevel: [generateIssue('invalidParentNode', { tag: 'Event', parentTag: 'Event' })],
          multiLevel: [generateIssue('invalidParentNode', { tag: 'Event', parentTag: 'Event' })],
          mixed: [generateIssue('invalidParentNode', { tag: 'Event', parentTag: 'Event' })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should convert HED tags with extensions to short form', () => {
        const testStrings = {
          singleLevel: 'Item/Object/extended lvl1',
          multiLevel: 'Item/Object/extended lvl1/Extension2',
          partialPath: 'Object/Man-made-object/Vehicle/Boat/Yacht',
        }
        const expectedResults = {
          singleLevel: 'Object/extended lvl1',
          multiLevel: 'Object/extended lvl1/Extension2',
          partialPath: 'Boat/Yacht',
        }
        const expectedIssues = {
          singleLevel: [],
          multiLevel: [],
          partialPath: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an "extension" is already a valid node', () => {
        const testStrings = {
          validThenInvalid: 'Item/Object/valid extension followed by invalid/Event',
          singleLevel: 'Item/Object/Visual-presentation',
          singleLevelAlreadyShort: 'Object/Visual-presentation',
          twoLevels: 'Item/Object/Visual-presentation/Event',
          duplicate: 'Item/Object/Geometric-object/Item/Object/Geometric-object',
        }
        const expectedResults = {
          validThenInvalid: 'Item/Object/valid extension followed by invalid/Event',
          singleLevel: 'Item/Object/Visual-presentation',
          singleLevelAlreadyShort: 'Object/Visual-presentation',
          twoLevels: 'Item/Object/Visual-presentation/Event',
          duplicate: 'Item/Object/Geometric-object/Item/Object/Geometric-object',
        }
        const expectedIssues = {
          validThenInvalid: [generateIssue('invalidParentNode', { tag: 'Event', parentTag: 'Event' })],
          singleLevel: [
            generateIssue('invalidParentNode', {
              tag: 'Visual-presentation',
              parentTag: 'Property/Sensory-property/Sensory-presentation/Visual-presentation',
            }),
          ],
          singleLevelAlreadyShort: [
            generateIssue('invalidParentNode', {
              tag: 'Visual-presentation',
              parentTag: 'Property/Sensory-property/Sensory-presentation/Visual-presentation',
            }),
          ],
          twoLevels: [
            generateIssue('invalidParentNode', {
              tag: 'Visual-presentation',
              parentTag: 'Property/Sensory-property/Sensory-presentation/Visual-presentation',
            }),
          ],
          duplicate: [generateIssue('invalidParentNode', { tag: 'Item', parentTag: 'Item' })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an invalid node is found', () => {
        const testStrings = {
          invalidParentWithExistingGrandchild: 'InvalidItem/Object/Visual-presentation',
          invalidChildWithExistingGrandchild: 'Event/InvalidEvent/Geometric-object',
          invalidParentWithExistingChild: 'InvalidEvent/Geometric-object',
          invalidSingle: 'InvalidEvent',
          invalidWithExtension: 'InvalidEvent/InvalidExtension',
        }
        const expectedResults = {
          invalidParentWithExistingGrandchild: 'InvalidItem/Object/Visual-presentation',
          invalidChildWithExistingGrandchild: 'Event/InvalidEvent/Geometric-object',
          invalidParentWithExistingChild: 'InvalidEvent/Geometric-object',
          invalidSingle: 'InvalidEvent',
          invalidWithExtension: 'InvalidEvent/InvalidExtension',
        }
        const expectedIssues = {
          invalidParentWithExistingGrandchild: [
            generateIssue('invalidTag', { tag: testStrings.invalidParentWithExistingGrandchild }),
          ],
          invalidChildWithExistingGrandchild: [
            generateIssue('invalidExtension', { tag: 'InvalidEvent', parentTag: 'Event' }),
          ],
          invalidParentWithExistingChild: [
            generateIssue('invalidTag', { tag: testStrings.invalidParentWithExistingChild }),
          ],
          invalidSingle: [generateIssue('invalidTag', { tag: testStrings.invalidSingle })],
          invalidWithExtension: [generateIssue('invalidTag', { tag: testStrings.invalidWithExtension })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should validate whether a node actually allows extensions', () => {
        const testStrings = {
          validTakesValue: 'Property/Agent-property/Agent-trait/Age/15',
          cascadeExtension: 'Property/Agent-property/Agent-state/Agent-emotional-state/Awed/Cascade Extension',
          invalidExtension: 'Event/Agent-action/Good/Time',
        }
        const expectedResults = {
          validTakesValue: 'Age/15',
          cascadeExtension: 'Awed/Cascade Extension',
          invalidExtension: 'Event/Agent-action/Good/Time',
        }
        const expectedIssues = {
          validTakesValue: [],
          cascadeExtension: [],
          invalidExtension: [generateIssue('invalidExtension', { tag: 'Good', parentTag: 'Event/Agent-action' })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should handle leading and trailing spaces correctly', () => {
        const testStrings = {
          leadingSpace: ' Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value ',
        }
        const expectedResults = {
          leadingSpace: 'Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value',
        }
        const expectedIssues = {
          leadingSpace: [],
          trailingSpace: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it.skip('should strip leading and trailing slashes', () => {
        const testStrings = {
          leadingSingle: '/Event',
          leadingExtension: '/Event/Extension',
          leadingMultiLevel: '/Item/Object/Man-made-object/Vehicle/Train',
          leadingMultiLevelExtension: '/Item/Object/Man-made-object/Vehicle/Train/Maglev',
          trailingSingle: 'Event/',
          trailingExtension: 'Event/Extension/',
          trailingMultiLevel: 'Item/Object/Man-made-object/Vehicle/Train/',
          trailingMultiLevelExtension: 'Item/Object/Man-made-object/Vehicle/Train/Maglev/',
          bothSingle: '/Event/',
          bothExtension: '/Event/Extension/',
          bothMultiLevel: '/Item/Object/Man-made-object/Vehicle/Train/',
          bothMultiLevelExtension: '/Item/Object/Man-made-object/Vehicle/Train/Maglev/',
        }
        const expectedResults = {
          leadingSingle: 'Event',
          leadingExtension: 'Event/Extension',
          leadingMultiLevel: 'Train',
          leadingMultiLevelExtension: 'Train/Maglev',
          trailingSingle: 'Event',
          trailingExtension: 'Event/Extension',
          trailingMultiLevel: 'Train',
          trailingMultiLevelExtension: 'Train/Maglev',
          bothSingle: 'Event',
          bothExtension: 'Event/Extension',
          bothMultiLevel: 'Train',
          bothMultiLevelExtension: 'Train/Maglev',
        }
        const expectedIssues = {
          leadingSingle: [],
          leadingExtension: [],
          leadingMultiLevel: [],
          leadingMultiLevelExtension: [],
          trailingSingle: [],
          trailingExtension: [],
          trailingMultiLevel: [],
          trailingMultiLevelExtension: [],
          bothSingle: [],
          bothExtension: [],
          bothMultiLevel: [],
          bothMultiLevelExtension: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })
    })

    describe('Short-to-long', () => {
      const validator = function (testStrings, expectedResults, expectedIssues) {
        return validatorBase(testStrings, expectedResults, expectedIssues, converter.convertHedStringToLong)
      }

      it('should convert basic HED tags to long form', () => {
        const testStrings = {
          singleLevel: 'Event',
          twoLevel: 'Sensory-event',
          alreadyLong: 'Item/Object/Geometric-object',
          partialLong: 'Object/Geometric-object',
          fullShort: 'Geometric-object',
        }
        const expectedResults = {
          singleLevel: 'Event',
          twoLevel: 'Event/Sensory-event',
          alreadyLong: 'Item/Object/Geometric-object',
          partialLong: 'Item/Object/Geometric-object',
          fullShort: 'Item/Object/Geometric-object',
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
          multiLevel: 'Item/Sound/Environmental-sound/Long Unique Value With/Slash Marks',
          partialPath: 'Item/Sound/Environmental-sound/Unique Value',
        }
        const expectedIssues = {
          uniqueValue: [],
          multiLevel: [],
          partialPath: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should convert HED tags with extensions to long form', () => {
        const testStrings = {
          singleLevel: 'Object/extended lvl1',
          multiLevel: 'Object/extended lvl1/Extension2',
          partialPath: 'Vehicle/Boat/Yacht',
        }
        const expectedResults = {
          singleLevel: 'Item/Object/extended lvl1',
          multiLevel: 'Item/Object/extended lvl1/Extension2',
          partialPath: 'Item/Object/Man-made-object/Vehicle/Boat/Yacht',
        }
        const expectedIssues = {
          singleLevel: [],
          multiLevel: [],
          partialPath: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an "extension" is already a valid node', () => {
        const testStrings = {
          validThenInvalid: 'Object/valid extension followed by invalid/Event',
          singleLevel: 'Object/Visual-presentation',
          singleLevelAlreadyLong: 'Item/Object/Visual-presentation',
          twoLevels: 'Object/Visual-presentation/Event',
          partialDuplicate: 'Geometric-object/Item/Object/Geometric-object',
        }
        const expectedResults = {
          validThenInvalid: 'Object/valid extension followed by invalid/Event',
          singleLevel: 'Object/Visual-presentation',
          singleLevelAlreadyLong: 'Item/Object/Visual-presentation',
          twoLevels: 'Object/Visual-presentation/Event',
          partialDuplicate: 'Geometric-object/Item/Object/Geometric-object',
        }
        const expectedIssues = {
          validThenInvalid: [generateIssue('invalidParentNode', { tag: 'Event', parentTag: 'Event' })],
          singleLevel: [
            generateIssue('invalidParentNode', {
              tag: 'Visual-presentation',
              parentTag: 'Property/Sensory-property/Sensory-presentation/Visual-presentation',
            }),
          ],
          singleLevelAlreadyLong: [
            generateIssue('invalidParentNode', {
              tag: 'Visual-presentation',
              parentTag: 'Property/Sensory-property/Sensory-presentation/Visual-presentation',
            }),
          ],
          twoLevels: [
            generateIssue('invalidParentNode', {
              tag: 'Visual-presentation',
              parentTag: 'Property/Sensory-property/Sensory-presentation/Visual-presentation',
            }),
          ],
          partialDuplicate: [generateIssue('invalidParentNode', { tag: 'Item', parentTag: 'Item' })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an invalid node is found', () => {
        const testStrings = {
          single: 'InvalidEvent',
          invalidChild: 'InvalidEvent/InvalidExtension',
          validChild: 'InvalidEvent/Event',
        }
        const expectedResults = {
          single: 'InvalidEvent',
          invalidChild: 'InvalidEvent/InvalidExtension',
          validChild: 'InvalidEvent/Event',
        }
        const expectedIssues = {
          single: [generateIssue('invalidTag', { tag: testStrings.single })],
          invalidChild: [generateIssue('invalidTag', { tag: testStrings.invalidChild })],
          validChild: [generateIssue('invalidTag', { tag: testStrings.validChild })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should validate whether a node actually allows extensions', () => {
        const testStrings = {
          validTakesValue: 'Age/15',
          cascadeExtension: 'Awed/Cascade Extension',
          invalidExtension: 'Agent-action/Good/Time',
        }
        const expectedResults = {
          validTakesValue: 'Property/Agent-property/Agent-trait/Age/15',
          cascadeExtension: 'Property/Agent-property/Agent-state/Agent-emotional-state/Awed/Cascade Extension',
          invalidExtension: 'Agent-action/Good/Time',
        }
        const expectedIssues = {
          validTakesValue: [],
          cascadeExtension: [],
          invalidExtension: [generateIssue('invalidExtension', { tag: 'Good', parentTag: 'Event/Agent-action' })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should handle leading and trailing spaces correctly', () => {
        const testStrings = {
          leadingSpace: ' Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value ',
        }
        const expectedResults = {
          leadingSpace: 'Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value',
        }
        const expectedIssues = {
          leadingSpace: [],
          trailingSpace: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it.skip('should strip leading and trailing slashes', () => {
        const testStrings = {
          leadingSingle: '/Event',
          leadingExtension: '/Event/Extension',
          leadingMultiLevel: '/Vehicle/Train',
          leadingMultiLevelExtension: '/Vehicle/Train/Maglev',
          trailingSingle: 'Event/',
          trailingExtension: 'Event/Extension/',
          trailingMultiLevel: 'Vehicle/Train/',
          trailingMultiLevelExtension: 'Vehicle/Train/Maglev/',
          bothSingle: '/Event/',
          bothExtension: '/Event/Extension/',
          bothMultiLevel: '/Vehicle/Train/',
          bothMultiLevelExtension: '/Vehicle/Train/Maglev/',
        }
        const expectedResults = {
          leadingSingle: 'Event',
          leadingExtension: 'Event/Extension',
          leadingMultiLevel: 'Item/Object/Man-made-object/Vehicle/Train',
          leadingMultiLevelExtension: 'Item/Object/Man-made-object/Vehicle/Train/Maglev',
          trailingSingle: 'Event',
          trailingExtension: 'Event/Extension',
          trailingMultiLevel: 'Item/Object/Man-made-object/Vehicle/Train',
          trailingMultiLevelExtension: 'Item/Object/Man-made-object/Vehicle/Train/Maglev',
          bothSingle: 'Event',
          bothExtension: 'Event/Extension',
          bothMultiLevel: 'Item/Object/Man-made-object/Vehicle/Train',
          bothMultiLevelExtension: 'Item/Object/Man-made-object/Vehicle/Train/Maglev',
        }
        const expectedIssues = {
          leadingSingle: [],
          leadingExtension: [],
          leadingMultiLevel: [],
          leadingMultiLevelExtension: [],
          trailingSingle: [],
          trailingExtension: [],
          trailingMultiLevel: [],
          trailingMultiLevelExtension: [],
          bothSingle: [],
          bothExtension: [],
          bothMultiLevel: [],
          bothMultiLevelExtension: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should properly handle node names in value-taking strings', () => {
        const testStrings = {
          valueTaking: 'Label/Red',
          nonValueTaking: 'Train/Car',
          definitionName: 'Definition/Blue',
          definitionNameWithPlaceholder: 'Definition/BlueCircle/#',
          definitionNameWithNodeValue: 'Definition/BlueSquare/SteelBlue',
          definitionNodeNameWithValue: 'Definition/Blue/Cobalt',
        }
        const expectedResults = {
          valueTaking: 'Property/Informational-property/Label/Red',
          nonValueTaking: 'Train/Car',
          definitionName: 'Property/Organizational-property/Definition/Blue',
          definitionNameWithPlaceholder: 'Property/Organizational-property/Definition/BlueCircle/#',
          definitionNameWithNodeValue: 'Property/Organizational-property/Definition/BlueSquare/SteelBlue',
          definitionNodeNameWithValue: 'Property/Organizational-property/Definition/Blue/Cobalt',
        }
        const expectedIssues = {
          valueTaking: [],
          nonValueTaking: [
            generateIssue('invalidParentNode', { tag: 'Car', parentTag: 'Item/Object/Man-made-object/Vehicle/Car' }),
          ],
          definitionName: [], // To be caught in validation.
          definitionNameWithPlaceholder: [],
          definitionNameWithNodeValue: [],
          definitionNodeNameWithValue: [], // To be caught in validation.
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })
    })
  })

  describe('HED strings', () => {
    /**
     * Base validation function.
     *
     * @param {Object<string, string>} testStrings The test strings.
     * @param {Object<string, string>} expectedResults The expected results.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues.
     * @param {function (Schemas, string): [string, Issue[]]} testFunction The test function.
     * @returns {Promise<void>}
     */
    const validatorBase = async function (testStrings, expectedResults, expectedIssues, testFunction) {
      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        const [testResult, issues] = testFunction(hedSchemas, testString)
        assert.strictEqual(testResult, expectedResults[testStringKey], testString)
        assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
      }
    }

    describe('Long-to-short', () => {
      const validator = function (testStrings, expectedResults, expectedIssues) {
        return validatorBase(testStrings, expectedResults, expectedIssues, converter.convertHedStringToShort)
      }

      it('should properly convert HED strings to short form', () => {
        const testStrings = {
          singleLevel: 'Event',
          multiLevel: 'Event/Sensory-event',
          twoSingle: 'Event, Property',
          oneExtension: 'Item/Extension',
          threeMulti:
            'Event/Sensory-event, Item/Object/Man-made-object/Vehicle/Train, Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5',
          simpleGroup:
            '(Item/Object/Man-made-object/Vehicle/Train, Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5)',
          groupAndTag:
            '(Item/Object/Man-made-object/Vehicle/Train, Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5), Item/Object/Man-made-object/Vehicle/Car',
        }
        const expectedResults = {
          singleLevel: 'Event',
          multiLevel: 'Sensory-event',
          twoSingle: 'Event, Property',
          oneExtension: 'Item/Extension',
          threeMulti: 'Sensory-event, Train, RGB-red/0.5',
          simpleGroup: '(Train, RGB-red/0.5)',
          groupAndTag: '(Train, RGB-red/0.5), Car',
        }
        const expectedIssues = {
          singleLevel: [],
          multiLevel: [],
          twoSingle: [],
          oneExtension: [],
          threeMulti: [],
          simpleGroup: [],
          groupAndTag: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an invalid node is found', () => {
        const single = 'InvalidEvent'
        const double = 'InvalidEvent/InvalidExtension'
        const testStrings = {
          single: single,
          double: double,
          both: single + ', ' + double,
          singleWithTwoValid: 'Property, ' + single + ', Event',
          doubleWithValid: double + ', Item/Object/Man-made-object/Vehicle/Car/Minivan',
        }
        const expectedResults = {
          single: single,
          double: double,
          both: single + ', ' + double,
          singleWithTwoValid: 'Property, ' + single + ', Event',
          doubleWithValid: double + ', Item/Object/Man-made-object/Vehicle/Car/Minivan',
        }
        const expectedIssues = {
          single: [generateIssue('invalidTag', { tag: single })],
          double: [generateIssue('invalidTag', { tag: double })],
          both: [generateIssue('invalidTag', { tag: single }), generateIssue('invalidTag', { tag: double })],
          singleWithTwoValid: [generateIssue('invalidTag', { tag: single })],
          doubleWithValid: [generateIssue('invalidTag', { tag: double })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should ignore leading and trailing spaces', () => {
        const testStrings = {
          leadingSpace: ' Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value ',
          bothSpace: ' Item/Sound/Environmental-sound/Unique Value ',
          leadingSpaceTwo: ' Item/Sound/Environmental-sound/Unique Value, Event',
          trailingSpaceTwo: 'Event, Item/Sound/Environmental-sound/Unique Value ',
          bothSpaceTwo: ' Event, Item/Sound/Environmental-sound/Unique Value ',
        }
        const expectedResults = {
          leadingSpace: 'Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value',
          bothSpace: 'Environmental-sound/Unique Value',
          leadingSpaceTwo: 'Environmental-sound/Unique Value, Event',
          trailingSpaceTwo: 'Event, Environmental-sound/Unique Value',
          bothSpaceTwo: 'Event, Environmental-sound/Unique Value',
        }
        const expectedIssues = {
          leadingSpace: [],
          trailingSpace: [],
          bothSpace: [],
          leadingSpaceTwo: [],
          trailingSpaceTwo: [],
          bothSpaceTwo: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should detect bad leading and trailing slashes', () => {
        const testStrings = {
          leadingSingle: '/Event',
          leadingMultiLevel: '/Item/Object/Man-made-object/Vehicle/Train',
          trailingSingle: 'Event/',
          trailingMultiLevel: 'Item/Object/Man-made-object/Vehicle/Train/',
          bothSingle: '/Event/',
          bothMultiLevel: '/Item/Object/Man-made-object/Vehicle/Train/',
          twoMixedOuter: '/Event,Item/Object/Man-made-object/Vehicle/Train/',
          //twoMixedInner: 'Event/,/Item/Object/Man-made-object/Vehicle/Train',
          twoMixedBoth: '/Event/,/Item/Object/Man-made-object/Vehicle/Train/',
          twoMixedBothGroup: '(/Event/,/Item/Object/Man-made-object/Vehicle/)',
        }
        const expectedResults = testStrings
        const expectedIssues = {
          leadingSingle: [generateIssue('extraSlash', { index: 0, string: testStrings.leadingSingle })],
          leadingMultiLevel: [generateIssue('extraSlash', { index: 0, string: testStrings.leadingMultiLevel })],
          trailingSingle: [generateIssue('extraSlash', { index: 5, string: testStrings.trailingSingle })],
          trailingMultiLevel: [generateIssue('extraSlash', { index: 41, string: testStrings.trailingMultiLevel })],
          bothSingle: [generateIssue('extraSlash', { index: 0, string: testStrings.bothSingle })],
          bothMultiLevel: [generateIssue('extraSlash', { index: 0, string: testStrings.bothMultiLevel })],
          twoMixedOuter: [generateIssue('extraSlash', { index: 0, string: testStrings.twoMixedOuter })],
          // twoMixedInner: [
          //   generateIssue('extraSlash', { index: 7, string: testStrings.twoMixedOuter })],
          // //   generateIssue('invalidTag', { tag: '/Item/Object/Man-made-object/Vehicle/Train' }),
          // // ],
          twoMixedBoth: [generateIssue('extraSlash', { index: 0, string: testStrings.twoMixedBoth })],
          twoMixedBothGroup: [generateIssue('extraSlash', { index: 1, string: testStrings.twoMixedBothGroup })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should replace extra spaces and slashes with single slashes', () => {
        const testStrings = {
          twoLevelDoubleSlash: 'Item//Extension',
          threeLevelDoubleSlash: 'Item//Object//Geometric-object',
          tripleSlashes: 'Item///Object///Geometric-object',
          mixedSingleAndDoubleSlashes: 'Item///Object/Geometric-object',
          singleSlashWithSpace: 'Item/ Extension',
          doubleSlashSurroundingSpace: 'Item/ /Extension',
          doubleSlashThenSpace: 'Item// Extension',
          sosPattern: 'Item///   ///Extension',
          alternatingSlashSpace: 'Item/ / Object/ / Geometric-object',
          leadingDoubleSlash: '//Item/Extension',
          trailingDoubleSlash: 'Item/Extension//',
          leadingDoubleSlashWithSpace: '/ /Item/Extension',
          trailingDoubleSlashWithSpace: 'Item/Extension/ /',
        }
        const expectedResults = testStrings
        const expectedIssues = {
          twoLevelDoubleSlash: [generateIssue('extraSlash', { index: 5, string: testStrings.twoLevelDoubleSlash })],
          threeLevelDoubleSlash: [generateIssue('extraSlash', { index: 5, string: testStrings.threeLevelDoubleSlash })],
          tripleSlashes: [generateIssue('extraSlash', { index: 5, string: testStrings.tripleSlashes })],
          mixedSingleAndDoubleSlashes: [
            generateIssue('extraSlash', { index: 5, string: testStrings.mixedSingleAndDoubleSlashes }),
          ],
          singleSlashWithSpace: [generateIssue('extraBlank', { index: 5, string: testStrings.singleSlashWithSpace })],
          doubleSlashSurroundingSpace: [
            generateIssue('extraBlank', { index: 5, string: testStrings.doubleSlashSurroundingSpace }),
          ],
          doubleSlashThenSpace: [generateIssue('extraSlash', { index: 5, string: testStrings.doubleSlashThenSpace })],
          sosPattern: [generateIssue('extraSlash', { index: 5, string: testStrings.sosPattern })],
          alternatingSlashSpace: [generateIssue('extraBlank', { index: 5, string: testStrings.alternatingSlashSpace })],
          leadingDoubleSlash: [generateIssue('extraSlash', { index: 0, string: testStrings.leadingDoubleSlash })],
          trailingDoubleSlash: [generateIssue('extraSlash', { index: 15, string: testStrings.trailingDoubleSlash })],
          leadingDoubleSlashWithSpace: [
            generateIssue('extraSlash', { index: 0, string: testStrings.leadingDoubleSlashWithSpace }),
          ],
          trailingDoubleSlashWithSpace: [
            generateIssue('extraBlank', { index: 15, string: testStrings.trailingDoubleSlashWithSpace }),
          ],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })
    })

    describe('Short-to-long', () => {
      const validator = function (testStrings, expectedResults, expectedIssues) {
        return validatorBase(testStrings, expectedResults, expectedIssues, converter.convertHedStringToLong)
      }

      it('should properly convert HED strings to long form', () => {
        const testStrings = {
          singleLevel: 'Event',
          multiLevel: 'Sensory-event',
          twoSingle: 'Event, Property',
          oneExtension: 'Item/Extension',
          threeMulti: 'Sensory-event, Train, RGB-red/0.5',
          simpleGroup: '(Train, RGB-red/0.5)',
          groupAndTag: '(Train, RGB-red/0.5), Car',
        }
        const expectedResults = {
          singleLevel: 'Event',
          multiLevel: 'Event/Sensory-event',
          twoSingle: 'Event, Property',
          oneExtension: 'Item/Extension',
          threeMulti:
            'Event/Sensory-event, Item/Object/Man-made-object/Vehicle/Train, Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5',
          simpleGroup:
            '(Item/Object/Man-made-object/Vehicle/Train, Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5)',
          groupAndTag:
            '(Item/Object/Man-made-object/Vehicle/Train, Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5), Item/Object/Man-made-object/Vehicle/Car',
        }
        const expectedIssues = {
          singleLevel: [],
          multiLevel: [],
          twoSingle: [],
          oneExtension: [],
          threeMulti: [],
          simpleGroup: [],
          groupAndTag: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an invalid node is found', () => {
        const single = 'InvalidEvent'
        const double = 'InvalidEvent/InvalidExtension'
        const testStrings = {
          single: single,
          double: double,
          both: single + ', ' + double,
          singleWithTwoValid: 'Property, ' + single + ', Event',
          doubleWithValid: double + ', Car/Minivan',
        }
        const expectedResults = {
          single: single,
          double: double,
          both: single + ', ' + double,
          singleWithTwoValid: 'Property, ' + single + ', Event',
          doubleWithValid: double + ', Car/Minivan',
        }
        const expectedIssues = {
          single: [generateIssue('invalidTag', { tag: single })],
          double: [generateIssue('invalidTag', { tag: double })],
          both: [generateIssue('invalidTag', { tag: single }), generateIssue('invalidTag', { tag: double })],
          singleWithTwoValid: [generateIssue('invalidTag', { tag: single })],
          doubleWithValid: [generateIssue('invalidTag', { tag: double })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should ignore leading and trailing spaces', () => {
        const testStrings = {
          leadingSpace: ' Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value ',
          bothSpace: ' Environmental-sound/Unique Value ',
          leadingSpaceTwo: ' Environmental-sound/Unique Value, Event',
          trailingSpaceTwo: 'Event, Environmental-sound/Unique Value ',
          bothSpaceTwo: ' Event, Environmental-sound/Unique Value ',
        }
        const expectedResults = {
          leadingSpace: 'Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value',
          bothSpace: 'Item/Sound/Environmental-sound/Unique Value',
          leadingSpaceTwo: 'Item/Sound/Environmental-sound/Unique Value, Event',
          trailingSpaceTwo: 'Event, Item/Sound/Environmental-sound/Unique Value',
          bothSpaceTwo: 'Event, Item/Sound/Environmental-sound/Unique Value',
        }
        const expectedIssues = {
          leadingSpace: [],
          trailingSpace: [],
          bothSpace: [],
          leadingSpaceTwo: [],
          trailingSpaceTwo: [],
          bothSpaceTwo: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if there are extra slashes', () => {
        const testStrings = {
          leadingSingle: '/Event',
          leadingMultiLevel: '/Vehicle/Train',
          trailingSingle: 'Event/',
          trailingMultiLevel: 'Vehicle/Train/',
          bothSingle: '/Event/',
          bothMultiLevel: '/Vehicle/Train/',
          twoMixedOuter: '/Event,Vehicle/Train/',
          //twoMixedInner: 'Event/,/Vehicle/Train',
          twoMixedBoth: '/Event/,/Vehicle/Train/',
          twoMixedBothGroup: '(/Event/,/Vehicle/Train/)',
        }
        const expectedResults = testStrings
        const expectedIssues = {
          leadingSingle: [generateIssue('extraSlash', { index: 0, string: testStrings.leadingSingle })],
          leadingMultiLevel: [generateIssue('extraSlash', { index: 0, string: testStrings.leadingMultiLevel })],
          trailingSingle: [generateIssue('extraSlash', { index: 5, string: testStrings.trailingSingle })],
          trailingMultiLevel: [generateIssue('extraSlash', { index: 13, string: testStrings.trailingMultiLevel })],
          bothSingle: [generateIssue('extraSlash', { index: 0, string: testStrings.bothSingle })],
          bothMultiLevel: [generateIssue('extraSlash', { index: 0, string: testStrings.bothMultiLevel })],
          twoMixedOuter: [generateIssue('extraSlash', { index: 0, string: testStrings.twoMixedOuter })],
          twoMixedInner: [generateIssue('extraSlash', { index: 0, string: testStrings.twoMixedOuter })],
          twoMixedBoth: [generateIssue('extraSlash', { index: 0, string: testStrings.twoMixedBoth })],
          twoMixedBothGroup: [generateIssue('extraSlash', { index: 1, string: testStrings.twoMixedBothGroup })],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it.skip('should replace extra spaces and slashes with single slashes', () => {
        const testStrings = {
          twoLevelDoubleSlash: 'Event//Extension',
          threeLevelDoubleSlash: 'Vehicle//Boat//Tanker',
          tripleSlashes: 'Vehicle///Boat///Tanker',
          mixedSingleAndDoubleSlashes: 'Vehicle///Boat/Tanker',
          singleSlashWithSpace: 'Event/ Extension',
          doubleSlashSurroundingSpace: 'Event/ /Extension',
          doubleSlashThenSpace: 'Event// Extension',
          sosPattern: 'Event///   ///Extension',
          alternatingSlashSpace: 'Vehicle/ / Boat/ / Tanker',
          leadingDoubleSlash: '//Event/Extension',
          trailingDoubleSlash: 'Event/Extension//',
          leadingDoubleSlashWithSpace: '/ /Event/Extension',
          trailingDoubleSlashWithSpace: 'Event/Extension/ /',
        }
        const expectedEventExtension = 'Event/Extension'
        const expectedTanker = 'Item/Object/Man-made-object/Vehicle/Boat/Tanker'
        const expectedResults = {
          twoLevelDoubleSlash: expectedEventExtension,
          threeLevelDoubleSlash: expectedTanker,
          tripleSlashes: expectedTanker,
          mixedSingleAndDoubleSlashes: expectedTanker,
          singleSlashWithSpace: expectedEventExtension,
          doubleSlashSurroundingSpace: expectedEventExtension,
          doubleSlashThenSpace: expectedEventExtension,
          sosPattern: expectedEventExtension,
          alternatingSlashSpace: expectedTanker,
          leadingDoubleSlash: expectedEventExtension,
          trailingDoubleSlash: expectedEventExtension,
          leadingDoubleSlashWithSpace: expectedEventExtension,
          trailingDoubleSlashWithSpace: expectedEventExtension,
        }
        const expectedIssues = {
          twoLevelDoubleSlash: [],
          threeLevelDoubleSlash: [],
          tripleSlashes: [],
          mixedSingleAndDoubleSlashes: [],
          singleSlashWithSpace: [],
          doubleSlashSurroundingSpace: [],
          doubleSlashThenSpace: [],
          sosPattern: [],
          alternatingSlashSpace: [],
          leadingDoubleSlash: [],
          trailingDoubleSlash: [],
          leadingDoubleSlashWithSpace: [],
          trailingDoubleSlashWithSpace: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })
    })
  })
})

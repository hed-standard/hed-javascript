import chai from 'chai'
const assert = chai.assert
import * as converter from '../converter'
import generateIssue from '../issues'
import { SchemaSpec, SchemasSpec } from '../../common/schema/types'
import { buildSchemas } from '../../validator/schema/init'

describe('HED string conversion', () => {
  const hedSchemaFile = 'tests/data/HED8.0.0.xml'
  let hedSchemaPromise

  beforeAll(() => {
    const spec1 = new SchemaSpec('', '8.0.0', '', hedSchemaFile)
    const specs = new SchemasSpec().addSchemaSpec(spec1)
    hedSchemaPromise = buildSchemas(specs)
  })

  describe('HED tags', () => {
    /**
     * Base validation function.
     *
     * @param {Object<string, string>} testStrings The test strings.
     * @param {Object<string, string>} expectedResults The expected results.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues.
     * @param {function (Schema, string, string, number): [string, Issue[]]} testFunction The test function.
     * @returns {Promise<void>}
     */
    const validatorBase = async function (testStrings, expectedResults, expectedIssues, testFunction) {
      const hedSchemas = await hedSchemaPromise
      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        const [testResult, issues] = testFunction(hedSchemas.baseSchema, testString, testString, 0)
        assert.strictEqual(testResult, expectedResults[testStringKey], testString)
        assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
      }
    }

    describe('Long-to-short', () => {
      const validator = function (testStrings, expectedResults, expectedIssues) {
        return validatorBase(testStrings, expectedResults, expectedIssues, converter.convertTagToShort)
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
          singleLevel: [generateIssue('invalidParentNode', testStrings.singleLevel, { parentTag: 'Event' }, [31, 36])],
          multiLevel: [
            generateIssue('invalidParentNode', testStrings.multiLevel, { parentTag: 'Event/Sensory-event' }, [37, 50]),
          ],
          mixed: [
            generateIssue(
              'invalidParentNode',
              testStrings.mixed,
              { parentTag: 'Item/Sound/Environmental-sound' },
              [31, 50],
            ),
          ],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should convert HED tags with extensions to short form', () => {
        const testStrings = {
          singleLevel: 'Event/Experiment-control/extended lvl1',
          multiLevel: 'Event/Experiment-control/extended lvl1/Extension2',
          partialPath: 'Object/Man-made-object/Vehicle/Boat/Yacht',
        }
        const expectedResults = {
          singleLevel: 'Experiment-control/extended lvl1',
          multiLevel: 'Experiment-control/extended lvl1/Extension2',
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
          validThenInvalid: 'Event/Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Event/Experiment-control/Geometric-object',
          singleLevelAlreadyShort: 'Experiment-control/Geometric-object',
          twoLevels: 'Event/Experiment-control/Geometric-object/Event',
          duplicate: 'Item/Object/Geometric-object/Item/Object/Geometric-object',
        }
        const expectedResults = {
          validThenInvalid: 'Event/Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Event/Experiment-control/Geometric-object',
          singleLevelAlreadyShort: 'Experiment-control/Geometric-object',
          twoLevels: 'Event/Experiment-control/Geometric-object/Event',
          duplicate: 'Item/Object/Geometric-object/Item/Object/Geometric-object',
        }
        const expectedIssues = {
          validThenInvalid: [
            generateIssue('invalidParentNode', testStrings.validThenInvalid, { parentTag: 'Event' }, [61, 66]),
          ],
          singleLevel: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevel,
              { parentTag: 'Item/Object/Geometric-object' },
              [25, 41],
            ),
          ],
          singleLevelAlreadyShort: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevelAlreadyShort,
              { parentTag: 'Item/Object/Geometric-object' },
              [19, 35],
            ),
          ],
          twoLevels: [generateIssue('invalidParentNode', testStrings.twoLevels, { parentTag: 'Event' }, [42, 47])],
          duplicate: [
            generateIssue(
              'invalidParentNode',
              testStrings.duplicate,
              { parentTag: 'Item/Object/Geometric-object' },
              [41, 57],
            ),
          ],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an invalid node is found', () => {
        const testStrings = {
          invalidParentWithExistingGrandchild: 'InvalidEvent/Experiment-control/Geometric-object',
          invalidChildWithExistingGrandchild: 'Event/InvalidEvent/Geometric-object',
          invalidParentWithExistingChild: 'InvalidEvent/Geometric-object',
          invalidSingle: 'InvalidEvent',
          invalidWithExtension: 'InvalidEvent/InvalidExtension',
        }
        const expectedResults = {
          invalidParentWithExistingGrandchild: 'InvalidEvent/Experiment-control/Geometric-object',
          invalidChildWithExistingGrandchild: 'Event/InvalidEvent/Geometric-object',
          invalidParentWithExistingChild: 'InvalidEvent/Geometric-object',
          invalidSingle: 'InvalidEvent',
          invalidWithExtension: 'InvalidEvent/InvalidExtension',
        }
        const expectedIssues = {
          invalidParentWithExistingGrandchild: [
            generateIssue(
              'invalidParentNode',
              testStrings.invalidParentWithExistingGrandchild,
              { parentTag: 'Item/Object/Geometric-object' },
              [32, 48],
            ),
          ],
          invalidChildWithExistingGrandchild: [
            generateIssue(
              'invalidParentNode',
              testStrings.invalidChildWithExistingGrandchild,
              { parentTag: 'Item/Object/Geometric-object' },
              [19, 35],
            ),
          ],
          invalidParentWithExistingChild: [
            generateIssue(
              'invalidParentNode',
              testStrings.invalidParentWithExistingChild,
              { parentTag: 'Item/Object/Geometric-object' },
              [13, 29],
            ),
          ],
          invalidSingle: [generateIssue('invalidTag', testStrings.invalidSingle, {}, [0, 12])],
          invalidWithExtension: [generateIssue('invalidTag', testStrings.invalidWithExtension, {}, [0, 12])],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should not validate whether a node actually allows extensions', () => {
        const testStrings = {
          validTakesValue: 'Property/Agent-property/Agent-trait/Age/15',
          cascadeExtension: 'Property/Agent-property/Agent-state/Agent-emotional-state/Awed/Cascade Extension',
          invalidExtension: 'Event/Agent-action/Good/Time',
        }
        const expectedResults = {
          validTakesValue: 'Age/15',
          cascadeExtension: 'Awed/Cascade Extension',
          invalidExtension: 'Agent-action/Good/Time',
        }
        const expectedIssues = {
          validTakesValue: [],
          cascadeExtension: [],
          invalidExtension: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should handle leading and trailing spaces correctly', () => {
        const testStrings = {
          leadingSpace: ' Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value ',
        }
        const expectedResults = {
          leadingSpace: ' Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value ',
        }
        const expectedIssues = {
          leadingSpace: [
            generateIssue(
              'invalidParentNode',
              testStrings.leadingSpace,
              { parentTag: 'Item/Sound/Environmental-sound' },
              [12, 31],
            ),
          ],
          trailingSpace: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should strip leading and trailing slashes', () => {
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
        return validatorBase(testStrings, expectedResults, expectedIssues, converter.convertTagToLong)
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
          singleLevel: 'Experiment-control/extended lvl1',
          multiLevel: 'Experiment-control/extended lvl1/Extension2',
          partialPath: 'Vehicle/Boat/Yacht',
        }
        const expectedResults = {
          singleLevel: 'Event/Experiment-control/extended lvl1',
          multiLevel: 'Event/Experiment-control/extended lvl1/Extension2',
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
          validThenInvalid: 'Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Experiment-control/Geometric-object',
          singleLevelAlreadyLong: 'Event/Experiment-control/Geometric-object',
          twoLevels: 'Experiment-control/Geometric-object/Event',
          partialDuplicate: 'Geometric-object/Item/Object/Geometric-object',
        }
        const expectedResults = {
          validThenInvalid: 'Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Experiment-control/Geometric-object',
          singleLevelAlreadyLong: 'Event/Experiment-control/Geometric-object',
          twoLevels: 'Experiment-control/Geometric-object/Event',
          partialDuplicate: 'Geometric-object/Item/Object/Geometric-object',
        }
        const expectedIssues = {
          validThenInvalid: [
            generateIssue('invalidParentNode', testStrings.validThenInvalid, { parentTag: 'Event' }, [55, 60]),
          ],
          singleLevel: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevel,
              { parentTag: 'Item/Object/Geometric-object' },
              [19, 35],
            ),
          ],
          singleLevelAlreadyLong: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevelAlreadyLong,
              { parentTag: 'Item/Object/Geometric-object' },
              [25, 41],
            ),
          ],
          twoLevels: [
            generateIssue(
              'invalidParentNode',
              testStrings.twoLevels,
              { parentTag: 'Item/Object/Geometric-object' },
              [19, 35],
            ),
          ],
          partialDuplicate: [
            generateIssue('invalidParentNode', testStrings.partialDuplicate, { parentTag: 'Item' }, [17, 21]),
          ],
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
          single: [generateIssue('invalidTag', testStrings.single, {}, [0, 12])],
          invalidChild: [generateIssue('invalidTag', testStrings.invalidChild, {}, [0, 12])],
          validChild: [generateIssue('invalidTag', testStrings.validChild, {}, [0, 12])],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should not validate whether a node actually allows extensions', () => {
        const testStrings = {
          validTakesValue: 'Age/15',
          cascadeExtension: 'Awed/Cascade Extension',
          invalidExtension: 'Agent-action/Good/Time',
        }
        const expectedResults = {
          validTakesValue: 'Property/Agent-property/Agent-trait/Age/15',
          cascadeExtension: 'Property/Agent-property/Agent-state/Agent-emotional-state/Awed/Cascade Extension',
          invalidExtension: 'Event/Agent-action/Good/Time',
        }
        const expectedIssues = {
          validTakesValue: [],
          cascadeExtension: [],
          invalidExtension: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should handle leading and trailing spaces correctly', () => {
        const testStrings = {
          leadingSpace: ' Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value ',
        }
        const expectedResults = {
          leadingSpace: ' Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value ',
        }
        const expectedIssues = {
          leadingSpace: [generateIssue('invalidTag', testStrings.leadingSpace, {}, [0, 20])],
          trailingSpace: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should strip leading and trailing slashes', () => {
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

      it.skip('should properly handle node names in value-taking strings', () => {
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
          definitionNodeNameWithValue: 'Definition/Blue/Cobalt',
        }
        const expectedIssues = {
          valueTaking: [],
          nonValueTaking: [
            generateIssue(
              'invalidParentNode',
              testStrings.nonValueTaking,
              { parentTag: 'Item/Object/Man-made-object/Vehicle/Car' },
              [6, 9],
            ),
          ],
          definitionName: [], // To be caught in validation.
          definitionNameWithPlaceholder: [],
          definitionNameWithNodeValue: [],
          definitionNodeNameWithValue: [
            generateIssue(
              'invalidParentNode',
              testStrings.definitionNodeNameWithValue,
              {
                parentTag:
                  'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/CSS-color/Blue-color/Blue',
              },
              [11, 15],
            ),
          ],
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
      const hedSchemas = await hedSchemaPromise
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
          oneExtension: 'Event/Extension',
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
          oneExtension: 'Event/Extension',
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
          doubleWithValid: double + ', Car/Minivan',
        }
        const expectedIssues = {
          single: [generateIssue('invalidTag', single, {}, [0, 12])],
          double: [generateIssue('invalidTag', double, {}, [0, 12])],
          both: [
            generateIssue('invalidTag', testStrings.both, {}, [0, 12]),
            generateIssue('invalidTag', testStrings.both, {}, [14, 26]),
          ],
          singleWithTwoValid: [generateIssue('invalidTag', testStrings.singleWithTwoValid, {}, [10, 22])],
          doubleWithValid: [generateIssue('invalidTag', testStrings.doubleWithValid, {}, [0, 12])],
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
          leadingSpace: ' Environmental-sound/Unique Value',
          trailingSpace: 'Environmental-sound/Unique Value ',
          bothSpace: ' Environmental-sound/Unique Value ',
          leadingSpaceTwo: ' Environmental-sound/Unique Value, Event',
          trailingSpaceTwo: 'Event, Environmental-sound/Unique Value ',
          bothSpaceTwo: ' Event, Environmental-sound/Unique Value ',
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

      it('should strip leading and trailing slashes', () => {
        const testStrings = {
          leadingSingle: '/Event',
          leadingMultiLevel: '/Object/Man-made-object/Vehicle/Train',
          trailingSingle: 'Event/',
          trailingMultiLevel: 'Object/Man-made-object/Vehicle/Train/',
          bothSingle: '/Event/',
          bothMultiLevel: '/Object/Man-made-object/Vehicle/Train/',
          twoMixedOuter: '/Event,Object/Man-made-object/Vehicle/Train/',
          twoMixedInner: 'Event/,/Object/Man-made-object/Vehicle/Train',
          twoMixedBoth: '/Event/,/Object/Man-made-object/Vehicle/Train/',
          twoMixedBothGroup: '(/Event/,/Object/Man-made-object/Vehicle/Train/)',
        }
        const expectedEvent = 'Event'
        const expectedTrain = 'Train'
        const expectedMixed = expectedEvent + ',' + expectedTrain
        const expectedResults = {
          leadingSingle: expectedEvent,
          leadingMultiLevel: expectedTrain,
          trailingSingle: expectedEvent,
          trailingMultiLevel: expectedTrain,
          bothSingle: expectedEvent,
          bothMultiLevel: expectedTrain,
          twoMixedOuter: expectedMixed,
          twoMixedInner: expectedMixed,
          twoMixedBoth: expectedMixed,
          twoMixedBothGroup: '(' + expectedMixed + ')',
        }
        const expectedIssues = {
          leadingSingle: [],
          leadingMultiLevel: [],
          trailingSingle: [],
          trailingMultiLevel: [],
          bothSingle: [],
          bothMultiLevel: [],
          twoMixedOuter: [],
          twoMixedInner: [],
          twoMixedBoth: [],
          twoMixedBothGroup: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should replace extra spaces and slashes with single slashes', () => {
        const testStrings = {
          twoLevelDoubleSlash: 'Event//Extension',
          threeLevelDoubleSlash: 'Item//Object//Geometric-object',
          tripleSlashes: 'Item///Object///Geometric-object',
          mixedSingleAndDoubleSlashes: 'Item///Object/Geometric-object',
          singleSlashWithSpace: 'Event/ Extension',
          doubleSlashSurroundingSpace: 'Event/ /Extension',
          doubleSlashThenSpace: 'Event// Extension',
          sosPattern: 'Event///   ///Extension',
          alternatingSlashSpace: 'Item/ / Object/ / Geometric-object',
          leadingDoubleSlash: '//Event/Extension',
          trailingDoubleSlash: 'Event/Extension//',
          leadingDoubleSlashWithSpace: '/ /Event/Extension',
          trailingDoubleSlashWithSpace: 'Event/Extension/ /',
        }
        const expectedEventExtension = 'Event/Extension'
        const expectedGeometric = 'Geometric-object'
        const expectedResults = {
          twoLevelDoubleSlash: expectedEventExtension,
          threeLevelDoubleSlash: expectedGeometric,
          tripleSlashes: expectedGeometric,
          mixedSingleAndDoubleSlashes: expectedGeometric,
          singleSlashWithSpace: expectedEventExtension,
          doubleSlashSurroundingSpace: expectedEventExtension,
          doubleSlashThenSpace: expectedEventExtension,
          sosPattern: expectedEventExtension,
          alternatingSlashSpace: expectedGeometric,
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

      it('should raise an error if an empty string is passed', () => {
        const testStrings = {
          emptyString: '',
        }
        const expectedResults = {
          emptyString: '',
        }
        const expectedIssues = {
          emptyString: [generateIssue('emptyTagFound', testStrings.emptyString)],
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
          oneExtension: 'Event/Extension',
          threeMulti: 'Sensory-event, Train, RGB-red/0.5',
          simpleGroup: '(Train, RGB-red/0.5)',
          groupAndTag: '(Train, RGB-red/0.5), Car',
        }
        const expectedResults = {
          singleLevel: 'Event',
          multiLevel: 'Event/Sensory-event',
          twoSingle: 'Event, Property',
          oneExtension: 'Event/Extension',
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
          doubleWithValid: double + ', Item/Object/Man-made-object/Vehicle/Car/Minivan',
        }
        const expectedIssues = {
          single: [generateIssue('invalidTag', single, {}, [0, 12])],
          double: [generateIssue('invalidTag', double, {}, [0, 12])],
          both: [
            generateIssue('invalidTag', testStrings.both, {}, [0, 12]),
            generateIssue('invalidTag', testStrings.both, {}, [14, 26]),
          ],
          singleWithTwoValid: [generateIssue('invalidTag', testStrings.singleWithTwoValid, {}, [10, 22])],
          doubleWithValid: [generateIssue('invalidTag', testStrings.doubleWithValid, {}, [0, 12])],
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
          leadingSpace: ' Item/Sound/Environmental-sound/Unique Value',
          trailingSpace: 'Item/Sound/Environmental-sound/Unique Value ',
          bothSpace: ' Item/Sound/Environmental-sound/Unique Value ',
          leadingSpaceTwo: ' Item/Sound/Environmental-sound/Unique Value, Event',
          trailingSpaceTwo: 'Event, Item/Sound/Environmental-sound/Unique Value ',
          bothSpaceTwo: ' Event, Item/Sound/Environmental-sound/Unique Value ',
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

      it('should strip leading and trailing slashes', () => {
        const testStrings = {
          leadingSingle: '/Event',
          leadingMultiLevel: '/Vehicle/Train',
          trailingSingle: 'Event/',
          trailingMultiLevel: 'Vehicle/Train/',
          bothSingle: '/Event/',
          bothMultiLevel: '/Vehicle/Train/',
          twoMixedOuter: '/Event,Vehicle/Train/',
          twoMixedInner: 'Event/,/Vehicle/Train',
          twoMixedBoth: '/Event/,/Vehicle/Train/',
          twoMixedBothGroup: '(/Event/,/Vehicle/Train/)',
        }
        const expectedEvent = 'Event'
        const expectedTrain = 'Item/Object/Man-made-object/Vehicle/Train'
        const expectedMixed = expectedEvent + ',' + expectedTrain
        const expectedResults = {
          leadingSingle: expectedEvent,
          leadingMultiLevel: expectedTrain,
          trailingSingle: expectedEvent,
          trailingMultiLevel: expectedTrain,
          bothSingle: expectedEvent,
          bothMultiLevel: expectedTrain,
          twoMixedOuter: expectedMixed,
          twoMixedInner: expectedMixed,
          twoMixedBoth: expectedMixed,
          twoMixedBothGroup: '(' + expectedMixed + ')',
        }
        const expectedIssues = {
          leadingSingle: [],
          leadingMultiLevel: [],
          trailingSingle: [],
          trailingMultiLevel: [],
          bothSingle: [],
          bothMultiLevel: [],
          twoMixedOuter: [],
          twoMixedInner: [],
          twoMixedBoth: [],
          twoMixedBothGroup: [],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should replace extra spaces and slashes with single slashes', () => {
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

      it('should raise an error if an empty string is passed', () => {
        const testStrings = {
          emptyString: '',
        }
        const expectedResults = {
          emptyString: '',
        }
        const expectedIssues = {
          emptyString: [generateIssue('emptyTagFound', testStrings.emptyString)],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })
    })
  })
})

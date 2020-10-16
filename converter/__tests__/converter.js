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

  describe('HED tags', () => {
    /**
     * Base validation function.
     *
     * @param {Object<string, string>} testStrings
     * @param {Object<string, string>} expectedResults
     * @param {Object<string, Array>} expectedIssues
     * @param {function (Mapping, string, number): [string, []]} testFunction
     * @return {Promise<void> | PromiseLike<any> | Promise<any>}
     */
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
            0,
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

    describe('Long-to-short', () => {
      const validator = function(testStrings, expectedResults, expectedIssues) {
        return validatorBase(
          testStrings,
          expectedResults,
          expectedIssues,
          converter.convertTagToShort,
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
          singleLevel: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevel,
              { parentTag: 'Event' },
              [31, 36],
            ),
          ],
          multiLevel: [
            generateIssue(
              'invalidParentNode',
              testStrings.multiLevel,
              { parentTag: 'Event/Sensory-event' },
              [37, 50],
            ),
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
          partialPath: 'Object/Man-made/Vehicle/Boat/Yacht',
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
          validThenInvalid:
            'Event/Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Event/Experiment-control/Geometric',
          singleLevelAlreadyShort: 'Experiment-control/Geometric',
          twoLevels: 'Event/Experiment-control/Geometric/Event',
          duplicate: 'Item/Object/Geometric/Item/Object/Geometric',
        }
        const expectedResults = {
          validThenInvalid:
            'Event/Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Event/Experiment-control/Geometric',
          singleLevelAlreadyShort: 'Experiment-control/Geometric',
          twoLevels: 'Event/Experiment-control/Geometric/Event',
          duplicate: 'Item/Object/Geometric/Item/Object/Geometric',
        }
        const expectedIssues = {
          validThenInvalid: [
            generateIssue(
              'invalidParentNode',
              testStrings.validThenInvalid,
              { parentTag: 'Event' },
              [61, 66],
            ),
          ],
          singleLevel: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevel,
              { parentTag: 'Item/Object/Geometric' },
              [25, 34],
            ),
          ],
          singleLevelAlreadyShort: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevelAlreadyShort,
              { parentTag: 'Item/Object/Geometric' },
              [19, 28],
            ),
          ],
          twoLevels: [
            generateIssue(
              'invalidParentNode',
              testStrings.twoLevels,
              { parentTag: 'Event' },
              [35, 40],
            ),
          ],
          duplicate: [
            generateIssue(
              'invalidParentNode',
              testStrings.duplicate,
              { parentTag: 'Item/Object/Geometric' },
              [34, 43],
            ),
          ],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should raise an issue if an invalid node is found', () => {
        const testStrings = {
          invalidParentWithExistingGrandchild:
            'InvalidEvent/Experiment-control/Geometric',
          invalidChildWithExistingGrandchild: 'Event/InvalidEvent/Geometric',
          invalidParentWithExistingChild: 'InvalidEvent/Geometric',
          invalidSingle: 'InvalidEvent',
          invalidWithExtension: 'InvalidEvent/InvalidExtension',
        }
        const expectedResults = {
          invalidParentWithExistingGrandchild:
            'InvalidEvent/Experiment-control/Geometric',
          invalidChildWithExistingGrandchild: 'Event/InvalidEvent/Geometric',
          invalidParentWithExistingChild: 'InvalidEvent/Geometric',
          invalidSingle: 'InvalidEvent',
          invalidWithExtension: 'InvalidEvent/InvalidExtension',
        }
        const expectedIssues = {
          invalidParentWithExistingGrandchild: [
            generateIssue(
              'invalidParentNode',
              testStrings.invalidParentWithExistingGrandchild,
              { parentTag: 'Item/Object/Geometric' },
              [32, 41],
            ),
          ],
          invalidChildWithExistingGrandchild: [
            generateIssue(
              'invalidParentNode',
              testStrings.invalidChildWithExistingGrandchild,
              { parentTag: 'Item/Object/Geometric' },
              [19, 28],
            ),
          ],
          invalidParentWithExistingChild: [
            generateIssue(
              'invalidParentNode',
              testStrings.invalidParentWithExistingChild,
              { parentTag: 'Item/Object/Geometric' },
              [13, 22],
            ),
          ],
          invalidSingle: [
            generateIssue('noValidTagFound', testStrings.invalidSingle, {}, [
              0,
              12,
            ]),
          ],
          invalidWithExtension: [
            generateIssue(
              'noValidTagFound',
              testStrings.invalidWithExtension,
              {},
              [0, 12],
            ),
          ],
        }
        return validator(testStrings, expectedResults, expectedIssues)
      })

      it('should not validate whether a node actually allows extensions', () => {
        const testStrings = {
          validTakesValue: 'Attribute/Agent-related/Trait/Age/15',
          cascadeExtension:
            'Attribute/Agent-related/Emotional-state/Awed/Cascade Extension',
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
          leadingMultiLevel: '/Item/Object/Man-made/Vehicle/Train',
          leadingMultiLevelExtension:
            '/Item/Object/Man-made/Vehicle/Train/Maglev',
          trailingSingle: 'Event/',
          trailingExtension: 'Event/Extension/',
          trailingMultiLevel: 'Item/Object/Man-made/Vehicle/Train/',
          trailingMultiLevelExtension:
            'Item/Object/Man-made/Vehicle/Train/Maglev/',
          bothSingle: '/Event/',
          bothExtension: '/Event/Extension/',
          bothMultiLevel: '/Item/Object/Man-made/Vehicle/Train/',
          bothMultiLevelExtension:
            '/Item/Object/Man-made/Vehicle/Train/Maglev/',
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
      const validator = function(testStrings, expectedResults, expectedIssues) {
        return validatorBase(
          testStrings,
          expectedResults,
          expectedIssues,
          converter.convertTagToLong,
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

      it('should convert HED tags with extensions to long form', () => {
        const testStrings = {
          singleLevel: 'Experiment-control/extended lvl1',
          multiLevel: 'Experiment-control/extended lvl1/Extension2',
          partialPath: 'Vehicle/Boat/Yacht',
        }
        const expectedResults = {
          singleLevel: 'Event/Experiment-control/extended lvl1',
          multiLevel: 'Event/Experiment-control/extended lvl1/Extension2',
          partialPath: 'Item/Object/Man-made/Vehicle/Boat/Yacht',
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
          validThenInvalid:
            'Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Experiment-control/Geometric',
          singleLevelAlreadyLong: 'Event/Experiment-control/Geometric',
          twoLevels: 'Experiment-control/Geometric/Event',
          partialDuplicate: 'Geometric/Item/Object/Geometric',
        }
        const expectedResults = {
          validThenInvalid:
            'Experiment-control/valid extension followed by invalid/Event',
          singleLevel: 'Experiment-control/Geometric',
          singleLevelAlreadyLong: 'Event/Experiment-control/Geometric',
          twoLevels: 'Experiment-control/Geometric/Event',
          partialDuplicate: 'Geometric/Item/Object/Geometric',
        }
        const expectedIssues = {
          validThenInvalid: [
            generateIssue(
              'invalidParentNode',
              testStrings.validThenInvalid,
              { parentTag: 'Event' },
              [55, 60],
            ),
          ],
          singleLevel: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevel,
              { parentTag: 'Item/Object/Geometric' },
              [19, 28],
            ),
          ],
          singleLevelAlreadyLong: [
            generateIssue(
              'invalidParentNode',
              testStrings.singleLevelAlreadyLong,
              { parentTag: 'Item/Object/Geometric' },
              [25, 34],
            ),
          ],
          twoLevels: [
            generateIssue(
              'invalidParentNode',
              testStrings.twoLevels,
              { parentTag: 'Item/Object/Geometric' },
              [19, 28],
            ),
          ],
          partialDuplicate: [
            generateIssue(
              'invalidParentNode',
              testStrings.partialDuplicate,
              { parentTag: 'Item' },
              [10, 14],
            ),
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
          single: [
            generateIssue('noValidTagFound', testStrings.single, {}, [0, 12]),
          ],
          invalidChild: [
            generateIssue('noValidTagFound', testStrings.invalidChild, {}, [
              0,
              12,
            ]),
          ],
          validChild: [
            generateIssue('noValidTagFound', testStrings.validChild, {}, [
              0,
              12,
            ]),
          ],
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
          validTakesValue: 'Attribute/Agent-related/Trait/Age/15',
          cascadeExtension:
            'Attribute/Agent-related/Emotional-state/Awed/Cascade Extension',
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
          leadingSpace: [
            generateIssue('noValidTagFound', testStrings.leadingSpace, {}, [
              0,
              20,
            ]),
          ],
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
          leadingMultiLevel: 'Item/Object/Man-made/Vehicle/Train',
          leadingMultiLevelExtension:
            'Item/Object/Man-made/Vehicle/Train/Maglev',
          trailingSingle: 'Event',
          trailingExtension: 'Event/Extension',
          trailingMultiLevel: 'Item/Object/Man-made/Vehicle/Train',
          trailingMultiLevelExtension:
            'Item/Object/Man-made/Vehicle/Train/Maglev',
          bothSingle: 'Event',
          bothExtension: 'Event/Extension',
          bothMultiLevel: 'Item/Object/Man-made/Vehicle/Train',
          bothMultiLevelExtension: 'Item/Object/Man-made/Vehicle/Train/Maglev',
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
  })
})

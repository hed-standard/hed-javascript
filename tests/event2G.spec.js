import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import * as hed from '../validator/event'
import { buildSchemas } from '../schema/init'
import { parseHedString } from '../parser/parser'
import ParsedHedTag from '../parser/parsedHedTag'
import { generateIssue } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { Schemas } from '../schema/containers'

describe('HED string and event validation', () => {
  /**
   * Validation base function.
   *
   * @param {Schemas} hedSchemas The HED schema collection used for testing.
   * @param {typeof HedValidator} ValidatorClass A subclass of {@link HedValidator} to use for validation.
   * @param {Object<string, string>} testStrings A mapping of test strings.
   * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
   * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
   * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
   */
  const validatorBase = function (
    hedSchemas,
    ValidatorClass,
    testStrings,
    expectedIssues,
    testFunction,
    testOptions = {},
  ) {
    for (const [testStringKey, testString] of Object.entries(testStrings)) {
      assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
      const [parsedTestString, parsingIssues] = parseHedString(testString, hedSchemas)
      const validator = new ValidatorClass(parsedTestString, hedSchemas, testOptions)
      const flattenedParsingIssues = Object.values(parsingIssues).flat()
      if (flattenedParsingIssues.length === 0) {
        testFunction(validator)
      }
      const issues = [].concat(flattenedParsingIssues, validator.issues)
      assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
    }
  }

  describe.skip('HED-2G validation', () => {
    describe('Later HED-2G schemas', () => {
      const hedSchemaFile = 'tests/data/HED7.1.1.xml'
      let hedSchemas

      beforeAll(async () => {
        const spec1 = new SchemaSpec('', '7.1.1', '', hedSchemaFile)
        const specs = new SchemasSpec().addSchemaSpec(spec1)
        hedSchemas = await buildSchemas(specs)
      })

      /**
       * HED 2 semantic validation base function.
       *
       * This base function uses the HED 2-specific {@link Hed2Validator} validator class.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemanticBase = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        validatorBase(hedSchemas, Hed2Validator, testStrings, expectedIssues, testFunction, testOptions)
      }

      describe('Full HED Strings', () => {
        const validatorSemantic = validatorSemanticBase

        // TODO: Rewrite as HED 3 test
        it.skip('should not validate strings with extensions that are valid node names', () => {
          const testStrings = {
            // Event/Duration/20 cm is an obviously invalid tag that should not be caught due to the first error.
            red: 'Attribute/Red, Event/Duration/20 cm',
            redAndBlue: 'Attribute/Red, Attribute/Blue, Event/Duration/20 cm',
          }
          const expectedIssues = {
            red: [
              generateIssue('invalidParentNode', {
                tag: 'Red',
                parentTag: 'Attribute/Visual/Color/Red',
              }),
            ],
            redAndBlue: [
              generateIssue('invalidParentNode', {
                tag: 'Red',
                parentTag: 'Attribute/Visual/Color/Red',
              }),
              generateIssue('invalidParentNode', {
                tag: 'Blue',
                parentTag: 'Attribute/Visual/Color/Blue',
              }),
            ],
          }
          // This is a no-op function since this is checked during string parsing.
          return validatorSemantic(
            testStrings,
            expectedIssues,
            // eslint-disable-next-line no-unused-vars
            (validator) => {},
          )
        })
      })

      describe('Individual HED Tags', () => {
        /**
         * HED 2 individual tag semantic validation base function.
         *
         * @param {Object<string, string>} testStrings A mapping of test strings.
         * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
         * @param {function(HedValidator, ParsedHedTag, ParsedHedTag): void} testFunction A test-specific function that executes the required validation check.
         * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
         */
        const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions) {
          return validatorSemanticBase(
            testStrings,
            expectedIssues,
            (validator) => {
              let previousTag = new ParsedHedTag('', '', [0, 0], validator.hedSchemas)
              for (const tag of validator.parsedString.tags) {
                testFunction(validator, tag, previousTag)
                previousTag = tag
              }
            },
            testOptions,
          )
        }
        //TODO: Rewrite for HED-3
        it('should exist in the schema or be an allowed extension', () => {
          const testStrings = {
            takesValue: 'Event/Duration/3 ms',
            full: 'Attribute/Object side/Left',
            extensionAllowed: 'Item/Object/Person/Driver',
            leafExtension: 'Event/Category/Initial context/Something',
            nonExtensionAllowed: 'Event/Nonsense',
            illegalComma: 'Event/Label/This is a label,This/Is/A/Tag',
            placeholder: 'Item/Object/#',
          }
          const expectedIssues = {
            takesValue: [],
            full: [],
            extensionAllowed: [generateIssue('extension', { tag: testStrings.extensionAllowed })],
            leafExtension: [generateIssue('invalidTag', { tag: testStrings.leafExtension })],
            nonExtensionAllowed: [
              generateIssue('invalidTag', {
                tag: testStrings.nonExtensionAllowed,
              }),
            ],
            illegalComma: [
              generateIssue('extraCommaOrInvalid', {
                previousTag: 'Event/Label/This is a label',
                tag: 'This/Is/A/Tag',
              }),
            ],
            placeholder: [
              generateIssue('invalidTag', {
                tag: testStrings.placeholder,
              }),
            ],
          }
          return validatorSemantic(
            testStrings,
            expectedIssues,
            (validator, tag, previousTag) => {
              validator.checkIfTagIsValid(tag, previousTag)
            },
            { checkForWarnings: true },
          )
        })

        it('should have a child when required', () => {
          const testStrings = {
            hasChild: 'Event/Category/Experimental stimulus',
            missingChild: 'Event/Category',
          }
          const expectedIssues = {
            hasChild: [],
            missingChild: [generateIssue('childRequired', { tag: testStrings.missingChild })],
          }
          return validatorSemantic(
            testStrings,
            expectedIssues,
            // eslint-disable-next-line no-unused-vars
            (validator, tag, previousTag) => {
              validator.checkIfTagRequiresChild(tag)
            },
            { checkForWarnings: true },
          )
        })

        it('should have a proper unit when required', () => {
          const testStrings = {
            correctUnit: 'Event/Duration/3 ms',
            correctUnitScientific: 'Event/Duration/3.5e1 ms',
            correctSingularUnit: 'Event/Duration/1 millisecond',
            correctPluralUnit: 'Event/Duration/3 milliseconds',
            correctNoPluralUnit: 'Attribute/Temporal rate/3 hertz',
            correctPrefixUnit: 'Participant/Effect/Cognitive/Reward/$19.69',
            correctNonSymbolCapitalizedUnit: 'Event/Duration/3 MilliSeconds',
            correctSymbolCapitalizedUnit: 'Attribute/Temporal rate/3 kHz',
            missingRequiredUnit: 'Event/Duration/3',
            incorrectUnit: 'Event/Duration/3 cm',
            incorrectNonNumericValue: 'Event/Duration/A ms',
            incorrectPluralUnit: 'Attribute/Temporal rate/3 hertzs',
            incorrectSymbolCapitalizedUnit: 'Attribute/Temporal rate/3 hz',
            incorrectSymbolCapitalizedUnitModifier: 'Attribute/Temporal rate/3 KHz',
            incorrectNonSIUnitModifier: 'Event/Duration/1 millihour',
            incorrectNonSIUnitSymbolModifier: 'Attribute/Path/Velocity/100 Mkph',
            notRequiredNumber: 'Attribute/Visual/Color/Red/0.5',
            notRequiredScientific: 'Attribute/Visual/Color/Red/5e-1',
            properTime: 'Item/2D shape/Clock face/08:30',
            invalidTime: 'Item/2D shape/Clock face/54:54',
          }
          const legalTimeUnits = ['s', 'second', 'day', 'minute', 'hour']
          const legalFrequencyUnits = ['Hz', 'hertz']
          const legalSpeedUnits = ['m-per-s', 'kph', 'mph']
          const expectedIssues = {
            correctUnit: [],
            correctUnitScientific: [],
            correctSingularUnit: [],
            correctPluralUnit: [],
            correctNoPluralUnit: [],
            correctPrefixUnit: [],
            correctNonSymbolCapitalizedUnit: [],
            correctSymbolCapitalizedUnit: [],
            missingRequiredUnit: [
              generateIssue('unitClassDefaultUsed', {
                defaultUnit: 's',
                tag: testStrings.missingRequiredUnit,
              }),
            ],
            incorrectUnit: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectUnit,
                unitClassUnits: legalTimeUnits.sort().join(','),
              }),
            ],
            incorrectNonNumericValue: [
              generateIssue('invalidValue', {
                tag: testStrings.incorrectNonNumericValue,
              }),
            ],
            incorrectPluralUnit: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectPluralUnit,
                unitClassUnits: legalFrequencyUnits.sort().join(','),
              }),
            ],
            incorrectSymbolCapitalizedUnit: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectSymbolCapitalizedUnit,
                unitClassUnits: legalFrequencyUnits.sort().join(','),
              }),
            ],
            incorrectSymbolCapitalizedUnitModifier: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectSymbolCapitalizedUnitModifier,
                unitClassUnits: legalFrequencyUnits.sort().join(','),
              }),
            ],
            incorrectNonSIUnitModifier: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectNonSIUnitModifier,
                unitClassUnits: legalTimeUnits.sort().join(','),
              }),
            ],
            incorrectNonSIUnitSymbolModifier: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectNonSIUnitSymbolModifier,
                unitClassUnits: legalSpeedUnits.sort().join(','),
              }),
            ],
            notRequiredNumber: [],
            notRequiredScientific: [],
            properTime: [],
            invalidTime: [
              generateIssue('invalidValue', {
                tag: testStrings.invalidTime,
              }),
            ],
          }
          return validatorSemantic(
            testStrings,
            expectedIssues,
            // eslint-disable-next-line no-unused-vars
            (validator, tag, previousTag) => {
              validator.checkIfTagUnitClassUnitsAreValid(tag)
            },
            { checkForWarnings: true },
          )
        })
      })

      //TODO: Replace with HED-3
      describe('HED Tag Levels', () => {
        /**
         * HED 2 Tag level semantic validation base function.
         *
         * @param {Object<string, string>} testStrings A mapping of test strings.
         * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
         * @param {function(HedValidator, ParsedHedSubstring[]): void} testFunction A test-specific function that executes the required validation check.
         * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
         */
        const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
          return validatorSemanticBase(
            testStrings,
            expectedIssues,
            (validator) => {
              for (const tagGroup of validator.parsedString.tagGroups) {
                for (const subGroup of tagGroup.subGroupArrayIterator()) {
                  testFunction(validator, subGroup)
                }
              }
              testFunction(validator, validator.parsedString.parseTree)
            },
            testOptions,
          )
        }

        it('should not have multiple copies of a unique tag', () => {
          const testStrings = {
            legal:
              'Event/Description/Rail vehicles,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
            multipleDesc:
              'Event/Description/Rail vehicles,Event/Description/Locomotive-pulled or multiple units,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
          }
          const expectedIssues = {
            legal: [],
            multipleDesc: [generateIssue('multipleUniqueTags', { tag: 'event/description' })],
          }
          return validatorSemantic(testStrings, expectedIssues, (validator, tagLevel) => {
            validator.checkForMultipleUniqueTags(tagLevel)
          })
        })
      })

      describe('Top-level Tags', () => {
        const validatorSemantic = validatorSemanticBase

        it('should include all required tags', () => {
          const testStrings = {
            complete:
              'Event/Label/Bus,Event/Category/Experimental stimulus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus',
            missingLabel:
              'Event/Category/Experimental stimulus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus',
            missingCategory: 'Event/Label/Bus,Event/Description/Shown a picture of a bus,Item/Object/Vehicle/Bus',
            missingDescription: 'Event/Label/Bus,Event/Category/Experimental stimulus,Item/Object/Vehicle/Bus',
            missingAllRequired: 'Item/Object/Vehicle/Bus',
          }
          const expectedIssues = {
            complete: [],
            missingLabel: [
              generateIssue('requiredPrefixMissing', {
                tagPrefix: 'event/label',
              }),
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
          return validatorSemantic(
            testStrings,
            expectedIssues,
            (validator) => {
              validator.checkForRequiredTags()
            },
            { checkForWarnings: true },
          )
        })
      })
    })

    describe('Pre-v7.1.0 HED schemas', () => {
      const hedSchemaFile = 'tests/data/HED7.0.4.xml'
      let hedSchemas

      beforeAll(async () => {
        const spec2 = new SchemaSpec('', '7.0.4', '', hedSchemaFile)
        const specs = new SchemasSpec().addSchemaSpec(spec2)
        hedSchemas = await buildSchemas(specs)
      })

      /**
       * HED 2 semantic validation base function.
       *
       * This base function uses the HED 2-specific {@link Hed2Validator} validator class.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemanticBase = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        validatorBase(hedSchemas, Hed2Validator, testStrings, expectedIssues, testFunction, testOptions)
      }

      describe('Individual HED Tags', () => {
        /**
         * HED 2 individual tag semantic validation base function.
         *
         * @param {Object<string, string>} testStrings A mapping of test strings.
         * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
         * @param {function(HedValidator, ParsedHedTag, ParsedHedTag): void} testFunction A test-specific function that executes the required validation check.
         * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
         */
        const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions) {
          return validatorSemanticBase(
            testStrings,
            expectedIssues,
            (validator) => {
              let previousTag = new ParsedHedTag('', '', [0, 0], validator.hedSchemas)
              for (const tag of validator.parsedString.tags) {
                testFunction(validator, tag, previousTag)
                previousTag = tag
              }
            },
            testOptions,
          )
        }

        it('should have a proper unit when required', () => {
          const testStrings = {
            correctUnit: 'Event/Duration/3 ms',
            correctUnitWord: 'Event/Duration/3 milliseconds',
            correctUnitScientific: 'Event/Duration/3.5e1 ms',
            missingRequiredUnit: 'Event/Duration/3',
            incorrectUnit: 'Event/Duration/3 cm',
            incorrectNonNumericValue: 'Event/Duration/A ms',
            incorrectUnitWord: 'Event/Duration/3 nanoseconds',
            incorrectModifier: 'Event/Duration/3 ns',
            notRequiredNumber: 'Attribute/Visual/Color/Red/0.5',
            notRequiredScientific: 'Attribute/Visual/Color/Red/5e-1',
            properTime: 'Item/2D shape/Clock face/08:30',
            invalidTime: 'Item/2D shape/Clock face/54:54',
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
            correctUnitWord: [],
            correctUnitScientific: [],
            missingRequiredUnit: [
              generateIssue('unitClassDefaultUsed', {
                defaultUnit: 's',
                tag: testStrings.missingRequiredUnit,
              }),
            ],
            incorrectUnit: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectUnit,
                unitClassUnits: legalTimeUnits.sort().join(','),
              }),
            ],
            incorrectNonNumericValue: [
              generateIssue('invalidValue', {
                tag: testStrings.incorrectNonNumericValue,
              }),
            ],
            incorrectUnitWord: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectUnitWord,
                unitClassUnits: legalTimeUnits.sort().join(','),
              }),
            ],
            incorrectModifier: [
              generateIssue('unitClassInvalidUnit', {
                tag: testStrings.incorrectModifier,
                unitClassUnits: legalTimeUnits.sort().join(','),
              }),
            ],
            notRequiredNumber: [],
            notRequiredScientific: [],
            properTime: [],
            invalidTime: [
              generateIssue('invalidValue', {
                tag: testStrings.invalidTime,
              }),
            ],
          }
          return validatorSemantic(
            testStrings,
            expectedIssues,
            // eslint-disable-next-line no-unused-vars
            (validator, tag, previousTag) => {
              validator.checkIfTagUnitClassUnitsAreValid(tag)
            },
            { checkForWarnings: true },
          )
        })
      })
    })
  })
})

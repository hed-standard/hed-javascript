import chai from 'chai'
const assert = chai.assert
import * as hed from '../validator/event'
import { buildSchemas } from '../validator/schema/init'
import { parseHedString } from '../validator/parser/main'
import { ParsedHedTag } from '../validator/parser/parsedHedTag'
import { HedValidator, Hed2Validator, Hed3Validator } from '../validator/event'
import { generateIssue } from '../common/issues/issues'
import converterGenerateIssue from '../converter/issues'
import { Schemas, SchemaSpec, SchemasSpec } from '../common/schema/types'

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
      testFunction(validator)
      const issues = [].concat(...Object.values(parsingIssues), validator.issues)
      assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
    }
  }

  describe('HED generic syntax validation', () => {
    /**
     * Syntactic validation base function.
     *
     * This base function uses the generic {@link HedValidator} validator class.
     *
     * @param {Object<string, string>} testStrings A mapping of test strings.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
     * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
     * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
     */
    const validatorSyntacticBase = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
      const dummySchema = new Schemas(null)
      validatorBase(dummySchema, HedValidator, testStrings, expectedIssues, testFunction, testOptions)
    }

    describe('Full HED Strings', () => {
      const validatorSyntactic = validatorSyntacticBase

      it('should not have mismatched parentheses', () => {
        const testStrings = {
          extraOpening:
            '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          // The extra comma is needed to avoid a comma error.
          extraClosing:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          wrongOrder:
            '/Action/Reach/To touch,((/Attribute/Object side/Left),/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px),(/Attribute/Location/Screen/Left/23 px',
          valid:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
        }
        const expectedIssues = {
          extraOpening: [generateIssue('parentheses', { opening: 2, closing: 1 })],
          extraClosing: [generateIssue('parentheses', { opening: 1, closing: 2 })],
          wrongOrder: [
            generateIssue('unopenedParenthesis', { index: 125, string: testStrings.wrongOrder }),
            generateIssue('unclosedParenthesis', { index: 127, string: testStrings.wrongOrder }),
          ],
          valid: [],
        }
        // No-op function as this check is done during the parsing stage.
        // eslint-disable-next-line no-unused-vars
        validatorSyntactic(testStrings, expectedIssues, (validator) => {})
      })

      it('should not have malformed delimiters', () => {
        const testStrings = {
          missingOpeningComma:
            '/Action/Reach/To touch(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          missingClosingComma:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          extraOpeningComma:
            ',/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          extraClosingComma:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px,',
          multipleExtraOpeningDelimiter:
            ',,/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          multipleExtraClosingDelimiter:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px,,',
          multipleExtraMiddleDelimiter:
            '/Action/Reach/To touch,,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,,/Attribute/Location/Screen/Left/23 px',
          valid:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px',
          validDoubleOpeningParentheses:
            '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px),Event/Duration/3 ms',
          validDoubleClosingParentheses:
            '/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm,(/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px)),Event/Duration/3 ms',
        }
        const expectedIssues = {
          missingOpeningComma: [generateIssue('invalidTag', { tag: '/Action/Reach/To touch(' })],
          missingClosingComma: [
            generateIssue('commaMissing', {
              tag: '/Participant/Effect/Body part/Arm)',
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
          multipleExtraOpeningDelimiter: [
            generateIssue('extraDelimiter', {
              character: ',',
              index: 0,
              string: testStrings.multipleExtraOpeningDelimiter,
            }),
            generateIssue('extraDelimiter', {
              character: ',',
              index: 1,
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
              character: ',',
              index: testStrings.multipleExtraClosingDelimiter.length - 2,
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
              character: ',',
              index: 125,
              string: testStrings.multipleExtraMiddleDelimiter,
            }),
          ],
          valid: [],
          validDoubleOpeningParentheses: [],
          validDoubleClosingParentheses: [],
        }
        // No-op function as this check is done during the parsing stage.
        // eslint-disable-next-line no-unused-vars
        validatorSyntactic(testStrings, expectedIssues, (validator) => {})
      })

      it('should not have invalid characters', () => {
        const testStrings = {
          openingBrace: '/Attribute/Object side/Left,/Participant/Effect{/Body part/Arm',
          closingBrace: '/Attribute/Object side/Left,/Participant/Effect}/Body part/Arm',
          openingBracket: '/Attribute/Object side/Left,/Participant/Effect[/Body part/Arm',
          closingBracket: '/Attribute/Object side/Left,/Participant/Effect]/Body part/Arm',
          tilde: '/Attribute/Object side/Left,/Participant/Effect~/Body part/Arm',
          doubleQuote: '/Attribute/Object side/Left,/Participant/Effect"/Body part/Arm',
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
          tilde: [
            generateIssue('invalidCharacter', {
              character: '~',
              index: 47,
              string: testStrings.tilde,
            }),
          ],
          doubleQuote: [
            generateIssue('invalidCharacter', {
              character: '"',
              index: 47,
              string: testStrings.doubleQuote,
            }),
          ],
        }
        // No-op function as this check is done during the parsing stage.
        // eslint-disable-next-line no-unused-vars
        validatorSyntactic(testStrings, expectedIssues, (validator) => {})
      })

      it('should substitute and warn for certain illegal characters', () => {
        const testStrings = {
          nul: '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm\0',
        }
        const expectedIssues = {
          nul: [
            generateIssue('invalidCharacter', {
              character: 'ASCII NUL',
              index: 61,
              string: testStrings.nul,
            }),
          ],
        }
        // No-op function as this check is done during the parsing stage.
        // eslint-disable-next-line no-unused-vars
        validatorSyntactic(testStrings, expectedIssues, (validator) => {})
      })
    })

    describe('HED Tag Levels', () => {
      /**
       * Tag level syntactic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator, ParsedHedTag[]): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSyntactic = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        validatorSyntacticBase(
          testStrings,
          expectedIssues,
          (validator) => {
            for (const tagGroup of validator.parsedString.tagGroups) {
              for (const subGroup of tagGroup.subGroupArrayIterator()) {
                testFunction(validator, subGroup)
              }
            }
            testFunction(validator, validator.parsedString.topLevelTags)
          },
          testOptions,
        )
      }

      it('should not contain duplicates', () => {
        const testStrings = {
          //topLevelDuplicate: 'Event/Category/Experimental stimulus,Event/Category/Experimental stimulus',
          groupDuplicate:
            'Item/Object/Vehicle/Train,(Event/Category/Experimental stimulus,Attribute/Visual/Color/Purple,Event/Category/Experimental stimulus)',
          nestedGroupDuplicate:
            'Item/Object/Vehicle/Train,(Attribute/Visual/Color/Purple,(Event/Category/Experimental stimulus,Event/Category/Experimental stimulus))',
          noDuplicate: 'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple',
          legalDuplicate: 'Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
          nestedLegalDuplicate:
            '(Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus))',
          legalDuplicateDifferentValue: '(Attribute/Language/Unit/Word/Brain,Attribute/Language/Unit/Word/Study)',
        }
        const expectedIssues = {
          topLevelDuplicate: [
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
              bounds: [0, 36],
            }),
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
              bounds: [37, 73],
            }),
          ],
          groupDuplicate: [
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
              bounds: [27, 63],
            }),
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
              bounds: [94, 130],
            }),
          ],
          nestedGroupDuplicate: [
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
              bounds: [58, 94],
            }),
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
              bounds: [95, 131],
            }),
          ],
          noDuplicate: [],
          legalDuplicate: [],
          nestedLegalDuplicate: [],
          legalDuplicateDifferentValue: [],
        }
        validatorSyntactic(testStrings, expectedIssues, (validator, tagLevel) => {
          validator.checkForDuplicateTags(tagLevel)
        })
      })
    })
  })

  describe('HED-2G validation', () => {
    describe('Later HED-2G schemas', () => {
      const hedSchemaFile = 'tests/data/HED7.1.1.xml'
      let hedSchemaPromise

      beforeAll(() => {
        const spec1 = new SchemaSpec('', '7.1.1', '', hedSchemaFile)
        const specs = new SchemasSpec().addSchemaSpec(spec1)
        hedSchemaPromise = buildSchemas(specs)
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
        return hedSchemaPromise.then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          validatorBase(hedSchemas, Hed2Validator, testStrings, expectedIssues, testFunction, testOptions)
        })
      }

      describe('Full HED Strings', () => {
        const validatorSemantic = validatorSemanticBase

        it('should not validate strings with extensions that are valid node names', () => {
          const testStrings = {
            // Event/Duration/20 cm is an obviously invalid tag that should not be caught due to the first error.
            red: 'Attribute/Red, Event/Duration/20 cm',
            redAndBlue: 'Attribute/Red, Attribute/Blue, Event/Duration/20 cm',
          }
          const expectedIssues = {
            red: [
              converterGenerateIssue(
                'invalidParentNode',
                testStrings.red,
                {
                  parentTag: 'Attribute/Visual/Color/Red',
                },
                [10, 13],
              ),
            ],
            redAndBlue: [
              converterGenerateIssue(
                'invalidParentNode',
                testStrings.redAndBlue,
                {
                  parentTag: 'Attribute/Visual/Color/Red',
                },
                [10, 13],
              ),
              converterGenerateIssue(
                'invalidParentNode',
                testStrings.redAndBlue,
                {
                  parentTag: 'Attribute/Visual/Color/Blue',
                },
                [25, 29],
              ),
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

        it('should exist in the schema or be an allowed extension', () => {
          const testStrings = {
            takesValue: 'Event/Duration/3 ms',
            full: 'Attribute/Object side/Left',
            extensionAllowed: 'Item/Object/Person/Driver',
            leafExtension: 'Event/Category/Initial context/Something',
            nonExtensionAllowed: 'Event/Nonsense',
            illegalComma: 'Event/Label/This is a label,This/Is/A/Tag',
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
              converterGenerateIssue('invalidTag', testStrings.illegalComma, {}, [28, 32]),
              generateIssue('extraCommaOrInvalid', {
                previousTag: 'Event/Label/This is a label',
                tag: 'This/Is/A/Tag',
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

      describe('HED Tag Levels', () => {
        /**
         * HED 2 Tag level semantic validation base function.
         *
         * @param {Object<string, string>} testStrings A mapping of test strings.
         * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
         * @param {function(HedValidator, ParsedHedTag[]): void} testFunction A test-specific function that executes the required validation check.
         * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
         */
        const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
          validatorSemanticBase(
            testStrings,
            expectedIssues,
            (validator) => {
              for (const tagGroup of validator.parsedString.tagGroups) {
                for (const subGroup of tagGroup.subGroupArrayIterator()) {
                  testFunction(validator, subGroup)
                }
              }
              testFunction(validator, validator.parsedString.topLevelTags)
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

      describe('HED Strings', () => {
        const validator = function (testStrings, expectedIssues, expectValuePlaceholderString = false) {
          return hedSchemaPromise.then(([hedSchemas, issues]) => {
            assert.isEmpty(issues, 'Schema loading issues occurred')
            for (const [testStringKey, testString] of Object.entries(testStrings)) {
              assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
              const [, testIssues] = hed.validateHedString(testString, hedSchemas, true, expectValuePlaceholderString)
              assert.sameDeepMembers(testIssues, expectedIssues[testStringKey], testString)
            }
          })
        }

        it('should skip tag group-level checks', () => {
          const testStrings = {
            duplicate: 'Item/Object/Vehicle/Train,Item/Object/Vehicle/Train',
            multipleUnique: 'Event/Description/Rail vehicles,Event/Description/Locomotive-pulled or multiple units',
          }
          const expectedIssues = {
            duplicate: [],
            multipleUnique: [],
          }
          return validator(testStrings, expectedIssues)
        })

        it('should properly handle strings with placeholders', () => {
          const testStrings = {
            takesValue: 'Attribute/Visual/Color/Red/#',
            withUnit: 'Event/Duration/# ms',
            child: 'Attribute/Object side/#',
            extensionAllowed: 'Item/Object/Person/Driver/#',
            invalidParent: 'Event/Nonsense/#',
            missingRequiredUnit: 'Event/Duration/#',
            wrongLocation: 'Item/#/Person',
          }
          const expectedIssues = {
            takesValue: [],
            withUnit: [],
            child: [generateIssue('invalidPlaceholder', { tag: testStrings.child })],
            extensionAllowed: [
              generateIssue('invalidPlaceholder', {
                tag: testStrings.extensionAllowed,
              }),
            ],
            invalidParent: [
              generateIssue('invalidPlaceholder', {
                tag: testStrings.invalidParent,
              }),
            ],
            missingRequiredUnit: [
              generateIssue('unitClassDefaultUsed', {
                defaultUnit: 's',
                tag: testStrings.missingRequiredUnit,
              }),
            ],
            wrongLocation: [
              converterGenerateIssue(
                'invalidParentNode',
                testStrings.wrongLocation,
                { parentTag: 'Item/Object/Person' },
                [7, 13],
              ),
              generateIssue('invalidPlaceholder', {
                tag: testStrings.wrongLocation,
              }),
            ],
          }
          return validator(testStrings, expectedIssues, true)
        })
      })
    })

    describe('Pre-v7.1.0 HED schemas', () => {
      const hedSchemaFile = 'tests/data/HED7.0.4.xml'
      let hedSchemaPromise

      beforeAll(() => {
        const spec2 = new SchemaSpec('', '7.0.4', '', hedSchemaFile)
        const specs = new SchemasSpec().addSchemaSpec(spec2)
        hedSchemaPromise = buildSchemas(specs)
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
        return hedSchemaPromise.then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          validatorBase(hedSchemas, Hed2Validator, testStrings, expectedIssues, testFunction, testOptions)
        })
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

  describe('HED-3G validation', () => {
    const hedSchemaFile = 'tests/data/HED8.0.0.xml'
    let hedSchemaPromise

    beforeAll(() => {
      const spec3 = new SchemaSpec('', '8.0.0', '', hedSchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec3)
      hedSchemaPromise = buildSchemas(specs)
    })

    /**
     * Validation base function.
     *
     * This override is required due to incompatible constructor signatures between Hed3Validator and the other two classes.
     *
     * @param {Schemas} hedSchemas The HED schema collection used for testing.
     * @param {Object<string, string>} testStrings A mapping of test strings.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
     * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
     * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
     */
    const validatorBase = function (hedSchemas, testStrings, expectedIssues, testFunction, testOptions = {}) {
      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
        const [parsedTestString, parsingIssues] = parseHedString(testString, hedSchemas)
        const validator = new Hed3Validator(parsedTestString, hedSchemas, null, testOptions)
        testFunction(validator)
        const issues = [].concat(...Object.values(parsingIssues), validator.issues)
        assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
      }
    }

    /**
     * HED 3 semantic validation base function.
     *
     * This base function uses the HED 3-specific {@link Hed3Validator} validator class.
     *
     * @param {Object<string, string>} testStrings A mapping of test strings.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
     * @param {function(Hed3Validator): void} testFunction A test-specific function that executes the required validation check.
     * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
     */
    const validatorSemanticBase = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        validatorBase(hedSchemas, testStrings, expectedIssues, testFunction, testOptions)
      })
    }

    describe('Full HED Strings', () => {
      const validatorSemantic = validatorSemanticBase

      it('properly validate short tags', () => {
        const testStrings = {
          simple: 'Car',
          groupAndValues: '(Train/Maglev,Age/15,RGB-red/0.5),Operate',
          invalidUnit: 'Duration/20 cm',
          duplicateSame: 'Train,Train',
          duplicateSimilar: 'Train,Vehicle/Train',
          missingChild: 'Label',
        }
        const legalTimeUnits = ['s', 'second', 'day', 'minute', 'hour']
        const expectedIssues = {
          simple: [],
          groupAndValues: [],
          invalidUnit: [
            generateIssue('unitClassInvalidUnit', {
              tag: 'Duration/20 cm',
              unitClassUnits: legalTimeUnits.sort().join(','),
            }),
          ],
          duplicateSame: [
            generateIssue('duplicateTag', {
              tag: 'Train',
              bounds: [0, 5],
            }),
            generateIssue('duplicateTag', {
              tag: 'Train',
              bounds: [6, 11],
            }),
          ],
          duplicateSimilar: [
            generateIssue('duplicateTag', {
              tag: 'Train',
              bounds: [0, 5],
            }),
            generateIssue('duplicateTag', {
              tag: 'Vehicle/Train',
              bounds: [6, 19],
            }),
          ],
          missingChild: [
            generateIssue('childRequired', {
              tag: 'Label',
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator) => {
          validator.validateEventLevel()
        })
      })

      it('should not validate strings with short-to-long conversion errors', () => {
        const testStrings = {
          // Duration/20 cm is an obviously invalid tag that should not be caught due to the first error.
          red: 'Property/RGB-red, Duration/20 cm',
          redAndBlue: 'Property/RGB-red, Property/RGB-blue, Duration/20 cm',
        }
        const expectedIssues = {
          red: [
            converterGenerateIssue(
              'invalidParentNode',
              testStrings.red,
              {
                parentTag: 'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red',
              },
              [9, 16],
            ),
          ],
          redAndBlue: [
            converterGenerateIssue(
              'invalidParentNode',
              testStrings.redAndBlue,
              {
                parentTag: 'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red',
              },
              [9, 16],
            ),
            converterGenerateIssue(
              'invalidParentNode',
              testStrings.redAndBlue,
              {
                parentTag: 'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-blue',
              },
              [27, 35],
            ),
          ],
        }
        // This is a no-op since short-to-long conversion errors are handled in the string parsing phase.
        // eslint-disable-next-line no-unused-vars
        return validatorSemantic(testStrings, expectedIssues, (validator) => {})
      })
    })

    describe('Individual HED Tags', () => {
      /**
       * HED 3 individual tag semantic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(Hed3Validator, ParsedHedTag, ParsedHedTag): void} testFunction A test-specific function that executes the required validation check.
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

      /**
       * HED 3 individual tag semantic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, string>} testDefinitions A mapping of test definitions.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(Hed3Validator, ParsedHedTag): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemanticWithDefinitions = function (
        testStrings,
        testDefinitions,
        expectedIssues,
        testFunction,
        testOptions,
      ) {
        const definitionMap = new Map()
        return validatorSemanticBase(
          testStrings,
          expectedIssues,
          (validator) => {
            if (definitionMap.size === 0) {
              for (const value of Object.values(testDefinitions)) {
                const parsedString = parseHedString(value, validator.hedSchemas)[0]
                for (const def of parsedString.definitionGroups) {
                  definitionMap.set(def.definitionName, def.definitionGroup)
                }
              }
            }
            validator.definitions = definitionMap
            for (const tag of validator.parsedString.tags) {
              testFunction(validator, tag)
            }
          },
          testOptions,
        )
      }

      it('should exist in the schema or be an allowed extension', () => {
        const testStrings = {
          takesValue: 'Duration/3 ms',
          full: 'Left-side-of',
          extensionAllowed: 'Human/Driver',
          leafExtension: 'Sensory-event/Something',
          nonExtensionAllowed: 'Event/Nonsense',
          illegalComma: 'Label/This_is_a_label,This/Is/A/Tag',
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
            converterGenerateIssue('invalidTag', testStrings.illegalComma, { tag: 'This' }, [22, 26]),
            generateIssue('extraCommaOrInvalid', {
              previousTag: 'Label/This_is_a_label',
              tag: 'This/Is/A/Tag',
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

      it('should have a proper unit when required', () => {
        const testStrings = {
          correctUnit: 'Duration/3 ms',
          correctUnitScientific: 'Duration/3.5e1 ms',
          correctSingularUnit: 'Duration/1 millisecond',
          correctPluralUnit: 'Duration/3 milliseconds',
          correctNoPluralUnit: 'Frequency/3 hertz',
          correctNonSymbolCapitalizedUnit: 'Duration/3 MilliSeconds',
          correctSymbolCapitalizedUnit: 'Frequency/3 kHz',
          missingRequiredUnit: 'Duration/3',
          incorrectUnit: 'Duration/3 cm',
          incorrectNonNumericValue: 'Duration/A ms',
          incorrectPluralUnit: 'Frequency/3 hertzs',
          incorrectSymbolCapitalizedUnit: 'Frequency/3 hz',
          incorrectSymbolCapitalizedUnitModifier: 'Frequency/3 KHz',
          incorrectNonSIUnitModifier: 'Duration/1 millihour',
          incorrectNonSIUnitSymbolModifier: 'Speed/100 Mkph',
          notRequiredNumber: 'RGB-red/0.5',
          notRequiredScientific: 'RGB-red/5e-1',
          /*properTime: 'Clockface/08:30',
          invalidTime: 'Clockface/54:54',*/
        }
        const legalTimeUnits = ['s', 'second', 'day', 'minute', 'hour']
        // const legalClockTimeUnits = ['hour:min', 'hour:min:sec']
        const legalFrequencyUnits = ['Hz', 'hertz']
        const legalSpeedUnits = ['m-per-s', 'kph', 'mph']
        const expectedIssues = {
          correctUnit: [],
          correctUnitScientific: [],
          correctSingularUnit: [],
          correctPluralUnit: [],
          correctNoPluralUnit: [],
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
          /*properTime: [],
          invalidTime: [
            generateIssue('unitClassInvalidUnit', {
              tag: testStrings.invalidTime,
              unitClassUnits: legalClockTimeUnits.sort().join(','),
            }),
          ],*/
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

      it('should not contain undefined definitions', () => {
        const testDefinitions = {
          greenTriangle: '(Definition/GreenTriangleDefinition/#, (RGB-green/#, Triangle))',
          train: '(Definition/TrainDefinition, (Train))',
          yellowCube: '(Definition/CubeDefinition, (Yellow, Cube))',
        }
        const testStrings = {
          greenTriangleDef: '(Def/GreenTriangleDefinition/0.5, Width/15 cm)',
          trainDefExpand: '(Def-expand/TrainDefinition, Age/20)',
          yellowCubeDef: '(Def/CubeDefinition, Volume/50 m^3)',
          invalidDef: '(Def/InvalidDefinition, Square)',
          invalidDefExpand: '(Def-expand/InvalidDefExpand, Circle)',
        }
        const expectedIssues = {
          greenTriangleDef: [],
          trainDefExpand: [],
          yellowCubeDef: [],
          invalidDef: [generateIssue('missingDefinition', { def: 'InvalidDefinition' })],
          invalidDefExpand: [generateIssue('missingDefinition', { def: 'InvalidDefExpand' })],
        }
        return validatorSemanticWithDefinitions(testStrings, testDefinitions, expectedIssues, (validator, tag) => {
          validator.checkForMissingDefinitions(tag, 'Def')
          validator.checkForMissingDefinitions(tag, 'Def-expand')
        })
      })
    })

    describe('HED Tag Groups', () => {
      /**
       * HED 3 tag group semantic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(Hed3Validator, ParsedHedGroup): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        validatorSemanticBase(
          testStrings,
          expectedIssues,
          (validator) => {
            for (const parsedTagGroup of validator.parsedString.tagGroups) {
              testFunction(validator, parsedTagGroup)
            }
          },
          testOptions,
        )
      }

      it('should have syntactically valid definitions', () => {
        const testStrings = {
          nonDefinition: 'Car',
          nonDefinitionGroup: '(Train/Maglev, Age/15, RGB-red/0.5)',
          definitionOnly: '(Definition/SimpleDefinition)',
          tagGroupDefinition: '(Definition/TagGroupDefinition, (Square, RGB-blue))',
          illegalSiblingDefinition: '(Definition/IllegalSiblingDefinition, Train, (Rectangle))',
          nestedDefinition: '(Definition/NestedDefinition, (Touchscreen, (Definition/InnerDefinition, (Square))))',
          multipleTagGroupDefinition: '(Definition/MultipleTagGroupDefinition, (Touchscreen), (Square))',
          defExpandOnly: '(Def-expand/SimpleDefExpand)',
          tagGroupDefExpand: '(Def-expand/TagGroupDefExpand, (Square, RGB-blue))',
          illegalSiblingDefExpand: '(Def-expand/IllegalSiblingDefExpand, Train, (Rectangle))',
          nestedDefExpand: '(Def-expand/NestedDefExpand, (Touchscreen, (Def-expand/InnerDefExpand, (Square))))',
          multipleTagGroupDefExpand: '(Def-expand/MultipleTagGroupDefExpand, (Touchscreen), (Square))',
          mixedDefinitionFirst: '(Definition/DefinitionFirst, Def-expand/DefExpandSecond, (Square))',
          mixedDefExpandFirst: '(Def-expand/DefExpandFirst, Definition/DefinitionSecond, (Square))',
          defNestedInDefinition: '(Definition/DefNestedInDefinition, (Def/Nested, Triangle))',
          defNestedInDefExpand: '(Def-expand/DefNestedInDefExpand, (Def/Nested, Triangle))',
        }
        const expectedIssues = {
          nonDefinition: [],
          nonDefinitionGroup: [],
          definitionOnly: [],
          tagGroupDefinition: [],
          illegalSiblingDefinition: [
            generateIssue('illegalDefinitionGroupTag', {
              tag: 'Train',
              definition: 'IllegalSiblingDefinition',
            }),
          ],
          nestedDefinition: [
            generateIssue('nestedDefinition', {
              definition: 'NestedDefinition',
            }),
          ],
          multipleTagGroupDefinition: [
            generateIssue('multipleTagGroupsInDefinition', {
              definition: 'MultipleTagGroupDefinition',
            }),
          ],
          defExpandOnly: [],
          tagGroupDefExpand: [],
          illegalSiblingDefExpand: [
            generateIssue('illegalDefinitionGroupTag', {
              tag: 'Train',
              definition: 'IllegalSiblingDefExpand',
            }),
          ],
          nestedDefExpand: [
            generateIssue('nestedDefinition', {
              definition: 'NestedDefExpand',
            }),
          ],
          multipleTagGroupDefExpand: [
            generateIssue('multipleTagGroupsInDefinition', {
              definition: 'MultipleTagGroupDefExpand',
            }),
          ],
          mixedDefinitionFirst: [
            generateIssue('illegalDefinitionGroupTag', {
              tag: 'Def-expand/DefExpandSecond',
              definition: 'DefinitionFirst',
            }),
          ],
          mixedDefExpandFirst: [
            generateIssue('illegalDefinitionGroupTag', {
              tag: 'Definition/DefinitionSecond',
              definition: 'DefExpandFirst',
            }),
          ],
          defNestedInDefinition: [
            generateIssue('nestedDefinition', {
              definition: 'DefNestedInDefinition',
            }),
          ],
          defNestedInDefExpand: [
            generateIssue('nestedDefinition', {
              definition: 'DefNestedInDefExpand',
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkDefinitionSyntax(tagGroup)
        })
      })
    })

    describe('Top-level Tags', () => {
      const validatorSemantic = validatorSemanticBase

      it('should not have invalid top-level tags', () => {
        const testStrings = {
          validDef: 'Def/TopLevelDefReference',
          validDefExpand: '(Def-expand/ValidDefExpand)',
          invalidDefExpand: 'Def-expand/InvalidDefExpand',
        }
        const expectedIssues = {
          validDef: [],
          validDefExpand: [],
          invalidDefExpand: [
            generateIssue('invalidTopLevelTag', {
              tag: testStrings.invalidDefExpand,
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator) => {
          validator.checkForInvalidTopLevelTags()
        })
      })
    })

    describe('Top-level Group Tags', () => {
      const validatorSemantic = validatorSemanticBase

      it('should not have definitions at the top level', () => {
        const testStrings = {
          validDefinition: '(Definition/SimpleDefinition)',
          validDef: 'Def/TopLevelDefReference',
          invalidDefinition: 'Definition/TopLevelDefinition',
          invalidDouble: '(Definition/DoubleDefinition, Onset)',
        }
        const expectedIssues = {
          validDefinition: [],
          validDef: [],
          invalidDefinition: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: testStrings.invalidDefinition,
            }),
          ],
          invalidDouble: [
            generateIssue('multipleTopLevelTagGroupTags', {
              tag: 'Onset',
              otherTag: 'Definition/DoubleDefinition',
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator) => {
          validator.checkForInvalidTopLevelTagGroupTags()
        })
      })
    })

    describe('HED Strings', () => {
      const validatorSemantic = function (testStrings, expectedIssues, expectValuePlaceholderString = false) {
        return validatorSemanticBase(
          testStrings,
          expectedIssues,
          (validator) => {
            validator.validateStringLevel()
          },
          { expectValuePlaceholderString: expectValuePlaceholderString },
        )
      }

      it('should have valid placeholders', () => {
        const expectedPlaceholdersTestStrings = {
          noPlaceholders: 'Car',
          noPlaceholderGroup: '(Train, Age/15, RGB-red/0.5)',
          noPlaceholderDefinitionGroup: '(Definition/SimpleDefinition)',
          noPlaceholderTagGroupDefinition: '(Definition/TagGroupDefinition, (Square, RGB-blue))',
          singlePlaceholder: 'RGB-green/#',
          definitionPlaceholder: '(Definition/PlaceholderDefinition/#, (RGB-green/#))',
          definitionPlaceholderWithTag: 'Car, (Definition/PlaceholderWithTagDefinition/#, (RGB-green/#))',
          singlePlaceholderWithValidDefinitionPlaceholder:
            'Duration/#, (Definition/SinglePlaceholderWithValidPlaceholderDefinition/#, (RGB-green/#))',
          nestedDefinitionPlaceholder:
            '(Definition/NestedPlaceholderDefinition/#, (Touchscreen, (Square, RGB-blue/#)))',
          threePlaceholderDefinition: '(Definition/ThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#))',
          fourPlaceholderDefinition:
            '(Definition/FourPlaceholderDefinition/#, (RGB-green/#, (Cube, Volume/#, RGB-blue/#)))',
          multiPlaceholder: 'RGB-red/#, Circle, RGB-blue/#',
          multiPlaceholderWithValidDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithValidDefinition/#, (RGB-green/#)), RGB-blue/#',
          multiPlaceholderWithThreePlaceholderDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#)), Duration/#',
        }
        const noExpectedPlaceholdersTestStrings = {
          noPlaceholders: 'Car',
          noPlaceholderGroup: '(Train, Age/15, RGB-red/0.5)',
          noPlaceholderDefinitionGroup: '(Definition/SimpleDefinition)',
          noPlaceholderTagGroupDefinition: '(Definition/TagGroupDefinition, (Square, RGB-blue))',
          singlePlaceholder: 'RGB-green/#',
          definitionPlaceholder: '(Definition/PlaceholderDefinition/#, (RGB-green/#))',
          definitionPlaceholderWithTag: 'Car, (Definition/PlaceholderWithTagDefinition/#, (RGB-green/#))',
          singlePlaceholderWithValidDefinitionPlaceholder:
            'Duration/#, (Definition/SinglePlaceholderWithValidPlaceholderDefinition/#, (RGB-green/#))',
          nestedDefinitionPlaceholder:
            '(Definition/NestedPlaceholderDefinition/#, (Touchscreen, (Square, RGB-blue/#)))',
          threePlaceholderDefinition: '(Definition/ThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#))',
          fourPlaceholderDefinition:
            '(Definition/FourPlaceholderDefinition/#, (RGB-green/#, (Cube, Volume/#, RGB-blue/#)))',
          multiPlaceholder: 'RGB-red/#, Circle, RGB-blue/#',
          multiPlaceholderWithValidDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithValidDefinition/#, (RGB-green/#)), RGB-blue/#',
          multiPlaceholderWithThreePlaceholderDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#)), Duration/#',
        }
        const expectedPlaceholdersIssues = {
          noPlaceholders: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.noPlaceholders,
            }),
          ],
          noPlaceholderGroup: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.noPlaceholderGroup,
            }),
          ],
          noPlaceholderDefinitionGroup: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.noPlaceholderDefinitionGroup,
            }),
          ],
          noPlaceholderTagGroupDefinition: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.noPlaceholderTagGroupDefinition,
            }),
          ],
          singlePlaceholder: [],
          definitionPlaceholder: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.definitionPlaceholder,
            }),
          ],
          definitionPlaceholderWithTag: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.definitionPlaceholderWithTag,
            }),
          ],
          singlePlaceholderWithValidDefinitionPlaceholder: [],
          nestedDefinitionPlaceholder: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.nestedDefinitionPlaceholder,
            }),
          ],
          threePlaceholderDefinition: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.threePlaceholderDefinition,
            }),
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'ThreePlaceholderDefinition',
            }),
          ],
          fourPlaceholderDefinition: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.fourPlaceholderDefinition,
            }),
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'FourPlaceholderDefinition',
            }),
          ],
          multiPlaceholder: [
            generateIssue('invalidPlaceholder', { tag: 'RGB-red/#' }),
            generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#' }),
          ],
          multiPlaceholderWithValidDefinition: [
            generateIssue('invalidPlaceholder', { tag: 'RGB-red/#' }),
            generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#' }),
          ],
          multiPlaceholderWithThreePlaceholderDefinition: [
            generateIssue('invalidPlaceholder', { tag: 'RGB-red/#' }),
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'MultiPlaceholderWithThreePlaceholderDefinition',
            }),
            generateIssue('invalidPlaceholder', { tag: 'Duration/#' }),
          ],
        }
        const noExpectedPlaceholdersIssues = {
          noPlaceholders: [],
          noPlaceholderGroup: [],
          noPlaceholderDefinitionGroup: [],
          noPlaceholderTagGroupDefinition: [],
          singlePlaceholder: [generateIssue('invalidPlaceholder', { tag: 'RGB-green/#' })],
          definitionPlaceholder: [],
          definitionPlaceholderWithTag: [],
          singlePlaceholderWithValidDefinitionPlaceholder: [generateIssue('invalidPlaceholder', { tag: 'Duration/#' })],
          nestedDefinitionPlaceholder: [],
          threePlaceholderDefinition: [
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'ThreePlaceholderDefinition',
            }),
          ],
          fourPlaceholderDefinition: [
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'FourPlaceholderDefinition',
            }),
          ],
          multiPlaceholder: [
            generateIssue('invalidPlaceholder', { tag: 'RGB-red/#' }),
            generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#' }),
          ],
          multiPlaceholderWithValidDefinition: [
            generateIssue('invalidPlaceholder', { tag: 'RGB-red/#' }),
            generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#' }),
          ],
          multiPlaceholderWithThreePlaceholderDefinition: [
            generateIssue('invalidPlaceholder', { tag: 'RGB-red/#' }),
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'MultiPlaceholderWithThreePlaceholderDefinition',
            }),
            generateIssue('invalidPlaceholder', { tag: 'Duration/#' }),
          ],
        }
        return Promise.all([
          validatorSemantic(expectedPlaceholdersTestStrings, expectedPlaceholdersIssues, true),
          validatorSemantic(noExpectedPlaceholdersTestStrings, noExpectedPlaceholdersIssues, false),
        ])
      })
    })
  })
})

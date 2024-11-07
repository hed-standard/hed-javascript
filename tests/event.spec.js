import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import * as hed from '../validator/event'
import { buildSchemas } from '../schema/init'
import { parseHedString } from '../parser/parser'
import ParsedHedTag from '../parser/parsedHedTag'
import { HedValidator } from '../validator/event'
import { generateIssue } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { Schemas } from '../schema/containers'
import { TagSpec } from '../parser/tokenizer'

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

      //TODO: Remove this test -- the separate test for mismatched parentheses is no longer performed.
      it.skip('(REMOVE) should not have mismatched parentheses', () => {
        const testStrings = {
          extraOpening:
            'Action/Reach/To touch,((Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          // The extra comma is needed to avoid a comma error.
          extraClosing:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          wrongOrder:
            'Action/Reach/To touch,((Attribute/Object side/Left),Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px),(Attribute/Location/Screen/Left/23 px',
          valid:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
        }
        const expectedIssues = {
          extraOpening: [generateIssue('parentheses', { opening: 2, closing: 1 })],
          extraClosing: [generateIssue('parentheses', { opening: 1, closing: 2 })],
          wrongOrder: [generateIssue('unopenedParenthesis', { index: 121, string: testStrings.wrongOrder })],
          valid: [],
        }
        // No-op function as this check is done during the parsing stage.
        // eslint-disable-next-line no-unused-vars
        validatorSyntactic(testStrings, expectedIssues, (validator) => {})
      })

      // TODO: This test is replaced by tokenizer tests and should be removed
      it.skip('(REMOVE) should not have malformed delimiters', () => {
        const testStrings = {
          missingOpeningComma:
            'Action/Reach/To touch(Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          missingClosingComma:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm)Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          extraOpeningComma:
            ',Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          extraClosingComma:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px,',
          multipleExtraOpeningDelimiter:
            ',,Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          multipleExtraClosingDelimiter:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px,,',
          multipleExtraMiddleDelimiter:
            'Action/Reach/To touch,,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,,Attribute/Location/Screen/Left/23 px',
          valid:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px',
          validDoubleOpeningParentheses:
            'Action/Reach/To touch,((Attribute/Object side/Left,Participant/Effect/Body part/Arm),Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px),Event/Duration/3 ms',
          validDoubleClosingParentheses:
            'Action/Reach/To touch,(Attribute/Object side/Left,Participant/Effect/Body part/Arm,(Attribute/Location/Screen/Top/70 px,Attribute/Location/Screen/Left/23 px)),Event/Duration/3 ms',
        }
        const expectedIssues = {
          missingOpeningComma: [generateIssue('commaMissing', { tag: 'Action/Reach/To touch(' })],
          missingClosingComma: [
            generateIssue('commaMissing', {
              tag: 'Participant/Effect/Body part/Arm)',
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
              index: 22,
              string: testStrings.multipleExtraMiddleDelimiter,
            }),
            generateIssue('extraDelimiter', {
              character: ',',
              index: 121,
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

      // TODO: This test will be replaced by invalid character tests based on value classes
      it.skip('should not have invalid characters', () => {
        const testStrings = {
          openingBrace: 'Attribute/Object side/Left,Participant/Effect{Body part/Arm',
          closingBrace: 'Attribute/Object side/Left,Participant/Effect}/Body part/Arm',
          openingBracket: 'Attribute/Object side/Left,Participant/Effect[Body part/Arm',
          closingBracket: 'Attribute/Object side/Left,Participant/Effect]Body part/Arm',
          tilde: 'Attribute/Object side/Left,Participant/Effect~/Body part/Arm',
          doubleQuote: 'Attribute/Object side/Left,Participant/Effect"/Body part/Arm',
          null: 'Attribute/Object side/Left,Participant/Effect/Body part/Arm\0',
          tab: 'Attribute/Object side/Left,Participant/Effect/Body part/Arm\t',
        }
        const expectedIssues = {
          openingBrace: [
            generateIssue('invalidCharacter', {
              character: 'LEFT CURLY BRACKET',
              index: 45,
              string: testStrings.openingBrace,
            }),
          ],
          closingBrace: [
            generateIssue('unopenedCurlyBrace', {
              index: 45,
              string: testStrings.closingBrace,
            }),
          ],
          openingBracket: [
            generateIssue('invalidCharacter', {
              character: 'LEFT SQUARE BRACKET',
              index: 45,
              string: testStrings.openingBracket,
            }),
          ],
          closingBracket: [
            generateIssue('invalidCharacter', {
              character: 'RIGHT SQUARE BRACKET',
              index: 45,
              string: testStrings.closingBracket,
            }),
          ],
          tilde: [
            generateIssue('invalidCharacter', {
              character: 'TILDE',
              index: 45,
              string: testStrings.tilde,
            }),
          ],
          doubleQuote: [
            generateIssue('invalidCharacter', {
              character: 'QUOTATION MARK',
              index: 45,
              string: testStrings.doubleQuote,
            }),
          ],
          null: [
            generateIssue('invalidCharacter', {
              character: 'NULL',
              index: 59,
              string: testStrings.null,
            }),
          ],
          tab: [
            generateIssue('invalidCharacter', {
              character: 'CHARACTER TABULATION',
              index: 59,
              string: testStrings.tab,
            }),
          ],
        }
        // No-op function as this check is done during the parsing stage.
        // eslint-disable-next-line no-unused-vars
        validatorSyntactic(testStrings, expectedIssues, (validator) => {})
      })
    })

    describe.skip('HED Tag Levels', () => {
      /**
       * Tag level syntactic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator, ParsedHedSubstring[]): void} testFunction A test-specific function that executes the required validation check.
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
            testFunction(validator, validator.parsedString.parseTree)
          },
          testOptions,
        )
      }

      // TODO: Remove test as repeated in bidsTests
      it.skip('(REMOVE) should not contain duplicates - now in bidsTests', () => {
        const testStrings = {
          noDuplicate: 'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple',
          legalDuplicate: 'Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)',
          nestedLegalDuplicate:
            '(Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus))',
          legalDuplicateDifferentValue: '(Attribute/Language/Unit/Word/Brain,Attribute/Language/Unit/Word/Study)',
          twoNonDuplicateGroups: '(Red, Blue, (Green)), (Red, Blue, ((Green)))',
          //topLevelDuplicate: 'Event/Category/Experimental stimulus,Event/Category/Experimental stimulus',
          groupDuplicate:
            'Item/Object/Vehicle/Train,(Event/Category/Experimental stimulus,Attribute/Visual/Color/Purple,Event/Category/Experimental stimulus)',
          nestedGroupDuplicate:
            'Item/Object/Vehicle/Train,(Attribute/Visual/Color/Purple,(Event/Category/Experimental stimulus,Event/Category/Experimental stimulus))',
          twoDuplicateGroups: '(Red, Blue, (Green)), (Red, Blue, (Green))',
          repeatedGroup: '(Red, (Blue, Green, (Yellow)), Red, (Blue, Green, (Yellow)))',
        }
        const expectedIssues = {
          noDuplicate: [],
          legalDuplicate: [],
          nestedLegalDuplicate: [],
          legalDuplicateDifferentValue: [],
          twoNonDuplicateGroups: [],
          topLevelDuplicate: [
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
            }),
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
            }),
          ],
          groupDuplicate: [
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
            }),
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
            }),
          ],
          nestedGroupDuplicate: [
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
            }),
            generateIssue('duplicateTag', {
              tag: 'Event/Category/Experimental stimulus',
            }),
          ],
          twoDuplicateGroups: [
            generateIssue('duplicateTag', {
              tag: '(Red, Blue, (Green))',
            }),
            generateIssue('duplicateTag', {
              tag: '(Red, Blue, (Green))',
            }),
          ],
          repeatedGroup: [
            generateIssue('duplicateTag', {
              tag: 'Red',
            }),
            generateIssue('duplicateTag', {
              tag: 'Red',
            }),
            generateIssue('duplicateTag', {
              tag: '(Blue, Green, (Yellow))',
            }),
            generateIssue('duplicateTag', {
              tag: '(Blue, Green, (Yellow))',
            }),
          ],
        }
        validatorSyntactic(testStrings, expectedIssues, (validator, tagLevel) => {
          validator.checkForDuplicateTags(tagLevel)
        })
      })
    })
  })

  describe('HED-3G validation', () => {
    const hedSchemaFile = 'tests/data/HED8.3.0.xml'
    let hedSchemas

    beforeAll(async () => {
      const spec3 = new SchemaSpec('', '8.3.0', '', hedSchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec3)
      hedSchemas = await buildSchemas(specs)
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
        const validator = new HedValidator(parsedTestString, hedSchemas, null, testOptions)
        const flattenedParsingIssues = Object.values(parsingIssues).flat()
        if (flattenedParsingIssues.length === 0) {
          testFunction(validator)
        }
        const issues = [].concat(flattenedParsingIssues, validator.issues)
        assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
      }
    }

    /**
     * HED 3 semantic validation base function.
     *
     * This base function uses the HED 3-specific {@link HedValidator} validator class.
     *
     * @param {Object<string, string>} testStrings A mapping of test strings.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
     * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
     * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
     */
    const validatorSemanticBase = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
      validatorBase(hedSchemas, testStrings, expectedIssues, testFunction, testOptions)
    }

    describe('Full HED Strings', () => {
      const validatorSemantic = validatorSemanticBase

      // TODO: Remove - Units moved to bidsTests rest to stringParser tests
      it.skip('REMOVE properly validate short tags', () => {
        const testStrings = {
          simple: 'Car',
          groupAndValues: '(Train/Maglev,Age/15,RGB-red/0.5),Operate',
          invalidUnit: 'Time-value/20 cm',
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
              tag: 'Time-value/20 cm',
              unitClassUnits: legalTimeUnits.sort().join(','),
            }), //Now in bidsTests
          ],
          duplicateSame: [
            generateIssue('duplicateTag', {
              tag: 'Train',
            }),
            generateIssue('duplicateTag', {
              tag: 'Train',
            }),
          ],
          duplicateSimilar: [
            generateIssue('duplicateTag', {
              tag: 'Train',
            }),
            generateIssue('duplicateTag', {
              tag: 'Vehicle/Train',
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

      // TODO: REMOVE: The testing of units should be in the stringParser
      it.skip('Test in string-parser should not validate strings with short-to-long conversion errors', () => {
        const testStrings = {
          // Duration/20 cm is an obviously invalid tag that should not be caught due to the first error.
          red: 'Property/RGB-red, Duration/20 cm',
          redAndBlue: 'Property/RGB-red, Property/RGB-blue/Blah, Duration/20 cm',
        }
        const expectedIssues = {
          red: [
            generateIssue('invalidParentNode', {
              tag: 'RGB-red',
              parentTag: 'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red',
            }),
          ],
          redAndBlue: [
            generateIssue('invalidParentNode', {
              tag: 'RGB-red',
              parentTag: 'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red',
            }),
            generateIssue('invalidParentNode', {
              tag: 'RGB-blue',
              parentTag: 'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-blue',
            }),
          ],
        }
        // This is a no-op since short-to-long conversion errors are handled in the string parsing phase.
        // eslint-disable-next-line no-unused-vars
        return validatorSemantic(testStrings, expectedIssues, (validator) => {})
      })

      it.skip('should not have overlapping onsets and offsets in the same string', () => {
        const testStrings = {
          onsetAndOffsetWithDifferentValues: '(Def/Acc/5.4, Offset), (Def/Acc/4.3, Onset)',
          sameOffsetAndOnset: '(Def/MyColor, Offset), (Def/MyColor, Onset)',
          sameOnsetAndOffset: '(Def/MyColor, Onset), (Def/MyColor, Offset)',
          duplicateOnset: '(Def/MyColor, (Red), Onset), (Def/MyColor, Onset)',
        }
        const expectedIssues = {
          onsetAndOffsetWithDifferentValues: [],
          sameOffsetAndOnset: [
            generateIssue('duplicateTemporal', { string: testStrings.sameOffsetAndOnset, definition: 'MyColor' }),
          ],
          sameOnsetAndOffset: [
            generateIssue('duplicateTemporal', { string: testStrings.sameOnsetAndOffset, definition: 'MyColor' }),
          ],
          duplicateOnset: [
            generateIssue('duplicateTemporal', { string: testStrings.duplicateOnset, definition: 'MyColor' }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator) => {
          validator.validateEventLevel()
        })
      })
    })

    describe('Individual HED Tags', () => {
      /**
       * HED 3 individual tag semantic validation base function.
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
            let previousTag = new ParsedHedTag(new TagSpec('Sad', 0, 3, ''), validator.hedSchemas, 'Sad')
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
       * @param {function(HedValidator, ParsedHedTag): void} testFunction A test-specific function that executes the required validation check.
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

      // TODO: Already covered in stringParserTests -- units still to move down.
      it.skip('(REMOVE) should exist in the schema or be an allowed extension', () => {
        const testStrings = {
          takesValue: 'Time-value/3 ms',
          full: 'Left-side-of',
          extensionAllowed: 'Human/Driver',
          leafExtension: 'Sensory-event/Something',
          nonExtensionAllowed: 'Event/Nonsense',
          illegalComma: 'Label/This_is_a_label,This/Is/A/Tag',
          placeholder: 'Train/#',
        }
        const expectedIssues = {
          takesValue: [],
          full: [],
          extensionAllowed: [generateIssue('extension', { tag: testStrings.extensionAllowed })],
          leafExtension: [generateIssue('invalidExtension', { tag: 'Something', parentTag: 'Event/Sensory-event' })],
          nonExtensionAllowed: [
            generateIssue('invalidExtension', {
              tag: 'Nonsense',
              parentTag: 'Event',
            }),
          ],
          illegalComma: [
            generateIssue('invalidTag', { tag: 'This/Is/A/Tag' }),
            /* Intentionally not thrown (validation ends at parsing stage)
            generateIssue('extraCommaOrInvalid', {
              previousTag: 'Label/This_is_a_label',
              tag: 'This/Is/A/Tag',
            }),
           */
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

      // TODO: Wait to generate tests until detection moved to stringParser.
      it('should have a proper unit when required', () => {
        const testStrings = {
          correctUnit: 'Time-value/3 ms',
          correctUnitScientific: 'Time-value/3.5e1 ms',
          correctSingularUnit: 'Time-value/1 millisecond',
          correctPluralUnit: 'Time-value/3 milliseconds',
          correctNoPluralUnit: 'Frequency/3 hertz',
          correctNonSymbolCapitalizedUnit: 'Time-value/3 MilliSeconds',
          correctSymbolCapitalizedUnit: 'Frequency/3 kHz',
          missingRequiredUnit: 'Time-value/3',
          incorrectUnit: 'Time-value/3 cm',
          incorrectNonNumericValue: 'Time-value/A ms',
          incorrectPluralUnit: 'Frequency/3 hertzs',
          incorrectSymbolCapitalizedUnit: 'Frequency/3 hz',
          incorrectSymbolCapitalizedUnitModifier: 'Frequency/3 KHz',
          incorrectNonSIUnitModifier: 'Time-value/1 millihour',
          incorrectNonSIUnitSymbolModifier: 'Speed/100 Mkph',
          notRequiredNumber: 'RGB-red/0.5',
          notRequiredScientific: 'RGB-red/5e-1',
          /*properTime: 'Clockface/08:30',
        invalidTime: 'Clockface/54:54',*/
        }
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
              unitClassUnits: 'day,hour,minute,month,s,second,year',
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
              unitClassUnits: 'day,hour,minute,month,s,second,year',
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
          /*
          properTime: [],
          invalidTime: [
            generateIssue('unitClassInvalidUnit', {
              tag: testStrings.invalidTime,
              unitClassUnits: legalClockTimeUnits.sort().join(','),
            }),
          ],
          */
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

      // TODO: BIDS sidecar validation does not detect missing definitions (under definition-tests in bidsTests)
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
          invalidDef: [generateIssue('missingDefinition', { definition: 'InvalidDefinition' })],
          invalidDefExpand: [generateIssue('missingDefinition', { definition: 'InvalidDefExpand' })],
        }
        return validatorSemanticWithDefinitions(testStrings, testDefinitions, expectedIssues, (validator, tag) => {
          validator.checkForMissingDefinitions(tag, 'Def')
          validator.checkForMissingDefinitions(tag, 'Def-expand')
        })
      })

      // TODO: The requireChild seems to be hardcoded somewhere as stringParser doesn't require it.
      it.skip('(INCORRECT REWRITE) should have a child when required', () => {
        const testStrings = {
          noRequiredChild: 'Red',
          hasRequiredChild: 'Label/Blah',
          missingChild: 'Label',
          longMissingChild: 'Property/Informational-property/Label',
        }
        const expectedIssues = {
          noRequiredChild: [],
          hasRequiredChild: [],
          missingChild: [
            generateIssue('childRequired', {
              tag: testStrings.missingChild,
            }),
          ],
          longMissingChild: [
            generateIssue('childRequired', {
              tag: testStrings.longMissingChild,
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator) => {
          validator.validateEventLevel()
        })
      })
    })

    describe('HED Tag Groups', () => {
      /**
       * HED 3 tag group semantic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator, ParsedHedGroup): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        return validatorSemanticBase(
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

      // TODO: Equivalent tests now in bidsTests -- but only work for sidecar
      it('should have syntactically valid definitions', () => {
        const testStrings = {
          nonDefinition: 'Car',
          nonDefinitionGroup: '(Train/Maglev, Age/15, RGB-red/0.5)',
          definitionOnly: '(Definition/SimpleDefinition)',
          tagGroupDefinition: '(Definition/TagGroupDefinition, (Square, RGB-blue))',
          illegalSiblingDefinition: '(Definition/IllegalSiblingDefinition, Train, (Rectangle))',
          nestedDefinition: '(Definition/NestedDefinition, (Touchscreen, (Definition/InnerDefinition, (Square))))',
          multipleTagGroupDefinition: '(Definition/MultipleTagGroupDefinition, (Touchscreen), (Square))',
          defNestedInDefinition: '(Definition/DefNestedInDefinition, (Def/Nested, Triangle))',
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
          defNestedInDefinition: [
            generateIssue('nestedDefinition', {
              definition: 'DefNestedInDefinition',
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkDefinitionGroupSyntax(tagGroup)
        })
      })

      it.each(['Onset', 'Inset'])('should have syntactically valid %s tags', (temporalTagName) => {
        const testStrings = {
          simple: `(${temporalTagName}, Def/Acc/5.4)`,
          defAndOneGroup: `(${temporalTagName}, Def/MyColor, (Red))`,
          defExpandAndOneGroup: `(${temporalTagName}, (Def-expand/MyColor, (Label/Pie)), (Red))`,
          noTag: `(${temporalTagName})`,
          definition: `(${temporalTagName}, Definition/MyColor, (Label/Pie))`,
          defAndTwoGroups: `(Def/DefAndTwoGroups, (Blue), (Green), ${temporalTagName})`,
          defExpandAndTwoGroups: `((Def-expand/DefExpandAndTwoGroups, (Label/Pie)), (Green), (Red), ${temporalTagName})`,
          tagAndNoDef: `(${temporalTagName}, Red)`,
          tagGroupAndNoDef: `(${temporalTagName}, (Red))`,
          defAndTag: `(${temporalTagName}, Def/DefAndTag, Red)`,
          defTagAndTagGroup: `(${temporalTagName}, Def/DefTagAndTagGroup, (Red), Blue)`,
          multipleDefs: `(${temporalTagName}, Def/MyColor, Def/Acc/5.4)`,
          defAndDefExpand: `((Def-expand/MyColor, (Label/Pie)), Def/Acc/5.4, ${temporalTagName})`,
          multipleDefinitionsAndExtraTagGroups: `((Def-expand/MyColor, (Label/Pie)), Def/Acc/5.4, ${temporalTagName}, (Blue), (Green))`,
        }
        const expectedIssues = {
          simple: [],
          defAndOneGroup: [],
          defExpandAndOneGroup: [],
          noTag: [generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.noTag, tag: temporalTagName })],
          definition: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.definition, tag: temporalTagName }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: temporalTagName }),
          ],
          defAndTwoGroups: [
            generateIssue('extraTagsInTemporal', { definition: 'DefAndTwoGroups', tag: temporalTagName }),
          ],
          defExpandAndTwoGroups: [
            generateIssue('extraTagsInTemporal', { definition: 'DefExpandAndTwoGroups', tag: temporalTagName }),
          ],
          tagAndNoDef: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.tagAndNoDef, tag: temporalTagName }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: temporalTagName }),
          ],
          tagGroupAndNoDef: [
            generateIssue('temporalWithoutDefinition', {
              tagGroup: testStrings.tagGroupAndNoDef,
              tag: temporalTagName,
            }),
          ],
          defAndTag: [generateIssue('extraTagsInTemporal', { definition: 'DefAndTag', tag: temporalTagName })],
          defTagAndTagGroup: [
            generateIssue('extraTagsInTemporal', { definition: 'DefTagAndTagGroup', tag: temporalTagName }),
          ],
          multipleDefs: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.multipleDefs,
              tag: temporalTagName,
            }),
          ],
          defAndDefExpand: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.defAndDefExpand,
              tag: temporalTagName,
            }),
          ],
          multipleDefinitionsAndExtraTagGroups: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.multipleDefinitionsAndExtraTagGroups,
              tag: temporalTagName,
            }),
            generateIssue('extraTagsInTemporal', {
              definition: 'Multiple definition tags found',
              tag: temporalTagName,
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkTemporalSyntax(tagGroup)
        })
      })

      it('should have syntactically valid offsets', () => {
        const testStrings = {
          simple: '(Offset, Def/Acc/5.4)',
          noTag: '(Offset)',
          tagAndNoDef: '(Offset, Red)',
          tagGroupAndNoDef: '(Offset, (Red))',
          defAndTag: '(Offset, Def/DefAndTag, Red)',
          defExpandAndTag: '((Def-expand/DefExpandAndTag, (Label/Pie)), Offset, Red)',
          defAndTagGroup: '(Offset, Def/DefAndTagGroup, (Red))',
          defTagAndTagGroup: '(Offset, Def/DefTagAndTagGroup, (Red), Blue)',
          defExpandAndTagGroup: '((Def-expand/DefExpandAndTagGroup, (Label/Pie)), Offset, (Red))',
          multipleDefs: '(Offset, Def/MyColor, Def/Acc/5.4)',
          defAndDefExpand: '((Def-expand/MyColor, (Label/Pie)), Def/Acc/5.4, Offset)',
          multipleDefinitionsAndExtraTagGroups:
            '((Def-expand/MyColor, (Label/Pie)), Def/Acc/5.4, Offset, (Blue), (Green))',
        }
        const expectedIssues = {
          simple: [],
          noTag: [generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.noTag, tag: 'Offset' })],
          tagAndNoDef: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.tagAndNoDef, tag: 'Offset' }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: 'Offset' }),
          ],
          tagGroupAndNoDef: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.tagGroupAndNoDef, tag: 'Offset' }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: 'Offset' }),
          ],
          defAndTag: [generateIssue('extraTagsInTemporal', { definition: 'DefAndTag', tag: 'Offset' })],
          defExpandAndTag: [generateIssue('extraTagsInTemporal', { definition: 'DefExpandAndTag', tag: 'Offset' })],
          defAndTagGroup: [generateIssue('extraTagsInTemporal', { definition: 'DefAndTagGroup', tag: 'Offset' })],
          defTagAndTagGroup: [generateIssue('extraTagsInTemporal', { definition: 'DefTagAndTagGroup', tag: 'Offset' })],
          defExpandAndTagGroup: [
            generateIssue('extraTagsInTemporal', { definition: 'DefExpandAndTagGroup', tag: 'Offset' }),
          ],
          multipleDefs: [
            generateIssue('temporalWithMultipleDefinitions', { tagGroup: testStrings.multipleDefs, tag: 'Offset' }),
          ],
          defAndDefExpand: [
            generateIssue('temporalWithMultipleDefinitions', { tagGroup: testStrings.defAndDefExpand, tag: 'Offset' }),
          ],
          multipleDefinitionsAndExtraTagGroups: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.multipleDefinitionsAndExtraTagGroups,
              tag: 'Offset',
            }),
            generateIssue('extraTagsInTemporal', { definition: 'Multiple definition tags found', tag: 'Offset' }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkTemporalSyntax(tagGroup)
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

      it('should only have definitions, onsets, or offsets in top-level tag groups', () => {
        const testStrings = {
          validDefinition: '(Definition/SimpleDefinition)',
          multipleDefinitions: '(Definition/FirstDefinition), (Definition/SecondDefinition)',
          validOnset: '(Onset, Def/Acc/5.4 m-per-s^2)',
          validOffset: '(Offset, Def/Acc/5.4 m-per-s^2)',
          topLevelDefinition: 'Definition/TopLevelDefinition',
          //topLevelPlaceholderDefinition: 'Definition/TopLevelPlaceholderDefinition/#',
          topLevelOnset: 'Onset, Red',
          topLevelOffset: 'Offset, Def/Acc/5.4 m-per-s^2',
          nestedDefinition: '((Definition/SimpleDefinition), Red)',
          nestedOnset: '((Onset, Def/MyColor), Red)',
          nestedOffset: '((Offset, Def/MyColor), Red)',
        }
        const expectedIssues = {
          validDefinition: [],
          multipleDefinitions: [],
          validOnset: [],
          validOffset: [],
          topLevelDefinition: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: testStrings.topLevelDefinition,
            }),
          ],
          topLevelPlaceholderDefinition: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: testStrings.topLevelPlaceholderDefinition,
            }),
          ],
          topLevelOnset: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Onset',
            }),
          ],
          topLevelOffset: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Offset',
            }),
          ],
          nestedDefinition: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Definition/SimpleDefinition',
            }),
          ],
          nestedOnset: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Onset',
            }),
          ],
          nestedOffset: [
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Offset',
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

      // TODO: Remove -- now in tokenizer tests
      it('(REMOVE) should properly handle strings with placeholders', () => {
        const testStrings = {
          takesValue: 'RGB-red/#',
          withUnit: 'Time-value/# ms',
          child: 'Left-side-of/#',
          extensionAllowed: 'Human/Driver/#',
          extensionParent: 'Item/TestDef1/#',
          missingRequiredUnit: 'Time-value/#',
          wrongLocation: 'Item/#/OtherItem',
          duplicatePlaceholder: 'Item/#/#',
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
          extensionParent: [
            generateIssue('invalidPlaceholder', {
              tag: testStrings.extensionParent,
            }),
          ],
          missingRequiredUnit: [],
          wrongLocation: [
            generateIssue('invalidPlaceholder', {
              index: '16',
              string: testStrings.wrongLocation,
              tag: testStrings.wrongLocation,
            }),
          ],
          duplicatePlaceholder: [
            generateIssue('invalidPlaceholder', {
              index: '8',
              string: testStrings.duplicatePlaceholder,
              tag: testStrings.duplicatePlaceholder,
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, true)
      })

      // TODO: Remove -- now in bidsTests as definition-tests
      it('should have valid placeholders in definitions', () => {
        const expectedPlaceholdersTestStrings = {
          noPlaceholders: 'Car',
          noPlaceholderGroup: '(Train, Age/15, RGB-red/0.5)',
          noPlaceholderTagGroupDefinition: '(Definition/TagGroupDefinition, (Square, RGB-blue))',
          noPlaceholderDefinitionWithFixedValue: '(Definition/FixedTagGroupDefinition/Test, (Square, RGB-blue))',
          singlePlaceholder: 'RGB-green/#',
          definitionPlaceholder: '(Definition/PlaceholderDefinition/#, (RGB-green/#))',
          definitionPlaceholderWithFixedValue: '(Definition/FixedPlaceholderDefinition/Test, (RGB-green/#))',
          definitionPlaceholderWithTag: 'Car, (Definition/PlaceholderWithTagDefinition/#, (RGB-green/#))',
          singlePlaceholderWithValidDefinitionPlaceholder:
            'Time-value/#, (Definition/SinglePlaceholderWithValidPlaceholderDefinition/#, (RGB-green/#))',
          nestedDefinitionPlaceholder:
            '(Definition/NestedPlaceholderDefinition/#, (Touchscreen, (Square, RGB-blue/#)))',
          threePlaceholderDefinition: '(Definition/ThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#))',
          fourPlaceholderDefinition:
            '(Definition/FourPlaceholderDefinition/#, (RGB-green/#, (Cube, Volume/#, RGB-blue/#)))',
          multiPlaceholder: 'RGB-red/#, Circle, RGB-blue/#',
          multiPlaceholderWithValidDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithValidDefinition/#, (RGB-green/#)), RGB-blue/#',
          multiPlaceholderWithThreePlaceholderDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#)), Time-value/#',
        }
        const noExpectedPlaceholdersTestStrings = {
          noPlaceholders: 'Car',
          noPlaceholderGroup: '(Train, Age/15, RGB-red/0.5)',
          noPlaceholderTagGroupDefinition: '(Definition/TagGroupDefinition, (Square, RGB-blue))',
          noPlaceholderDefinitionWithFixedValue: '(Definition/FixedTagGroupDefinition/Test, (Square, RGB-blue))',
          singlePlaceholder: 'RGB-green/#',
          definitionPlaceholder: '(Definition/PlaceholderDefinition/#, (RGB-green/#))',
          definitionPlaceholderWithFixedValue: '(Definition/FixedPlaceholderDefinition/Test, (RGB-green/#))',
          definitionPlaceholderWithTag: 'Car, (Definition/PlaceholderWithTagDefinition/#, (RGB-green/#))',
          singlePlaceholderWithValidDefinitionPlaceholder:
            'Time-value/#, (Definition/SinglePlaceholderWithValidPlaceholderDefinition/#, (RGB-green/#))',
          nestedDefinitionPlaceholder:
            '(Definition/NestedPlaceholderDefinition/#, (Touchscreen, (Square, RGB-blue/#)))',
          threePlaceholderDefinition: '(Definition/ThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#))',
          fourPlaceholderDefinition:
            '(Definition/FourPlaceholderDefinition/#, (RGB-green/#, (Cube, Volume/#, RGB-blue/#)))',
          multiPlaceholder: 'RGB-red/#, Circle, RGB-blue/#',
          multiPlaceholderWithValidDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithValidDefinition/#, (RGB-green/#)), RGB-blue/#',
          multiPlaceholderWithThreePlaceholderDefinition:
            'RGB-red/#, Circle, (Definition/MultiPlaceholderWithThreePlaceholderDefinition/#, (RGB-green/#, RGB-blue/#)), Time-value/#',
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
          noPlaceholderDefinitionWithFixedValue: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.noPlaceholderDefinitionWithFixedValue,
            }),
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'FixedTagGroupDefinition',
            }),
          ],
          singlePlaceholder: [],
          definitionPlaceholder: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.definitionPlaceholder,
            }),
          ],
          definitionPlaceholderWithFixedValue: [
            generateIssue('missingPlaceholder', {
              string: expectedPlaceholdersTestStrings.definitionPlaceholderWithFixedValue,
            }),
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'FixedPlaceholderDefinition',
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
            generateIssue('invalidPlaceholder', { tag: 'Time-value/#' }),
          ],
        }
        const noExpectedPlaceholdersIssues = {
          noPlaceholders: [],
          noPlaceholderGroup: [],
          noPlaceholderDefinitionGroup: [],
          noPlaceholderTagGroupDefinition: [],
          noPlaceholderDefinitionWithFixedValue: [
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'FixedTagGroupDefinition',
            }),
          ],
          singlePlaceholder: [generateIssue('invalidPlaceholder', { tag: 'RGB-green/#' })],
          definitionPlaceholder: [],
          definitionPlaceholderWithFixedValue: [
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'FixedPlaceholderDefinition',
            }),
          ],
          definitionPlaceholderWithTag: [],
          singlePlaceholderWithValidDefinitionPlaceholder: [
            generateIssue('invalidPlaceholder', { tag: 'Time-value/#' }),
          ],
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
            generateIssue('invalidPlaceholder', { tag: 'Time-value/#' }),
          ],
        }
        validatorSemantic(expectedPlaceholdersTestStrings, expectedPlaceholdersIssues, true)
        validatorSemantic(noExpectedPlaceholdersTestStrings, noExpectedPlaceholdersIssues, false)
      })
    })
  })

  describe('HED-3G library and partnered schema validation', () => {
    const hedLibrary2SchemaFile = 'tests/data/HED_testlib_2.0.0.xml'
    const hedLibrary3SchemaFile = 'tests/data/HED_testlib_3.0.0.xml'
    let hedSchemas, hedSchemas2

    beforeAll(async () => {
      const spec4 = new SchemaSpec('testlib', '2.0.0', 'testlib', hedLibrary2SchemaFile)
      const spec5 = new SchemaSpec('testlib', '3.0.0', 'testlib', hedLibrary3SchemaFile)
      const spec6 = new SchemaSpec('', '2.0.0', 'testlib', hedLibrary2SchemaFile)
      const spec7 = new SchemaSpec('', '3.0.0', 'testlib', hedLibrary3SchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec4).addSchemaSpec(spec5)
      const specs2 = new SchemasSpec().addSchemaSpec(spec6).addSchemaSpec(spec7)
      hedSchemas = await buildSchemas(specs)
      hedSchemas2 = await buildSchemas(specs2)
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
        const validator = new HedValidator(parsedTestString, hedSchemas, null, testOptions)
        const flattenedParsingIssues = Object.values(parsingIssues).flat()
        if (flattenedParsingIssues.length === 0) {
          testFunction(validator)
        }
        const issues = [].concat(flattenedParsingIssues, validator.issues)
        assert.sameDeepMembers(issues, expectedIssues[testStringKey], testString)
      }
    }

    /**
     * HED 3 semantic validation base function.
     *
     * This base function uses the HED 3-specific {@link HedValidator} validator class.
     *
     * @param {Object<string, string>} testStrings A mapping of test strings.
     * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
     * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
     * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
     */
    const validatorSemanticBase = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
      validatorBase(hedSchemas, testStrings, expectedIssues, testFunction, testOptions)
    }

    describe('Full HED Strings', () => {
      const validatorSemantic = validatorSemanticBase

      /**
       * HED 3 semantic validation function using the alternative schema collection.
       *
       * This base function uses the HED 3-specific {@link HedValidator} validator class.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemantic2 = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        validatorBase(hedSchemas2, testStrings, expectedIssues, testFunction, testOptions)
      }

      it('should allow combining tags from multiple partnered schemas', () => {
        const testStrings = {
          music: 'testlib:Piano-sound, testlib:Violin-sound',
          test2: 'testlib:SubnodeA3, testlib:Frown',
          test3: 'testlib:SubnodeF1, testlib:Car',
        }
        const expectedIssues = {
          music: [],
          test2: [],
          test3: [],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator) => {
          validator.validateEventLevel()
        })
      })

      it('should allow combining tags from multiple partnered schemas as the unprefixed schema', () => {
        const testStrings = {
          music: 'Piano-sound, Violin-sound',
          test2: 'SubnodeA3, Frown',
          test3: 'SubnodeF1, Car',
        }
        const expectedIssues = {
          music: [],
          test2: [],
          test3: [],
        }
        return validatorSemantic2(testStrings, expectedIssues, (validator) => {
          validator.validateEventLevel()
        })
      })
    })

    describe('HED Tag Groups', () => {
      /**
       * HED 3 tag group semantic validation base function.
       *
       * @param {Object<string, string>} testStrings A mapping of test strings.
       * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
       * @param {function(HedValidator, ParsedHedGroup): void} testFunction A test-specific function that executes the required validation check.
       * @param {Object<string, boolean>?} testOptions Any needed custom options for the validator.
       */
      const validatorSemantic = function (testStrings, expectedIssues, testFunction, testOptions = {}) {
        return validatorSemanticBase(
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
          nonDefinition: 'testlib:Car',
          nonDefinitionGroup: '(testlib:Hold-breath, testlib:Sit-down)',
          definitionOnly: '(testlib:Definition/SimpleDefinition)',
          tagGroupDefinition: '(testlib:Definition/TagGroupDefinition, (testlib:Hold-breath, testlib:Sit-down))',
          illegalSiblingDefinition: '(testlib:Definition/IllegalSiblingDefinition, testlib:Train, (testlib:Rectangle))',
          nestedDefinition:
            '(testlib:Definition/NestedDefinition, (testlib:Touchscreen, (testlib:Definition/InnerDefinition, (testlib:Square))))',
          multipleTagGroupDefinition:
            '(testlib:Definition/MultipleTagGroupDefinition, (testlib:Touchscreen), (testlib:Square))',
          defNestedInDefinition: '(testlib:Definition/DefNestedInDefinition, (testlib:Def/Nested, testlib:Triangle))',
        }
        const expectedIssues = {
          nonDefinition: [],
          nonDefinitionGroup: [],
          definitionOnly: [],
          tagGroupDefinition: [],
          illegalSiblingDefinition: [
            generateIssue('illegalDefinitionGroupTag', {
              tag: 'testlib:Train',
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
          defNestedInDefinition: [
            generateIssue('nestedDefinition', {
              definition: 'DefNestedInDefinition',
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkDefinitionGroupSyntax(tagGroup)
        })
      })

      it.each(['Onset', 'Inset'])('should have syntactically valid %s tags', (temporalTagName) => {
        const testStrings = {
          simple: `(testlib:${temporalTagName}, testlib:Def/Acc/5.4)`,
          defAndOneGroup: `(testlib:${temporalTagName}, testlib:Def/ShowFace, (testlib:Hold-breath, testlib:Sit-down))`,
          defExpandAndOneGroup: `(testlib:${temporalTagName}, (testlib:Def-expand/ShowFace, (testlib:Label/Pie)), (testlib:Hold-breath, testlib:Sit-down))`,
          noTag: `(testlib:${temporalTagName})`,
          definition: `(testlib:${temporalTagName}, testlib:Definition/ShowFace, (testlib:Label/Pie))`,
          defAndTwoGroups: `(testlib:Def/DefAndTwoGroups, (testlib:Blue), (testlib:Green), testlib:${temporalTagName})`,
          defExpandAndTwoGroups: `((testlib:Def-expand/DefExpandAndTwoGroups, (testlib:Label/Pie)), (testlib:Green), (testlib:Red), testlib:${temporalTagName})`,
          tagAndNoDef: `(testlib:${temporalTagName}, testlib:Red)`,
          tagGroupAndNoDef: `(testlib:${temporalTagName}, (testlib:Red))`,
          defAndTag: `(testlib:${temporalTagName}, testlib:Def/DefAndTag, testlib:Red)`,
          defTagAndTagGroup: `(testlib:${temporalTagName}, testlib:Def/DefTagAndTagGroup, (testlib:Red), testlib:Blue)`,
          multipleDefs: `(testlib:${temporalTagName}, testlib:Def/ShowFace, testlib:Def/Acc/5.4)`,
          defAndDefExpand: `((testlib:Def-expand/ShowFace, (testlib:Label/Pie)), testlib:Def/Acc/5.4, testlib:${temporalTagName})`,
          multipleDefinitionsAndExtraTagGroups: `((testlib:Def-expand/ShowFace, (testlib:Label/Pie)), testlib:Def/Acc/5.4, testlib:${temporalTagName}, (testlib:Blue), (testlib:Green))`,
        }
        const expectedIssues = {
          simple: [],
          defAndOneGroup: [],
          defExpandAndOneGroup: [],
          noTag: [generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.noTag, tag: temporalTagName })],
          definition: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.definition, tag: temporalTagName }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: temporalTagName }),
          ],
          defAndTwoGroups: [
            generateIssue('extraTagsInTemporal', { definition: 'DefAndTwoGroups', tag: temporalTagName }),
          ],
          defExpandAndTwoGroups: [
            generateIssue('extraTagsInTemporal', { definition: 'DefExpandAndTwoGroups', tag: temporalTagName }),
          ],
          tagAndNoDef: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.tagAndNoDef, tag: temporalTagName }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: temporalTagName }),
          ],
          tagGroupAndNoDef: [
            generateIssue('temporalWithoutDefinition', {
              tagGroup: testStrings.tagGroupAndNoDef,
              tag: temporalTagName,
            }),
          ],
          defAndTag: [generateIssue('extraTagsInTemporal', { definition: 'DefAndTag', tag: temporalTagName })],
          defTagAndTagGroup: [
            generateIssue('extraTagsInTemporal', { definition: 'DefTagAndTagGroup', tag: temporalTagName }),
          ],
          multipleDefs: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.multipleDefs,
              tag: temporalTagName,
            }),
          ],
          defAndDefExpand: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.defAndDefExpand,
              tag: temporalTagName,
            }),
          ],
          multipleDefinitionsAndExtraTagGroups: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.multipleDefinitionsAndExtraTagGroups,
              tag: temporalTagName,
            }),
            generateIssue('extraTagsInTemporal', {
              definition: 'Multiple definition tags found',
              tag: temporalTagName,
            }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkTemporalSyntax(tagGroup)
        })
      })

      it('should have syntactically valid offsets', () => {
        const testStrings = {
          simple: '(testlib:Offset, testlib:Def/Acc/5.4)',
          noTag: '(testlib:Offset)',
          tagAndNoDef: '(testlib:Offset, testlib:Red)',
          tagGroupAndNoDef: '(testlib:Offset, (testlib:Red))',
          defAndTag: '(testlib:Offset, testlib:Def/DefAndTag, testlib:Red)',
          defExpandAndTag: '((testlib:Def-expand/DefExpandAndTag, (testlib:Label/Pie)), testlib:Offset, testlib:Red)',
          defAndTagGroup: '(testlib:Offset, testlib:Def/DefAndTagGroup, (testlib:Red))',
          defTagAndTagGroup: '(testlib:Offset, testlib:Def/DefTagAndTagGroup, (testlib:Red), testlib:Blue)',
          defExpandAndTagGroup:
            '((testlib:Def-expand/DefExpandAndTagGroup, (testlib:Label/Pie)), testlib:Offset, (testlib:Red))',
          multipleDefs: '(testlib:Offset, testlib:Def/MyColor, testlib:Def/Acc/5.4)',
          defAndDefExpand: '((testlib:Def-expand/MyColor, (testlib:Label/Pie)), testlib:Def/Acc/5.4, testlib:Offset)',
          multipleDefinitionsAndExtraTagGroups:
            '((testlib:Def-expand/MyColor, (testlib:Label/Pie)), testlib:Def/Acc/5.4, testlib:Offset, (testlib:Blue), (testlib:Green))',
        }
        const expectedIssues = {
          simple: [],
          noTag: [generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.noTag, tag: 'Offset' })],
          tagAndNoDef: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.tagAndNoDef, tag: 'Offset' }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: 'Offset' }),
          ],
          tagGroupAndNoDef: [
            generateIssue('temporalWithoutDefinition', { tagGroup: testStrings.tagGroupAndNoDef, tag: 'Offset' }),
            generateIssue('extraTagsInTemporal', { definition: null, tag: 'Offset' }),
          ],
          defAndTag: [generateIssue('extraTagsInTemporal', { definition: 'DefAndTag', tag: 'Offset' })],
          defExpandAndTag: [generateIssue('extraTagsInTemporal', { definition: 'DefExpandAndTag', tag: 'Offset' })],
          defAndTagGroup: [generateIssue('extraTagsInTemporal', { definition: 'DefAndTagGroup', tag: 'Offset' })],
          defTagAndTagGroup: [generateIssue('extraTagsInTemporal', { definition: 'DefTagAndTagGroup', tag: 'Offset' })],
          defExpandAndTagGroup: [
            generateIssue('extraTagsInTemporal', { definition: 'DefExpandAndTagGroup', tag: 'Offset' }),
          ],
          multipleDefs: [
            generateIssue('temporalWithMultipleDefinitions', { tagGroup: testStrings.multipleDefs, tag: 'Offset' }),
          ],
          defAndDefExpand: [
            generateIssue('temporalWithMultipleDefinitions', { tagGroup: testStrings.defAndDefExpand, tag: 'Offset' }),
          ],
          multipleDefinitionsAndExtraTagGroups: [
            generateIssue('temporalWithMultipleDefinitions', {
              tagGroup: testStrings.multipleDefinitionsAndExtraTagGroups,
              tag: 'Offset',
            }),
            generateIssue('extraTagsInTemporal', { definition: 'Multiple definition tags found', tag: 'Offset' }),
          ],
        }
        return validatorSemantic(testStrings, expectedIssues, (validator, tagGroup) => {
          validator.checkTemporalSyntax(tagGroup)
        })
      })
    })
  })
})

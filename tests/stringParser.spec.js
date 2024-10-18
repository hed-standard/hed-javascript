import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { generateIssue } from '../common/issues/issues'
import { Schemas, SchemaSpec, SchemasSpec } from '../common/schema/types'
import { recursiveMap } from '../utils/array'
import { parseHedString } from '../parser/parser'
import { ParsedHedTag } from '../parser/parsedHedTag'
import HedStringSplitter from '../parser/splitter'
import { buildSchemas } from '../validator/schema/init'
import ColumnSplicer from '../parser/columnSplicer'
import ParsedHedGroup from '../parser/parsedHedGroup'

describe('HED string parsing', () => {
  const nullSchema = new Schemas(null)
  /**
   * Retrieve the original tag from a parsed HED tag object.
   * @param {ParsedHedTag} parsedTag The parsed tag.
   * @returns {string} The original tag.
   */
  const originalMap = (parsedTag) => parsedTag.originalTag

  const splitHedString = (hedString, hedSchemas) => new HedStringSplitter(hedString, hedSchemas).splitHedString()

  const hedSchemaFile = 'tests/data/HED8.0.0.xml'
  let hedSchemas

  beforeAll(async () => {
    const spec2 = new SchemaSpec('', '8.0.0', '', hedSchemaFile)
    const specs = new SchemasSpec().addSchemaSpec(spec2)
    hedSchemas = await buildSchemas(specs)
  })

  /**
   * Test-validate a list of strings without issues.
   *
   * @template T
   * @param {Object<string, string>} testStrings The strings to test.
   * @param {Object<string, T>} expectedResults The expected results.
   * @param {function (string): T} testFunction The testing function.
   */
  const validatorWithoutIssues = function (testStrings, expectedResults, testFunction) {
    for (const [testStringKey, testString] of Object.entries(testStrings)) {
      assert.property(expectedResults, testStringKey, testStringKey + ' is not in expectedResults')
      const testResult = testFunction(testString)
      assert.deepStrictEqual(testResult, expectedResults[testStringKey], testString)
    }
  }

  /**
   * Test-validate a list of strings with issues.
   *
   * @template T
   * @param {Object<string, string>} testStrings The strings to test.
   * @param {Object<string, T>} expectedResults The expected results.
   * @param {Object<string, Object<string, Issue[]>>} expectedIssues The expected issues.
   * @param {function (string): [T, Object<string, Object<string, Issue[]>>]} testFunction The testing function.
   */
  const validatorWithIssues = function (testStrings, expectedResults, expectedIssues, testFunction) {
    for (const [testStringKey, testString] of Object.entries(testStrings)) {
      assert.property(expectedResults, testStringKey, testStringKey + ' is not in expectedResults')
      assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
      const [testResult, testIssues] = testFunction(testString)
      assert.sameDeepMembers(testResult, expectedResults[testStringKey], testString)
      assert.deepOwnInclude(testIssues, expectedIssues[testStringKey], testString)
    }
  }

  describe('HED strings', () => {
    it('cannot have invalid characters', () => {
      const testStrings = {
        openingSquare: 'Relation/Spatial-relation/Left-side-of,/Action/Move/Bend[/Upper-extremity/Elbow',
        closingSquare: 'Relation/Spatial-relation/Left-side-of,/Action/Move/Bend]/Upper-extremity/Elbow',
        tilde: 'Relation/Spatial-relation/Left-side-of,/Action/Move/Bend~/Upper-extremity/Elbow',
      }
      const expectedResults = {
        openingSquare: null,
        closingSquare: null,
        tilde: null,
      }
      const expectedIssues = {
        openingSquare: {
          conversion: [],
          syntax: [
            generateIssue('invalidCharacter', {
              character: 'LEFT SQUARE BRACKET',
              index: 56,
              string: testStrings.openingSquare,
            }),
          ],
        },
        closingSquare: {
          conversion: [],
          syntax: [
            generateIssue('invalidCharacter', {
              character: 'RIGHT SQUARE BRACKET',
              index: 56,
              string: testStrings.closingSquare,
            }),
          ],
        },
        tilde: {
          conversion: [],
          syntax: [
            generateIssue('invalidCharacter', {
              character: 'TILDE',
              index: 56,
              string: testStrings.tilde,
            }),
          ],
        },
      }
      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        assert.property(expectedResults, testStringKey, testStringKey + ' is not in expectedResults')
        assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
        const [testResult, testIssues] = splitHedString(testString, nullSchema)
        assert.strictEqual(testResult, expectedResults[testStringKey], testString)
        assert.deepStrictEqual(testIssues, expectedIssues[testStringKey], testString)
      }
    })
  })

  describe('Lists of HED tags', () => {
    it('should be an array', () => {
      const hedString =
        'Event/Category/Sensory-event,Item/Object/Man-made-object/Vehicle/Train,Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/CSS-color/Purple-color/Purple'
      const [result] = splitHedString(hedString, nullSchema)
      assert.isTrue(Array.isArray(result))
    })

    it('should include each top-level tag as its own single element', () => {
      const hedString =
        'Event/Category/Sensory-event,Item/Object/Man-made-object/Vehicle/Train,Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/CSS-color/Purple-color/Purple'
      const [result, issues] = splitHedString(hedString, nullSchema)
      assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
      assert.deepStrictEqual(result, [
        new ParsedHedTag('Event/Category/Sensory-event', [0, 28]),
        new ParsedHedTag('Item/Object/Man-made-object/Vehicle/Train', [29, 70]),
        new ParsedHedTag(
          'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/CSS-color/Purple-color/Purple',
          [71, 167],
        ),
      ])
    })

    it('should include each group as its own single element', () => {
      const hedString =
        '/Action/Move/Flex,(Relation/Spatial-relation/Left-side-of,/Action/Move/Bend,/Upper-extremity/Elbow),/Position/X-position/70 px,/Position/Y-position/23 px'
      const [result, issues] = splitHedString(hedString, nullSchema)
      assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
      assert.deepStrictEqual(result, [
        new ParsedHedTag('/Action/Move/Flex', [0, 17]),
        new ParsedHedGroup(
          [
            new ParsedHedTag('Relation/Spatial-relation/Left-side-of', [19, 57]),
            new ParsedHedTag('/Action/Move/Bend', [58, 75]),
            new ParsedHedTag('/Upper-extremity/Elbow', [76, 98]),
          ],
          nullSchema,
          hedString,
          [18, 99],
        ),
        new ParsedHedTag('/Position/X-position/70 px', [100, 126]),
        new ParsedHedTag('/Position/Y-position/23 px', [127, 153]),
      ])
    })

    it('should not include blanks', () => {
      const testStrings = {
        trailingBlank: '/Item/Object/Man-made-object/Vehicle/Car, /Action/Perform/Operate,',
      }
      const expectedList = [
        new ParsedHedTag('/Item/Object/Man-made-object/Vehicle/Car', [0, 40]),
        new ParsedHedTag('/Action/Perform/Operate', [42, 65]),
      ]
      const expectedResults = {
        trailingBlank: expectedList,
      }
      const expectedIssues = {
        trailingBlank: {},
      }
      validatorWithIssues(testStrings, expectedResults, expectedIssues, (string) => {
        return splitHedString(string, nullSchema)
      })
    })
  })

  describe('Formatted HED tags', () => {
    it('should be lowercase and not have leading or trailing double quotes or slashes', () => {
      // Correct formatting
      const formattedHedTag = 'event/category/sensory-event'
      const testStrings = {
        formatted: formattedHedTag,
        openingDoubleQuote: '"Event/Category/Sensory-event',
        closingDoubleQuote: 'Event/Category/Sensory-event"',
        openingAndClosingDoubleQuote: '"Event/Category/Sensory-event"',
        openingSlash: '/Event/Category/Sensory-event',
        closingSlash: 'Event/Category/Sensory-event/',
        openingAndClosingSlash: '/Event/Category/Sensory-event/',
        openingDoubleQuotedSlash: '"/Event/Category/Sensory-event',
        closingDoubleQuotedSlash: 'Event/Category/Sensory-event/"',
        openingSlashClosingDoubleQuote: '/Event/Category/Sensory-event"',
        closingSlashOpeningDoubleQuote: '"Event/Category/Sensory-event/',
        openingAndClosingDoubleQuotedSlash: '"/Event/Category/Sensory-event/"',
      }
      const expectedResults = {
        formatted: formattedHedTag,
        openingDoubleQuote: formattedHedTag,
        closingDoubleQuote: formattedHedTag,
        openingAndClosingDoubleQuote: formattedHedTag,
        openingSlash: formattedHedTag,
        closingSlash: formattedHedTag,
        openingAndClosingSlash: formattedHedTag,
        openingDoubleQuotedSlash: formattedHedTag,
        closingDoubleQuotedSlash: formattedHedTag,
        openingSlashClosingDoubleQuote: formattedHedTag,
        closingSlashOpeningDoubleQuote: formattedHedTag,
        openingAndClosingDoubleQuotedSlash: formattedHedTag,
      }
      validatorWithoutIssues(testStrings, expectedResults, (string) => {
        const parsedTag = new ParsedHedTag(string, [])
        return parsedTag.formattedTag
      })
    })
  })

  describe('Parsed HED strings', () => {
    it('must have the correct number of tags, top-level tags, and groups', () => {
      const hedString =
        'Action/Move/Flex,(Relation/Spatial-relation/Left-side-of,Action/Move/Bend,Upper-extremity/Elbow),Position/X-position/70 px,Position/Y-position/23 px'
      const [parsedString, issues] = parseHedString(hedString, nullSchema)
      assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
      assert.sameDeepMembers(parsedString.tags.map(originalMap), [
        'Action/Move/Flex',
        'Relation/Spatial-relation/Left-side-of',
        'Action/Move/Bend',
        'Upper-extremity/Elbow',
        'Position/X-position/70 px',
        'Position/Y-position/23 px',
      ])
      assert.sameDeepMembers(parsedString.topLevelTags.map(originalMap), [
        'Action/Move/Flex',
        'Position/X-position/70 px',
        'Position/Y-position/23 px',
      ])
      assert.sameDeepMembers(
        parsedString.tagGroups.map((group) => group.tags.map(originalMap)),
        [['Relation/Spatial-relation/Left-side-of', 'Action/Move/Bend', 'Upper-extremity/Elbow']],
      )
    })

    it('must include properly formatted tags', () => {
      const hedString =
        '/Action/Move/Flex,(Relation/Spatial-relation/Left-side-of,/Action/Move/Bend,/Upper-extremity/Elbow),/Position/X-position/70 px,/Position/Y-position/23 px'
      const formattedHedString =
        'action/move/flex,(relation/spatial-relation/left-side-of,action/move/bend,upper-extremity/elbow),position/x-position/70 px,position/y-position/23 px'
      const [parsedString, issues] = parseHedString(hedString, nullSchema)
      const [parsedFormattedString, formattedIssues] = parseHedString(formattedHedString, nullSchema)
      const formattedMap = (parsedTag) => {
        return parsedTag.formattedTag
      }
      assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
      assert.isEmpty(Object.values(formattedIssues).flat(), 'Parsing issues occurred in the formatted string')
      assert.deepStrictEqual(parsedString.tags.map(formattedMap), parsedFormattedString.tags.map(originalMap))
      assert.deepStrictEqual(
        parsedString.topLevelTags.map(formattedMap),
        parsedFormattedString.topLevelTags.map(originalMap),
      )
    })

    it('must correctly handle multiple levels of parentheses', () => {
      const testStrings = {
        shapes: 'Square,(Definition/RedCircle,(Circle,Red)),Rectangle',
        vehicles:
          'Car,(Definition/TrainVelocity/#,(Train,(Measurement-device/Odometer,Data-maximum/160,Speed/# kph),Blue,Age/12,(Navigational-object/Railway,Data-maximum/150)))',
        typing: '((Human-agent,Joyful),Press,Keyboard-key/F),(Braille,Character/A,Screen-window)',
      }
      const expectedTags = {
        shapes: ['Square', 'Definition/RedCircle', 'Circle', 'Red', 'Rectangle'],
        vehicles: [
          'Car',
          'Definition/TrainVelocity/#',
          'Train',
          'Measurement-device/Odometer',
          'Data-maximum/160',
          'Speed/# kph',
          'Blue',
          'Age/12',
          'Navigational-object/Railway',
          'Data-maximum/150',
        ],
        typing: ['Human-agent', 'Joyful', 'Press', 'Keyboard-key/F', 'Braille', 'Character/A', 'Screen-window'],
      }
      const expectedGroups = {
        shapes: [['Definition/RedCircle', ['Circle', 'Red']]],
        vehicles: [
          [
            'Definition/TrainVelocity/#',
            [
              'Train',
              ['Measurement-device/Odometer', 'Data-maximum/160', 'Speed/# kph'],
              'Blue',
              'Age/12',
              ['Navigational-object/Railway', 'Data-maximum/150'],
            ],
          ],
        ],
        typing: [
          [['Human-agent', 'Joyful'], 'Press', 'Keyboard-key/F'],
          ['Braille', 'Character/A', 'Screen-window'],
        ],
      }

      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        const [parsedString, issues] = parseHedString(testString, hedSchemas)
        assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
        assert.sameDeepMembers(parsedString.tags.map(originalMap), expectedTags[testStringKey], testString)
        assert.deepStrictEqual(
          recursiveMap(
            originalMap,
            parsedString.tagGroups.map((tagGroup) => tagGroup.nestedGroups()),
          ),
          expectedGroups[testStringKey],
          testString,
        )
      }
    })
  })

  describe('Canonical HED tags', () => {
    it('should convert HED 3 tags into canonical form', () => {
      const testStrings = {
        simple: 'Car',
        groupAndTag: '(Train, RGB-red/0.5), Car',
        invalidTag: 'InvalidTag',
        invalidParentNode: 'Car/Train/Maglev',
      }
      const expectedResults = {
        simple: ['Item/Object/Man-made-object/Vehicle/Car'],
        groupAndTag: [
          'Item/Object/Man-made-object/Vehicle/Train',
          'Property/Sensory-property/Sensory-attribute/Visual-attribute/Color/RGB-color/RGB-red/0.5',
          'Item/Object/Man-made-object/Vehicle/Car',
        ],
        invalidTag: [],
        invalidParentNode: [],
      }
      const expectedIssues = {
        simple: {},
        groupAndTag: {},
        invalidTag: {
          conversion: [generateIssue('invalidTag', { tag: testStrings.invalidTag })],
        },
        invalidParentNode: {
          conversion: [
            generateIssue('invalidParentNode', {
              parentTag: 'Item/Object/Man-made-object/Vehicle/Train',
              tag: 'Train',
            }),
          ],
        },
      }

      return validatorWithIssues(testStrings, expectedResults, expectedIssues, (string) => {
        const [parsedString, issues] = parseHedString(string, hedSchemas)
        const canonicalTags = parsedString.tags.map((parsedTag) => {
          return parsedTag.canonicalTag
        })
        return [canonicalTags, issues]
      })
    })
  })

  describe('HED column splicing', () => {
    it('must properly splice columns', () => {
      const hedStrings = [
        'Sensory-event, Visual-presentation, {stim_file}, (Face, {stim_file})',
        '(Image, Face, Pathname/#)',
        'Sensory-event, Visual-presentation, (Image, Face, Pathname/abc.bmp), (Face, (Image, Face, Pathname/abc.bmp))',
      ]
      const issues = []
      const parsedStrings = []
      for (const hedString of hedStrings) {
        const [parsedString, parsingIssues] = parseHedString(hedString, hedSchemas)
        parsedStrings.push(parsedString)
        issues.push(...Object.values(parsingIssues).flat())
      }
      assert.isEmpty(issues, 'Parsing issues')
      const [baseString, refString, correctString] = parsedStrings
      const replacementMap = new Map([['stim_file', refString]])
      const columnSplicer = new ColumnSplicer(
        baseString,
        replacementMap,
        new Map([['stim_file', 'abc.bmp']]),
        hedSchemas,
      )
      const splicedString = columnSplicer.splice()
      const splicingIssues = columnSplicer.issues
      assert.strictEqual(splicedString.format(), correctString.format(), 'Full string')
      assert.isEmpty(splicingIssues, 'Splicing issues')
    })

    it('must properly detect recursive curly braces', () => {
      const hedStrings = ['Sensory-event, Visual-presentation, {stim_file}', '(Image, {body_part}, Pathname/#)', 'Face']
      const issues = []
      const parsedStrings = []
      for (const hedString of hedStrings) {
        const [parsedString, parsingIssues] = parseHedString(hedString, hedSchemas)
        parsedStrings.push(parsedString)
        issues.push(...Object.values(parsingIssues).flat())
      }
      const [baseString, refString, doubleRefString] = parsedStrings
      const replacementMap = new Map([
        ['stim_file', refString],
        ['body_part', doubleRefString],
      ])
      const columnSplicer = new ColumnSplicer(
        baseString,
        replacementMap,
        new Map([['stim_file', 'abc.bmp']]),
        hedSchemas,
      )
      columnSplicer.splice()
      const splicingIssues = columnSplicer.issues
      issues.push(...splicingIssues)
      assert.deepStrictEqual(issues, [generateIssue('recursiveCurlyBraces', { column: 'stim_file' })])
    })
  })
})

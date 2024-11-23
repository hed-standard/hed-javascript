import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { generateIssue } from '../common/issues/issues'
import { parseHedString, parseHedStrings } from '../parser/parser'
import { parseTestData } from './testData/stringParserTests.data'
import { shouldRun, getHedString } from './testUtilities'
import { SpecialChecker } from '../parser/special'
import { TagSpec } from '../parser/tokenizer'
import ParsedHedTag from '../parser/parsedHedTag'
const skipMap = new Map()
const runAll = true
const runMap = new Map([['special-tag-group-tests', ['offset-in-group-with-other-tags']]])

describe('Null schema objects should cause parsing to bail', () => {
  it('Should not proceed if no schema and valid string', () => {
    const stringIn = 'Item, Red'
    const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, null, true)
    assert.isNull(parsedString, `Parsed HED string of ${stringIn} is null although string is valid`)
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    assert.deepStrictEqual(errorIssues, expectedIssues, `A SCHEMA_LOAD_FAILED issue should be generated`)
    const [directParsed, directIssues] = parseHedString(stringIn, null)
    assert.isNull(directParsed, `Parsed HED string of ${stringIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues.syntaxIssues, expectedIssues)
  })

  it('Should not proceed if no schema and invalid string', () => {
    const stringIn = 'Item/#, Red'
    const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, null, true)
    assert.isNull(parsedString, `Parsed HED string of ${stringIn} is null for invalid string`)
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    assert.deepStrictEqual(errorIssues, expectedIssues, `A SCHEMA_LOAD_FAILED issue should be generated`)
    const [directParsed, directIssues] = parseHedString(stringIn, null)
    assert.isNull(directParsed, `Parsed HED string of ${stringIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues.syntaxIssues, expectedIssues)
  })

  it('Should not proceed if no schema and valid array of strings', () => {
    const arrayIn = new Array('Item, Red', 'Blue')
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    const [directParsed, directIssues] = parseHedStrings(arrayIn, null)
    assert.isNull(directParsed, `Parsed HED string of ${arrayIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues.syntaxIssues, expectedIssues)
  })
})

describe('Parse HED string tests', () => {
  const schemaMap = new Map([
    ['8.2.0', undefined],
    ['8.3.0', undefined],
  ])

  beforeAll(async () => {
    const spec2 = new SchemaSpec('', '8.2.0', '', path.join(__dirname, '../tests/data/HED8.2.0.xml'))
    const specs2 = new SchemasSpec().addSchemaSpec(spec2)
    const schemas2 = await buildSchemas(specs2)
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.2.0', schemas2)
    schemaMap.set('8.3.0', schemas3)
  })

  afterAll(() => {})

  describe('testExperiment', () => {
    /*it('Should give experiment', () => {
      const thisSchema = schemaMap.get('8.3.0')
      // const w = new TagSpec('Speed/5 mph', 0, 10, '')
      // const g = new ParsedHedTag(w, thisSchema, 'Speed/5 mph')
      // console.log(g)
      // const x =[g]
      // // Check top-level-tag-group-tags
      // const y = x.includes(g)
      // let p = g.unitClasses
      // console.log(p)
      //const z = x.includes(g)
      assert.isDefined(thisSchema, `should be defined`)
      const stringIn = 'Item, Sensory-event, (Red, Blue, {help}, (Definition/Blech, (Green, Black))), (Orange, ((Definition/Blech1, (White))))'
      //const stringIn = 'Item, ((Def-expand/Apple, (Purple)), (((Def-expand/Banana, (Orange)), Item)), Sensory-event), Red'
      //const stringIn = 'Item/Object, (Length/5 m, (Green)), (Green, Object), (Sensory-event, Green), Red'
      const [parsedString, issues] = parseHedString(stringIn, thisSchema)
      console.log(issues)
*/
  })

  // it('Should give experiment 2', () => {
  //   const thisSchema = schemaMap.get('8.3.0')
  //   assert.isDefined(thisSchema, `should be defined`)
  //   const [sParsed, errors, warnings] =  getHedString('Red, Blue', thisSchema, true
  //   //const stringIn = 'Item, Sensory-event, (Red, Blue, {help}, (Definition/Blech, (Green, Black))), (Orange, ((Definition/Blech1, (White))))'
  //   //const stringIn = '((Def-expand/Apple, (Purple)), (((Def-expand/Banana, (Orange)), Item)), Sensory-event)'
  //   // const stringIn = 'Item, Sensory-event, (Red, Blue, {help}, (Definition/Blech, (Green, Black))), (Definition/Banana)'
  //   // const [parsedString, issues] = parseHedString(stringIn, thisSchema)
  //   // console.log(parsedString)
  //   // const special = new SpecialChecker(parsedString)
  //   // const tagList = special.getSpecialTags(parsedString)
  //   // const group = special.getTagGroup(tagList[1])
  //   //const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, thisSchema)
  //   console.log(sParsed)
  //
  //   })
  // })

  describe.each(parseTestData)('$name : $description', ({ name, tests }) => {
    const testConvert = function (test) {
      const status = test.errors.length === 0 ? 'Expect pass' : 'Expect fail'
      const header = `[${test.testname} (${status})]`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.testname}`)

      // Parse the string before converting
      const [parsedString, errorIssues, warningIssues] = getHedString(test.stringIn, thisSchema, test.fullCheck)

      // Check for errors
      assert.deepStrictEqual(
        errorIssues,
        test.errors,
        `${header}: expected ${errorIssues} errors but received ${test.errors}\n`,
      )
      // Check if warning match
      assert.deepStrictEqual(
        warningIssues,
        test.warnings,
        `${header}: expected ${warningIssues} warnings but received ${test.warnings}\n`,
      )
      if (parsedString === null) {
        return
      }

      // Check the conversion to long
      const longString = parsedString.format(true)
      assert.strictEqual(
        longString,
        test.stringLong,
        `${header}: expected ${test.stringLong} but received ${longString}`,
      )

      // Check the conversion to short
      const shortString = parsedString.format(false)
      assert.strictEqual(
        shortString,
        test.stringShort,
        `${header}: expected ${test.stringShort} but received ${shortString}`,
      )
    }

    beforeAll(async () => {})

    afterAll(() => {})

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          testConvert(test)
        } else {
          console.log(`----Skipping stringParserTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

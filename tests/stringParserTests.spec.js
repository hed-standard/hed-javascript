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

const skipMap = new Map()
const runAll = true
const runMap = new Map([['special-tag-group-tests', ['inset-with-def-expand-and-group']]])

describe('Null schema objects should cause parsing to bail', () => {
  it('Should not proceed if no schema and valid string', () => {
    const stringIn = 'Item, Red'
    const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, null, true)
    assert.isNull(parsedString, `Parsed HED string of ${stringIn} is null although string is valid`)
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    assert.deepStrictEqual(errorIssues, expectedIssues, `A SCHEMA_LOAD_FAILED issue should be generated`)
    const [directParsed, directIssues] = parseHedString(stringIn, null, false, false)
    assert.isNull(directParsed, `Parsed HED string of ${stringIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues, expectedIssues)
  })

  it('Should not proceed if no schema and invalid string', () => {
    const stringIn = 'Item/#, Red'
    const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, null, true)
    assert.isNull(parsedString, `Parsed HED string of ${stringIn} is null for invalid string`)
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    assert.deepStrictEqual(errorIssues, expectedIssues, `A SCHEMA_LOAD_FAILED issue should be generated`)
    const [directParsed, directIssues] = parseHedString(stringIn, null, true, true)
    assert.isNull(directParsed, `Parsed HED string of ${stringIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues, expectedIssues)
  })

  it('Should not proceed if no schema and valid array of strings', () => {
    const arrayIn = new Array('Item, Red', 'Blue')
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    const [directParsed, directIssues] = parseHedStrings(arrayIn, null)
    assert.isNull(directParsed, `Parsed HED string of ${arrayIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues, expectedIssues)
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

  describe.each(parseTestData)('$name : $description', ({ name, tests }) => {
    const testConvert = function (test) {
      const status = test.errors.length === 0 ? 'Expect pass' : 'Expect fail'
      const header = `[${test.testname} (${status})]`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.testname}`)

      // Parse the string before converting
      const [parsedString, errorIssues, warningIssues] = getHedString(test.stringIn, thisSchema, test.fullCheck, true)

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

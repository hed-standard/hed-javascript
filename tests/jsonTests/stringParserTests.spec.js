import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll, it } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { generateIssue } from '../../src/issues/issues'
import { parseHedString, parseHedStrings } from '../../src/parser/parser'
import { parseTestData } from '../jsonTestData/stringParserTests.data'
import { shouldRun, getHedString } from '../testHelpers/testUtilities'

const skipMap = new Map()
const runAll = true
//const runMap = new Map([['valid-tags', ['single-tag-extension']]])
const runMap = new Map([['special-tag-group-tests', ['event-context-in-subgroup']]])

describe('Null schema objects should cause parsing to bail', () => {
  it('Should not proceed if no schema and valid string', () => {
    const stringIn = 'Item, Red'
    const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, null, true, true, true)
    assert.isNull(parsedString, `Parsed HED string of ${stringIn} is null although string is valid`)
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    assert.deepStrictEqual(errorIssues, expectedIssues, `A SCHEMA_LOAD_FAILED issue should be generated`)
    assert.equal(warningIssues.length, 0, `Null schema produces errors, not warnings`)

    const [directParsed, errorsDirect, warningsDirect] = parseHedString(stringIn, null, true, true, true)
    assert.isNull(directParsed, `Parsed HED string of ${stringIn} is null for invalid string`)
    assert.deepStrictEqual(errorsDirect, expectedIssues)
    assert.equal(warningsDirect.length, 0, `Null schema produces errors, not warnings`)
  })

  it('Should not proceed if no schema and invalid string', () => {
    const stringIn = 'Item/Blue, Red'
    const [parsedString, errorIssues, warningIssues] = getHedString(stringIn, null, false, false, true)
    assert.isNull(parsedString, `Parsed HED string of ${stringIn} is null for invalid string`)
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    assert.deepStrictEqual(errorIssues, expectedIssues, `A SCHEMA_LOAD_FAILED issue should be generated`)
    assert.equal(warningIssues.length, 0, `Null schema produces errors, not warnings`)
    const [directParsed, errorsDirect, warningsDirect] = parseHedString(stringIn, null, true, true, true)
    assert.isNull(directParsed, `Parsed HED string of ${stringIn} is null for invalid string`)
    assert.deepStrictEqual(errorsDirect, expectedIssues)
    assert.equal(warningsDirect.length, 0, `Null schema produces errors, not warnings`)
  })

  it('Should not proceed if no schema and valid array of strings', () => {
    const arrayIn = ['Item, Red', 'Blue']
    const expectedIssues = [generateIssue('missingSchemaSpecification', {})]
    const [directParsed, directIssues, warningIssues] = parseHedStrings(arrayIn, null, true, false)
    assert.isNull(directParsed, `Parsed HED string of ${arrayIn} is null for invalid string`)
    assert.deepStrictEqual(directIssues, expectedIssues)
    assert.equal(warningIssues.length, 0)
  })
})

describe('Parse HED string tests', () => {
  const schemaMap = new Map([['8.3.0', undefined]])

  beforeAll(async () => {
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../../src/data/schemas/HED8.4.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
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
      let issues
      let warnings = []
      let parsedString = null
      try {
        ;[parsedString, issues, warnings] = getHedString(
          test.stringIn,
          thisSchema,
          test.definitionsAllowed,
          test.placeholdersAllowed,
          test.fullValidation,
        )
      } catch (error) {
        issues = [error.issue]
      }
      // Check if warning match
      assert.deepStrictEqual(
        warnings,
        test.warnings,
        `${header}: expected ${warnings} warnings but received ${test.warnings}\n`,
      )

      // Check for errors
      assert.deepStrictEqual(issues, test.errors, `${header}: expected ${issues} errors but received ${test.errors}\n`)

      // Check the conversion to long
      const longString = parsedString ? parsedString.format(true) : null
      assert.strictEqual(
        longString,
        test.stringLong,
        `${header}: expected ${test.stringLong} but received ${longString}`,
      )

      // Check the conversion to short
      const shortString = parsedString ? parsedString.format(false) : null
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
          // eslint-disable-next-line no-console
          console.log(`----Skipping stringParserTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

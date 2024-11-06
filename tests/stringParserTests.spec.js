import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { BidsHedIssue } from '../bids/types/issues'
import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'

import { parseTestData } from './testData/stringParserTests.data'
import { shouldRun, getHedString } from './testUtilities'

// Ability to select individual tests to run
const skipMap = new Map()
const runAll = true
const runMap = new Map([['valid-mixed-groups', []]])

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
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.name}`)

      // Parse the string before converting
      const [parsedString, errorIssues, warningIssues] = getHedString(test.stringIn, thisSchema)

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
          console.log(`----Skipping ${name}: ${test.testname}`)
        }
      })
    }
  })
})

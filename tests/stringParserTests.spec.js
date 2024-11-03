import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { BidsHedIssue } from '../bids/types/issues'
import { buildSchemas } from '../validator/schema/init'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'

import { conversionTestData } from './testData/stringParserTests.data'
import { shouldRun, getHedString } from './testUtilities'

// Ability to select individual tests to run
const runAll = true
let onlyRun = new Map()
if (!runAll) {
  onlyRun = new Map([['invalid-long-to-short', ['single-level-extension-already-a-tag']]])
}

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

  describe.each(conversionTestData)('$name : $description', ({ name, tests }) => {
    const convert = function (test) {
      const status = test.errors.length === 0 ? 'Expect pass' : 'Expect fail'
      const header = `[${test.testname} (${status})]`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.name}`)

      // Parse the string before converting
      const [parsedString, errorIssues, warningIssues] = getHedString(test.stringIn, thisSchema)
      assert.deepStrictEqual(
        errorIssues,
        test.errors,
        `${header}: expected ${errorIssues} errors but received ${test.errors}\n`,
      )
      assert.deepStrictEqual(
        warningIssues,
        test.warnings,
        `${header}: expected ${warningIssues} warnings but received ${test.warnings}\n`,
      )

      let resultString = null
      if (parsedString !== null) {
        resultString = parsedString.format(test.operation === 'toLong')
      }
      assert.strictEqual(
        resultString,
        test.stringOut,
        `${header} [${test.operation}]: expected ${test.stringOut} but received ${resultString}`,
      )
    }

    beforeAll(async () => {})

    afterAll(() => {})

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', (test) => {
        if (shouldRun(name, test.testname, onlyRun)) {
          convert(test)
        } else {
          console.log(`----Skipping ${name}: ${test.testname}`)
        }
      })
    }
  })
})

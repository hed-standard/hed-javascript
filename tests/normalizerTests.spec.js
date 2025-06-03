import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../src/schema/specs'
import { normalizerTestData } from './testData/normalizerTests.data'
import { shouldRun, getHedString } from './testUtilities'

const skipMap = new Map()
const runAll = true
const runMap = new Map([['simple-tags', 'duplicate-tags']])

describe('Normalize HED string tests', () => {
  const schemaMap = new Map([['8.3.0', undefined]])

  beforeAll(async () => {
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../src/data/schemas/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.3.0', schemas3)
  })

  afterAll(() => {})

  describe.each(normalizerTestData)('$name : $description', ({ name, tests }) => {
    const testConvert = function (test) {
      const header = `${test.testname}`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.testname}`)

      let issues
      // Parse the string before converting
      try {
        const [parsedString, errorIssues, warningIssues] = getHedString(test.string, thisSchema, true, false, true)
        issues = errorIssues
        assert.strictEqual(
          parsedString?.normalized,
          test.stringNormalized,
          `${header}: received normalized string: ${parsedString?.normalized} but expected ${test.stringNormalized}`,
        )
        assert.equal(warningIssues.length, 0, `${header}: expects errors not warnings`)
      } catch (error) {
        issues = [error.issue]
      }
      // Check for errors
      assert.deepStrictEqual(issues, test.errors, `${header}: expected ${issues} errors but received ${test.errors}\n`)
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

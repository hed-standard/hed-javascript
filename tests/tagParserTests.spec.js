import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import ParsedHedTag from '../parser/parsedHedTag'
import { shouldRun } from './testUtilities'
import { parsedHedTagTests } from './testData/tagParserTests.data'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import path from 'path'
import { buildSchemas } from '../schema/init'
import { SchemaTag } from '../schema/entries'

// Ability to select individual tests to run
const skipMap = new Map()
const runAll = true
const runMap = new Map([['valid-tags', ['valid-tag-with-extension']]])

describe('TagSpec converter tests using JSON tests', () => {
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

  describe.each(parsedHedTagTests)('$name : $description', ({ name, tests }) => {
    const hedTagTest = function (test) {
      const status = test.error !== null ? 'Expect fail' : 'Expect pass'
      const header = `\n[${test.testname}](${status}): ${test.explanation}`

      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `${header}: ${test.schemaVersion} is not available in test ${test.name}`)

      let issue = null
      let tag = null
      try {
        tag = new ParsedHedTag(test.tagSpec, thisSchema, test.fullString)
      } catch (error) {
        issue = error.issue
      }
      assert.deepEqual(issue, issue)
      assert.strictEqual(tag?.format(false), test.tagShort, `${header}: wrong short version`)
      assert.strictEqual(tag?.format(true), test.tagLong, `${header}: wrong long version`)
      assert.strictEqual(tag?.formattedTag, test.formattedTag, `${header}: wrong formatted version`)
      assert.strictEqual(tag?.canonicalTag, test.canonicalTag, `${header}: wrong canonical version`)
    }

    beforeAll(async () => {})

    afterAll(() => {})

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation', (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          hedTagTest(test)
        } else {
          console.log(`----Skipping ${name}: ${test.testname}`)
        }
      })
    }
  })
})

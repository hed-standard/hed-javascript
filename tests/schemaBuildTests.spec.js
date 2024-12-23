import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { buildBidsSchemas } from '../bids/schema'
import { BidsJsonFile } from '../bids'

import { shouldRun } from './testUtilities'
import { schemaBuildTestData } from './testData/schemaBuildTests.data'
import { Schemas } from '../schema/containers'

// Ability to select individual tests to run
const skipMap = new Map()
const runAll = true
const runMap = new Map([['invalid-schemas', ['lazy-partnered-with conflicting-tags-build']]])

describe('Schema build validation', () => {
  beforeAll(async () => {})

  afterAll(() => {})

  const assertErrors = function (test, caughtError, schema) {
    const status = test.schemaError === null ? 'Expect pass' : 'Expect fail'
    const header = `[${test.testname} (${status})]`

    // assert.sameDeepMembers(caughtError.issue, test.schemaError.issue, header)

    const expectedErrorCode = test.schemaError === null ? null : test.schemaError.issue.hedCode
    const expectedErrorString = test.schemaError === null ? '' : `${JSON.stringify(test.schemaError.issue)}`
    const caughtErrorString = caughtError === null ? '' : `${JSON.stringify(caughtError.issue)}`

    assert.strictEqual(caughtErrorString, expectedErrorString, header)
    if (expectedErrorCode === null) {
      assert.instanceOf(schema, Schemas, header + caughtErrorString)
    }
  }

  describe.each(schemaBuildTestData)('$name : $description', ({ name, tests }) => {
    beforeAll(async () => {})

    afterAll(() => {})

    async function testSchema(test) {
      const desc = new BidsJsonFile('/dataset_description.json', test.schemaVersion, {
        relativePath: '/dataset_description.json',
        path: '/dataset_description.json',
      })
      let schema = undefined
      let caughtError = null
      try {
        schema = await buildBidsSchemas(desc)
      } catch (error) {
        caughtError = error
      }
      assertErrors(test, caughtError, schema)
    }

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', async (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          await testSchema(test)
        } else {
          console.log(`----Skipping schemaBuildTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

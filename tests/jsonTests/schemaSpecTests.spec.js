import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { buildSchemasSpec } from '../../src/bids/schema'
import { BidsJsonFile } from '../../src/bids'

import { shouldRun } from '../testHelpers/testUtilities'
import { schemaSpecTestData } from '../jsonTestData/schemaBuildTests.data'

// Ability to select individual tests to run
const skipMap = new Map()
const runAll = true
const runMap = new Map([])

describe('Schema validation', () => {
  beforeAll(async () => {})

  afterAll(() => {})

  const assertErrors = function (test, caughtError) {
    const status = test.schemaError === null ? 'Expect pass' : 'Expect fail'
    const header = `[${test.testname} (${status})]`

    const expectedErrorString = test.schemaError === null ? '' : `${JSON.stringify(test.schemaError.issue)}`
    const caughtErrorString = caughtError === null ? '' : `${JSON.stringify(caughtError.issue)}`
    assert.strictEqual(caughtErrorString, expectedErrorString, header)
  }

  describe.each(schemaSpecTestData)('$name : $description', ({ name, tests }) => {
    const validateSpec = function (test) {
      const desc = new BidsJsonFile(
        '/dataset_description.json',
        {
          path: '/dataset_description.json',
        },
        test.schemaVersion,
      )
      let schemaSpec = null
      let caughtError = null
      try {
        schemaSpec = buildSchemasSpec(desc, null)
      } catch (error) {
        caughtError = error
      }
      assertErrors(test, caughtError, schemaSpec)
    }

    beforeAll(async () => {})

    afterAll(() => {})

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          validateSpec(test)
        } else {
          // eslint-disable-next-line no-console
          console.log(`----Skipping schemaSpecTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

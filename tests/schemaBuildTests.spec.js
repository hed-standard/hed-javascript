import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildBidsSchemas } from '../bids/schema'
import { BidsHedIssue } from '../bids/types/issues'
import { Schemas } from '../common/schema/types'
import { BidsJsonFile } from '../bids'

import { shouldRun } from './testUtilities'
import { schemaBuildTestData } from './testData/schemaBuildTests.data'
const fs = require('fs')

//const displayLog = process.env.DISPLAY_LOG === 'true'
const displayLog = true

// Ability to select individual tests to run
const runAll = true
let onlyRun = new Map([['invalid-schemas', ['lazy-partnered-with conflicting-tags-build']]])
if (!runAll) {
  onlyRun = new Map([])
}

describe('Schema build validation', () => {
  const badLog = []
  let totalTests
  let wrongErrors

  beforeAll(async () => {
    totalTests = 0
    wrongErrors = 0
  })

  afterAll(() => {
    const outBad = path.join(__dirname, 'runLog.txt')
    const summary = `Total tests:${totalTests} Wrong errors:${wrongErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  const assertErrors = function (test, caughtError, schema, iLog) {
    const status = test.schemaError === null ? 'Expect pass' : 'Expect fail'
    const header = `[${test.testname} (${status})]`
    const log = []
    totalTests += 1

    const expectedErrorCode = test.schemaError === null ? null : test.schemaError.issue.hedCode
    const expectedErrorString = test.schemaError === null ? '' : `${JSON.stringify(test.schemaError.issue)}`
    const caughtErrorCode = caughtError === null ? null : caughtError.issue.hedCode
    const caughtErrorString = caughtError === null ? '' : `${JSON.stringify(caughtError.issue)}`
    if (caughtErrorCode !== null) {
      log.push(`---Received error ${caughtErrorString}`)
    }
    if (expectedErrorCode !== null) {
      log.push(`---Expected error ${expectedErrorString}`)
    }
    iLog.push(header + '\n' + log.join('\n'))
    assert.strictEqual(caughtErrorString, expectedErrorString, header)
    if (expectedErrorCode === null) {
      assert.instanceOf(schema, Schemas, header + caughtErrorString)
    }
  }

  describe.each(schemaBuildTestData)('$name : $description', ({ name, tests }) => {
    let itemLog

    beforeAll(async () => {
      itemLog = []
    })

    afterAll(() => {})

    async function testSchema(test, iLog) {
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
      assertErrors(test, caughtError, schema, iLog)
    }

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', async (test) => {
        if (shouldRun(name, test.testname, onlyRun)) {
          await testSchema(test, itemLog)
        } else {
          itemLog.push(`----Skipping ${name}: ${test.testname}`)
        }
      })
    }
  })
})

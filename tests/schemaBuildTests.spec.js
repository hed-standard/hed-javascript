import chai from 'chai'
const assert = chai.assert
const difference = require('lodash/difference')
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'
import { buildSchemasSpec } from '../bids/schema'
import { BidsHedIssue } from '../bids/types/issues'
import { buildSchemas } from '../validator/schema/init'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import { TsvValidator, BidsJsonFile, BidsSidecar, BidsTsvFile } from '../bids'

import { schemaSpecTestData, schemaBuildTestData } from './testData/schemaBuildTests.data'
import parseTSV from '../bids/tsvParser'
const fs = require('fs')

//const displayLog = process.env.DISPLAY_LOG === 'true'
const displayLog = true

// Ability to select individual tests to run
const runAll = true
let onlyRun = new Map()
if (!runAll) {
  onlyRun = new Map([])
}

function shouldRun(name, testname) {
  if (onlyRun.size === 0) return true
  if (onlyRun.get(name) === undefined) return false

  const cases = onlyRun.get(name)
  if (cases.length === 0) return true

  return !!cases.includes(testname)
}

// Return an array of hedCode values extracted from an issues list.
function extractHedCode(issue) {
  const errors = []
  if (issue instanceof BidsHedIssue) {
    errors.push(`${issue.hedIssue.hedCode}`)
  } else {
    errors.push(`${issue.hedCode}`)
  }
  return errors
}

describe('Schema validation', () => {
  const schemaMap = new Map([
    ['8.2.0', undefined],
    ['8.3.0', undefined],
  ])

  const badLog = []
  let totalTests
  let wrongErrors
  let missingErrors

  beforeAll(async () => {
    const spec2 = new SchemaSpec('', '8.2.0', '', path.join(__dirname, '../tests/data/HED8.2.0.xml'))
    const specs2 = new SchemasSpec().addSchemaSpec(spec2)
    const schemas2 = await buildSchemas(specs2)
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.2.0', schemas2)
    schemaMap.set('8.3.0', schemas3)
    totalTests = 0
    wrongErrors = 0
    missingErrors = 0
  })

  afterAll(() => {
    const outBad = path.join(__dirname, 'runLog.txt')
    const summary = `Total tests:${totalTests} Wrong errors:${wrongErrors} MissingErrors:${missingErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  describe.each(schemaSpecTestData)('$name : $description', ({ name, tests }) => {
    let itemLog

    const assertErrors = function (test, caughtError, schemaSpec, iLog) {
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
    }

    const validateSpec = function (test, iLog) {
      const desc = new BidsJsonFile('/dataset_description.json', test.schemaVersion, {
        relativePath: '/dataset_description.json',
        path: '/dataset_description.json',
      })
      let schemaSpec = undefined
      let caughtError = null
      try {
        schemaSpec = buildSchemasSpec(desc, null)
      } catch (error) {
        caughtError = error
      }
      assertErrors(test, caughtError, schemaSpec, iLog)
    }

    beforeAll(async () => {
      itemLog = []
    })

    afterAll(() => {
      badLog.push(itemLog.join('\n'))
    })

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', (test) => {
        if (shouldRun(name, test.testname)) {
          validateSpec(test, itemLog)
        } else {
          itemLog.push(`----Skipping ${name}: ${test.testname}`)
        }
      })
    }
  })
})

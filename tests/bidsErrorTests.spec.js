import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'
import { BidsHedIssue } from '../bids/types/issues'
import { buildSchemas } from '../validator/schema/init'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import { BidsDataset, BidsEventFile, BidsHedTsvValidator, BidsSidecar, BidsTsvFile } from '../bids'
import { generateIssue, IssueError } from '../common/issues/issues'

import { HedStringTokenizerOriginal } from '../parser/tokenizerOriginal'
import { HedStringTokenizer } from '../parser/tokenizer'
import { passingBidsTests } from './bidsPassingData'
import { BidsHedTsvParser } from '../bids/validator/bidsHedTsvValidator'
import parseTSV from '../bids/tsvParser'
const fs = require('fs')

const displayLog = process.env.DISPLAY_LOG === 'true'

const skippedErrors = {}

describe('HED tokenizer validation', () => {
  const schemaMap = new Map([
    ['8.2.0', undefined],
    ['8.3.0', undefined],
  ])

  const badLog = []
  let totalTests = 0
  let wrongErrors = 0
  let unexpectedErrors = 0

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

  afterAll(() => {
    const outBad = path.join(__dirname, 'runLog.txt')
    const summary = `Total tests:${totalTests} Unexpected errors:${unexpectedErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  describe('BIDS validation - validData', () => {
    const badLog = []
    let totalTests = 0
    let unexpectedErrors = 0

    beforeAll(async () => {})

    afterAll(() => {
      const outBad = path.join(__dirname, 'runLog.txt')
      const summary = `Total tests:${totalTests} Unexpected errors:${unexpectedErrors}\n`
      if (displayLog) {
        fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
      }
    })

    describe.each(passingBidsTests)('$name : $description', ({ tests }) => {
      let itemLog

      const assertErrors = function (header, issues, iLog) {
        iLog.push(`${header}\n`)
        totalTests += 1

        let errors = []
        if (issues.length > 0) {
          errors = issues.map((item) => item.hedIssue.hedCode) // list of hedCodes in the issues
        }
        const errorString = errors.join(',')
        if (errors.length > 0) {
          iLog.push(`---expected no errors but got errors [${errorString}]\n`)
          unexpectedErrors += 1
          assert(errors.length === 0, `${header}---expected no errors but got errors [${errorString}]`)
        }
      }

      const validate = function (test, iLog) {
        // Make sure that the schema is available
        const header = `\n[${test.name} (Expect pass)]`
        const thisSchema = schemaMap.get(test.schemaVersion)
        assert(thisSchema !== undefined, `${test.schemaVersion} is not available in test ${test.name}`)

        // Validate the sidecar by itself
        const sidecarName = test.name + '.json'
        const bidsSidecar = new BidsSidecar('thisOne', test.sidecar, { relativePath: sidecarName, path: sidecarName })
        assert(bidsSidecar instanceof BidsSidecar, 'Test')
        const sidecarIssues = bidsSidecar.validate(thisSchema)
        assertErrors(header + ':Validating just the sidecar', sidecarIssues, iLog)

        // Parse the events file
        const eventName = test.name + '.tsv'
        const parsedTsv = parseTSV(test.eventsString)
        assert(parsedTsv instanceof Map, `${eventName} cannot be parsed`)

        // Validate the events file by itself
        const bidsTsv = new BidsTsvFile(test.name, parsedTsv, { relativePath: 'eventName' }, [], {})
        const validator = new BidsHedTsvValidator(bidsTsv, thisSchema)
        validator.validate()
        assertErrors(header + ':Parsing events alone', validator.issues, iLog)

        // Validate the events file with the sidecar
        const bidsTsvSide = new BidsTsvFile(test.name, parsedTsv, { relativePath: 'eventName' }, [], bidsSidecar)
        const validatorSide = new BidsHedTsvValidator(bidsTsvSide, thisSchema)
        validatorSide.validate()
        assertErrors(header + ':Parsing events with ', validatorSide.issues, iLog)
      }

      beforeAll(async () => {
        itemLog = []
      })

      afterAll(() => {
        badLog.push(itemLog.join('\n'))
      })

      if (tests && tests.length > 0) {
        test.each(tests)('BIDS: %s ', (test) => {
          validate(test, itemLog)
        })
      }
    })
  })
})

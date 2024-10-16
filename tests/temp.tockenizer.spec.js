import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import * as hed from '../validator/event'
import { BidsHedIssue } from '../bids/types/issues'
import path from 'path'
import { HedStringTokenizer } from '../parser/tokenizer'
import { generateIssue, IssueError } from '../common/issues/issues'
const fs = require('fs')

const displayLog = process.env.DISPLAY_LOG === 'true'

const skippedErrors = {}
const readFileSync = fs.readFileSync
// const test_file_name = 'javascriptTests.json'
const test_file_name = 'temp.json'

function loadTestData() {
  const testFile = path.join(__dirname, test_file_name)
  return JSON.parse(readFileSync(testFile, 'utf8'))
}

const testInfo = loadTestData()

describe('HED tokenizer validation using JSON tests', () => {
  const badLog = []
  let totalTests = 0
  let wrongErrors = 0
  let unexpectedErrors = 0

  beforeAll(async () => {})

  afterAll(() => {
    const outBad = path.join(__dirname, 'runLog.txt')
    const summary = `Total tests:${totalTests} Wrong error codes:${wrongErrors} Unexpected errors:${unexpectedErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  describe.each(testInfo)(
    '$hedCode $code $name : $description',
    ({ hedCode, code, name, description, warning, fails }) => {
      let itemLog
      let hasWarning

      const assertErrors = function (hedCode, code, expectError, iLog, header, issues) {
        const log = [header]
        totalTests += 1

        const errors = Object.values(issues).flat()
        if (errors.length > 0) {
          log.push(`---has errors [${errorString}]`)
        }
        const expectedError = code
        const wrongError = `---expected ${eCode} ${altErrorString} but got errors [${errorString}]`
        const hasErrors = `---expected no errors but got errors [${errorString}]`
        if (expectError && !expectedErrors.some((substring) => errorString.includes(substring))) {
          log.push(wrongError)
          iLog.push(log.join('\n'))
          wrongErrors += 1
          assert(errorString.includes(eCode), `${header}---expected ${eCode} and got errors [${errorString}]`)
        } else if (!expectError && errorString.length > 0) {
          log.push(hasErrors)
          iLog.push(log.join('\n'))
          unexpectedErrors += 1
          assert(errorString.length === 0, `${header}---expected no errors but got errors [${errorString}]`)
        }
      }

      const stringTokenizer = function (eHedCode, eCode, eName, tokenizer, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eHedCode} ${eName}](${status})\tSTRING: "${tokenizer.hedString}"`
        const [tagSpecs, groupBounds, tokenizingIssues] = tokenizer.tokenize()
        assertErrors(eHedCode, eCode, expectError, iLog, header, tokenizingIssues)
      }

      /**
       * Convert an Error into an Issue.
       *
       * @param {Error} issueError A thrown error.
       * @returns {Issue} A HED issue.
       */
      // const convertIssue = function (issueError) {
      //   if (issueError instanceof IssueError) {
      //     return issueError.issue
      //   } else {
      //     return generateIssue('internalError', { message: issueError.message })
      //   }
      // }

      beforeAll(async () => {
        itemLog = []
        hasWarning = warning
      })

      afterAll(() => {
        badLog.push(itemLog.join('\n'))
      })

      // if (testInfo.passes.length > 0) {
      //   test.each(testInfo.passes)('Valid string: %s', (str) => {
      //     stringValidator(error_code, alt_codes, name, str, hedSchema, defs, false, itemLog)
      //   })
      // }

      if (testInfo.fails.length > 0) {
        test.each(testInfo.fails)('NewTokenizer: Invalid string: %s ', (str) => {
          stringTokenizer(hedCode, code, name, new HedStringTokenizer(str), true, itemLog)
        })
      }
    },
  )
})

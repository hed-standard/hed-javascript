import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import * as hed from '../validator/event'
import { BidsHedIssue } from '../bids/types/issues'
import path from 'path'
import { HedStringTokenizer } from '../parser/tokenizer'
import { HedStringTokenizerNew } from '../parser/tokenizerNew'
import { generateIssue, IssueError } from '../common/issues/issues'
import passingTests from './tokenizerTestData'
const fs = require('fs')

const displayLog = process.env.DISPLAY_LOG === 'true'

const skippedErrors = {}
const readFileSync = fs.readFileSync
// const test_file_name = 'javascriptTests.json'

describe('HED tokenizer validation - validData', () => {
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

  describe.each(testInfo)('$name : $description', ({ tests }) => {
    let itemLog

    const checkForErrors = function (iLog, header, issues) {
      const log = [header]
      totalTests += 1

      let errors = []
      if (issues.length > 0) {
        errors = issues.map((dict) => dict.hedCode) // list of hedCodes in the issues
      }
      const errorString = errors.join(',')
      if (errors.length > 0) {
        log.push(`---has errors [${errorString}]`)
      }
      const expectedError = eCode
      const wrongError = `---expected ${eHedCode} but got errors [${errorString}]`
      const hasErrors = `---expected no errors but got errors [${errorString}]`
      if (expectError && !errors.includes(eHedCode)) {
        log.push(wrongError)
        iLog.push(log.join('\n'))
        wrongErrors += 1
        assert.strictEqual(
          errors.includes(eHedCode),
          true,
          `${header}---expected ${eHedCode} and got errors [${errorString}]`,
        )
      } else if (!expectError && errors.length > 0) {
        log.push(hasErrors)
        iLog.push(log.join('\n'))
        unexpectedErrors += 1
        assert(errors.length === 0, `${header}---expected no errors but got errors [${errorString}]`)
      }
    }

    const stringTokenizer = function (eName, tokenizer, iLog) {
      const status = 'Expect pass'
      const tokType = tokenizer instanceof HedStringTokenizer ? 'Original-tokenizer' : 'New tokenizer'
      const header = `\n[${tokType}](${status})\tSTRING: "${tokenizer.hedString}"`
      const [tagSpecs, groupBounds, tokenizingIssues] = tokenizer.tokenize()
      const issues = Object.values(tokenizingIssues).flat()
      assertErrors(eHedCode, eCode, expectError, iLog, header, issues)
    }

    const stringTokenizer = function (eHedCode, eCode, eName, tokenizer, expectError, iLog) {
      const status = expectError ? 'Expect fail' : 'Expect pass'
      const tokType = tokenizer instanceof HedStringTokenizer ? 'Original-tokenizer' : 'New tokenizer'
      const header = `\n[${eHedCode} ${eName} ${tokType}](${status})\tSTRING: "${tokenizer.hedString}"`
      const [tagSpecs, groupBounds, tokenizingIssues] = tokenizer.tokenize()
      const issues = Object.values(tokenizingIssues).flat()
      assertErrors(eHedCode, eCode, expectError, iLog, header, issues)
    }

    beforeAll(async () => {
      itemLog = []
    })

    afterAll(() => {
      badLog.push(itemLog.join('\n'))
    })

    if (tests && tests.length > 0) {
      test.each(tests)('NewTokenizer: Invalid string: %s ', (ex) => {
        //console.log(ex)
        stringTokenizer(ex.name, new HedStringTokenizerNew(ex.string), true, itemLog)
      })

      test.each(tests.fails)('Original tokenizer: Invalid string: %s ', (ex) => {
        stringTokenizer(ex.hedCode, ex.code, ex.name, new HedStringTokenizer(ex.string), true, itemLog)
      })
    }

    if (tests.fails && tests.fails.length > 0) {
      test.each(tests.fails)('NewTokenizer: Invalid string: %s ', (ex) => {
        //console.log(ex)
        stringTokenizer(ex.hedCode, ex.code, ex.name, new HedStringTokenizerNew(ex.string), true, itemLog)
      })

      test.each(tests.fails)('Original tokenizer: Invalid string: %s ', (ex) => {
        stringTokenizer(ex.hedCode, ex.code, ex.name, new HedStringTokenizer(ex.string), true, itemLog)
      })
    }
  })
})

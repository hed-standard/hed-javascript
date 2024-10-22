import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'
import { HedStringTokenizer } from '../parser/tokenizer'
import { HedStringTokenizerOriginal } from '../parser/tokenizerOriginal'
import { errorTests } from './tokenizerErrorData'
const displayLog = process.env.DISPLAY_LOG === 'true'
const fs = require('fs')

const skippedErrors = {}

//const testInfo = loadTestData()
console.log(errorTests)

describe('Tokenizer validation using JSON tests', () => {
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

  describe.each(errorTests)('$name : $description', ({ tests }) => {
    let itemLog

    const assertErrors = function (eHedCode, eCode, expectError, iLog, header, issues) {
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

    const stringTokenizer = function (eHedCode, eCode, eName, tokenizer, expectError, iLog) {
      const status = expectError ? 'Expect fail' : 'Expect pass'
      const tokType = tokenizer instanceof HedStringTokenizer ? 'New tokenizer' : 'Original tokenizer'
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
      test.each(tests)('Tokenizer: %s ', (ex) => {
        stringTokenizer(ex.hedCode, ex.code, ex.name, new HedStringTokenizer(ex.string), true, itemLog)
      })
    }
  })
})

describe.skip('Original tokenizer validation using JSON tests', () => {
  const badLog = []
  let totalTests = 0
  let wrongErrors = 0
  let unexpectedErrors = 0

  beforeAll(async () => {})

  afterAll(() => {
    const outBad = path.join(__dirname, 'runLogOriginal.txt')
    const summary = `Total tests:${totalTests} Wrong error codes:${wrongErrors} Unexpected errors:${unexpectedErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  describe.each(errorTests)('$name : $description', ({ tests }) => {
    let itemLog

    const assertErrors = function (eHedCode, eCode, expectError, iLog, header, issues) {
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

    const stringTokenizer = function (eHedCode, eCode, eName, tokenizer, expectError, iLog) {
      const status = expectError ? 'Expect fail' : 'Expect pass'
      const tokType = tokenizer instanceof HedStringTokenizer ? 'New tokenizer' : 'Original tokenizer'
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
      test.each(tests)('Original tokenizer: %s ', (ex) => {
        stringTokenizer(ex.hedCode, ex.code, ex.name, new HedStringTokenizerOriginal(ex.string), true, itemLog)
      })
    }
  })
})

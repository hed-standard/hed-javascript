import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'
import { HedStringTokenizer } from '../parser/tokenizer'
import { errorTests } from './testData/tokenizerErrorData'
const displayLog = process.env.DISPLAY_LOG === 'true'
const fs = require('fs')

// Ability to select individual tests to run
const runAll = true
let onlyRun = new Map()
if (!runAll) {
  onlyRun = new Map([['extra-slash-in-various-places', ['group-leading-slash']]])
}

function shouldRun(name, testname) {
  if (onlyRun.size === 0) return true
  if (onlyRun.get(name) === undefined) return false

  const cases = onlyRun.get(name)
  if (cases.length === 0) return true

  if (cases.includes(testname)) {
    return true
  } else {
    return false
  }
}

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

  describe.each(errorTests)('$name : $description', ({ name, description, tests }) => {
    let itemLog

    const assertErrors = function (test, iLog, header, issues) {
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

      const wrongError = `---expected ${test.hedCode} but got errors [${errorString}]`
      if (!errors.includes(test.hedCode)) {
        log.push(wrongError)
        iLog.push(log.join('\n'))
        wrongErrors += 1
        assert.strictEqual(
          errors.includes(test.hedCode),
          true,
          `${header}---expected ${test.hedCode} and got errors [${errorString}]`,
        )
      }
    }

    const stringTokenizer = function (test, iLog) {
      const status = test.code ? 'Expect fail' : 'Expect pass'
      const tokenizer = new HedStringTokenizer(test.string)
      const header = `\n[${test.hedCode} ${test.testname}](${status})\tSTRING: "${tokenizer.hedString}"`
      const [tagSpecs, groupBounds, tokenizingIssues] = tokenizer.tokenize()
      const issues = Object.values(tokenizingIssues).flat()
      assertErrors(test, iLog, header, issues)
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
          stringTokenizer(test, itemLog)
        } else {
          itemLog.push(`----Skipping ${name}: ${test.testname}`)
        }
      })
    }
  })
})

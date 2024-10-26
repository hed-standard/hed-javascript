import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'
import { HedStringTokenizer } from '../parser/tokenizer'
import { passingTests } from './tokenizerPassingData'
const fs = require('fs')

const displayLog = process.env.DISPLAY_LOG === 'true'

// Ability to select individual tests to run
const runAll = true
let onlyRun = new Map()
if (!runAll) {
  onlyRun = new Map([['valid-single-tags', ['simple-tag-no-blanks']]])
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

describe('HED tokenizer validation', () => {
  describe('Tokenizer validation - validData', () => {
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

    describe.each(passingTests)('$name : $description', ({ name, description, tests }) => {
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
          log.push(`---expected no errors but got errors [${errorString}]\n`)
          log.push(`Received issues: ${JSON.stringify(issues)}`)
          iLog.push(log.join('\n'))
          unexpectedErrors += 1
          assert.isEmpty(errors, `${header}---expected no errors but got errors [${errorString}]`)
        }
      }

      const stringTokenizer = function (test, iLog) {
        const status = 'Expect pass'
        const tokenizer = new HedStringTokenizer(test.string)
        const header = `\n[${test.hedCode} ${test.testname}](${status})\tSTRING: "${tokenizer.hedString}"`
        const [tagSpecs, groupSpec, tokenizingIssues] = tokenizer.tokenize()
        const issues = Object.values(tokenizingIssues).flat()
        assertErrors(test, iLog, header, issues)
        assert.sameDeepMembers(tagSpecs, test.tagSpecs, test.explanation)
        assert.deepEqual(groupSpec, test.groupSpec, test.explanation)
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
})

import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { HedStringTokenizer } from '../src/parser/tokenizer'
import { shouldRun } from './testHelpers/testUtilities'
import { tokenizerTests } from './testData/tokenizerTests.data'

// Ability to select individual tests to run
const skipMap = new Map()
const runAll = true
const runMap = new Map([['valid-single-tags', ['tag-with-date-time']]])

describe('Tokenizer validation using JSON tests', () => {
  beforeAll(async () => {})

  afterAll(() => {})

  describe.each(tokenizerTests)('$name : $description', ({ name, tests }) => {
    const stringTokenizer = function (test) {
      const status = test.errors.length > 0 ? 'Expect fail' : 'Expect pass'
      const tokenizer = new HedStringTokenizer(test.string)
      const header = `\n[${test.testname}](${status}): ${test.explanation}`
      const [tagSpecs, groupSpec, issues] = tokenizer.tokenize()
      assert.sameDeepMembers(issues, test.errors, `${header} should have the same errors`)
      assert.sameDeepMembers(tagSpecs, test.tagSpecs, `${header} should generate the same tagSpecs`)
      assert.deepEqual(groupSpec, test.groupSpec, `${header} should generate the same groupSpec`)
    }

    beforeAll(async () => {})

    afterAll(() => {})

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation for "$string"', (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          stringTokenizer(test)
        } else {
          // eslint-disable-next-line no-console
          console.log(`----Skipping tokenizerTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import * as hed from '../../src/utils/hedStrings'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { buildSchemas } from '../../src/schema/init'

describe('HED tag string utility functions', () => {
  describe('Syntactic utility functions', () => {
    /**
     * Test-validate a list of strings.
     *
     * @template T
     * @param {Object<string, string>} testStrings The strings to test.
     * @param {Object<string, T>} expectedResults The expected results.
     * @param {function (string): T} testFunction The testing function.
     */
    const validator = function (testStrings, expectedResults, testFunction) {
      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        assert.property(expectedResults, testStringKey, testStringKey + ' is not in expectedResults')
        const testResult = testFunction(testString)
        assert.deepStrictEqual(testResult, expectedResults[testStringKey], testString)
      }
    }

    it('should detect the locations of slashes in a tag', () => {
      const testStrings = {
        description: 'Event/Description/Something',
        direction: 'Attribute/Direction/Left',
        noSlash: 'Something',
      }
      const expectedResults = {
        description: [5, 17],
        direction: [9, 19],
        noSlash: [],
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.getTagSlashIndices(string)
      })
    })
  })
})

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

    it('should properly replace tag values with the pound character', () => {
      const testStrings = {
        slash: 'Event/Duration/4 ms',
        noSlash: 'Something',
      }
      const expectedResults = {
        slash: 'Event/Duration/#',
        noSlash: '#',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.replaceTagNameWithPound(string)
      })
    })

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

    it('should extract the last part of a tag', () => {
      const testStrings = {
        description: 'Event/Description/Something',
        direction: 'Attribute/Direction/Left',
        noSlash: 'Participant',
      }
      const expectedResults = {
        description: 'Something',
        direction: 'Left',
        noSlash: 'Participant',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.getTagName(string)
      })
    })

    it('should extract the parent part of a tag', () => {
      const testStrings = {
        description: 'Event/Description/Something',
        direction: 'Attribute/Direction/Left',
        noSlash: 'Participant',
      }
      const expectedResults = {
        description: 'Event/Description',
        direction: 'Attribute/Direction',
        noSlash: 'Participant',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.getParentTag(string)
      })
    })

    it('must be surrounded by parentheses', () => {
      const testStrings = {
        group: '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)',
        nonGroup: '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm',
      }
      const expectedResults = {
        group: true,
        nonGroup: false,
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.hedStringIsAGroup(string)
      })
    })

    it('can have its parentheses removed', () => {
      const testStrings = {
        group: '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)',
      }
      const expectedResults = {
        group: '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.removeGroupParentheses(string)
      })
    })
  })
})

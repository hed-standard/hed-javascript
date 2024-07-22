import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'

import * as stringUtils from '../string'

describe('String utility functions', () => {
  describe('Blank strings', () => {
    it('may be empty', () => {
      const emptyString = ''
      const result = stringUtils.stringIsEmpty(emptyString)
      assert.strictEqual(result, true)
    })

    it('may have only whitespace', () => {
      const spaceString = ' \n  \t  '
      const result = stringUtils.stringIsEmpty(spaceString)
      assert.strictEqual(result, true)
    })

    it('may not contain letters', () => {
      const aString = 'a'
      const result = stringUtils.stringIsEmpty(aString)
      assert.strictEqual(result, false)
    })

    it('may not contain numbers', () => {
      const oneString = '1'
      const result = stringUtils.stringIsEmpty(oneString)
      assert.strictEqual(result, false)
    })

    it('may not contain punctuation', () => {
      const slashString = '/'
      const result = stringUtils.stringIsEmpty(slashString)
      assert.strictEqual(result, false)
    })
  })

  describe('Capitalized strings', () => {
    it('must have a capitalized first letter', () => {
      const testString = 'to be'
      const result = stringUtils.capitalizeString(testString)
      assert.strictEqual(result, 'To be')
    })

    it('must not change letters after the first letter', () => {
      const testString = 'to BE or NOT to BE'
      const result = stringUtils.capitalizeString(testString)
      assert.strictEqual(result, 'To BE or NOT to BE')
    })
  })

  describe('Character counts', () => {
    it('must be correct', () => {
      const testString = 'abcabcaaabccccdddfdddd'
      const resultA = stringUtils.getCharacterCount(testString, 'a')
      const resultB = stringUtils.getCharacterCount(testString, 'b')
      const resultC = stringUtils.getCharacterCount(testString, 'c')
      const resultD = stringUtils.getCharacterCount(testString, 'd')
      const resultE = stringUtils.getCharacterCount(testString, 'e')
      const resultF = stringUtils.getCharacterCount(testString, 'f')
      assert.strictEqual(resultA, 5)
      assert.strictEqual(resultB, 3)
      assert.strictEqual(resultC, 6)
      assert.strictEqual(resultD, 7)
      assert.strictEqual(resultE, 0)
      assert.strictEqual(resultF, 1)
    })
  })

  describe('Simple string validation functions', () => {
    /**
     * Test a string validation function.
     * @param {function (string): boolean} testFunction The validation function to test.
     * @param {Object<string, string>} validStrings A set of valid strings.
     * @param {Object<string, string>} invalidStrings A set of invalid strings.
     */
    const validate = function (testFunction, validStrings, invalidStrings) {
      for (const [key, string] of Object.entries(validStrings)) {
        assert.isTrue(testFunction(string), key)
      }
      for (const [key, string] of Object.entries(invalidStrings)) {
        assert.isFalse(testFunction(string), key)
      }
    }

    describe('Valid HED times', () => {
      it('must be of the form HH:MM or HH:MM:SS', () => {
        const validStrings = {
          validPM: '23:52',
          validMidnight: '00:55',
          validHour: '11:00',
          validSingleDigitHour: '08:30',
          validSeconds: '19:33:47',
        }
        const invalidStrings = {
          invalidDate: '8/8/2019',
          invalidHour: '25:11',
          invalidSingleDigitHour: '8:30',
          invalidMinute: '12:65',
          invalidSecond: '15:45:82',
          invalidTimeZone: '16:25:51+00:00',
          invalidMilliseconds: '17:31:05.123',
          invalidMicroseconds: '09:21:16.123456',
          invalidDateTime: '2000-01-01T00:55:00',
          invalidString: 'not a time',
        }
        validate(stringUtils.isClockFaceTime, validStrings, invalidStrings)
      })
    })

    describe('Valid HED date-times', () => {
      it('must be in ISO 8601 format', () => {
        const validStrings = {
          validPM: '2000-01-01T23:52:00',
          validMidnight: '2000-01-01T00:55:00',
          validHour: '2000-01-01T11:00:00',
          validSingleDigitHour: '2000-01-01T08:30:00',
          validSeconds: '2000-01-01T19:33:47',
          validMilliseconds: '2000-01-01T17:31:05.123',
          validMicroseconds: '2000-01-01T09:21:16.123456',
        }
        const invalidStrings = {
          invalidDate: '8/8/2019',
          invalidTime: '00:55:00',
          invalidHour: '2000-01-01T25:11',
          invalidSingleDigitHour: '2000-01-01T8:30',
          invalidMinute: '2000-01-01T12:65',
          invalidSecond: '2000-01-01T15:45:82',
          invalidTimeZone: '2000-01-01T16:25:51+00:00',
          invalidString: 'not a time',
        }
        validate(stringUtils.isDateTime, validStrings, invalidStrings)
      })
    })

    describe('Valid HED numbers', () => {
      it('must be in scientific notation', () => {
        const validStrings = {
          validPositiveInteger: '21',
          validNegativeInteger: '-500',
          validPositiveDecimal: '8520.63',
          validNegativeDecimal: '-945.61',
          validPositiveFractional: '0.84',
          validNegativeFractional: '-0.61',
          validPositiveScientificInteger: '21e10',
          validNegativeScientificInteger: '-500E-5',
          validPositiveScientificDecimal: '8520.63E15',
          validNegativeScientificDecimal: '-945.61e-3',
          validPositiveScientificFractional: '0.84e-2',
          validNegativeScientificFractional: '-0.61E5',
        }
        const invalidStrings = {
          invalidDecimalPoint: '.',
          invalidMultipleDecimalPoints: '22.88.66',
          invalidMultipleEs: '888ee66',
          invalidStartCharacter: 'e77e6',
          invalidBlankExponent: '432e',
          invalidBlankNegativeExponent: '1853e-',
          invalidStartingDecimalPoint: '.852',
          invalidEndingDecimalPoint: '851695.',
          invalidOtherCharacter: '81468g516',
        }
        validate(stringUtils.isNumber, validStrings, invalidStrings)
      })
    })
  })
})

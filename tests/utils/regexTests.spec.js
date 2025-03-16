import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'
import { cleanupEmpties } from '../../src/parser/parseUtils'

describe('Tokenizer validation using JSON tests', () => {
  const checkExpression = function (testStrings) {
    for (const [testKey, test] of Object.entries(testStrings)) {
      const result = cleanupEmpties(test[0])
      assert.deepStrictEqual(result, test[1], `for ${testKey} expected ${test[1]} but received ${result}`)
    }
  }

  it('It should handle trailing commas before:trailingInnerCommaRegEx )', () => {
    const tests = {
      multipleCommasAndBlanks: ['(value1, value2,  ,  ,  ) ', '(value1, value2)'],
      justAComma: ['value1, value2, )', 'value1, value2)'],
      noComma: ['value1, value2 )', 'value1, value2)'],
      multipleParens: ['((value1, value2),)', '((value1, value2))'],
      noAction: ['value1, value2', 'value1, value2'],
      singleValueWithComma: ['value1,)', 'value1)'],
      multipleSpacesBeforeParen: ['value1, value2    )', 'value1, value2)'],
      multipleCommasBeforeParen: ['value1, value2,,,,)', 'value1, value2)'],
      nestedParensWithCommas: ['((Red, Blue,),)', '((Red, Blue))'],
      extraSpacesAndCommas: ['value1,   , , ,    )', 'value1)'],
      multipleNestedGroups: ['((A, B), (C, D,),)', '((A, B), (C, D))'],
      commaAtEndWithoutSpace: ['value1,)', 'value1)'],
      onlyCommasBeforeParen: [',,,,)', ')'],
      emptyString: ['', ''],
      onlyParens: ['))', '))'],
      multipleCommas: ['value1,,value2,,,value3', 'value1,value2,value3'],
      spacesBetweenCommas: ['value1,  , value2, , , value3', 'value1, value2, value3'],
      leadingCommas: [',,value1,,value2', 'value1,value2'],
      trailingCommas: ['value1,,value2,,', 'value1,value2'],
      commasWithSpaces: ['value1, , value2,   ,   value3', 'value1, value2,   value3'],
      onlyCommas: [',,,,', ''], // Ensures it collapses all commas to a single one
      mixedContent: ['(value1,, (value2, , value3),)', '(value1, (value2, value3))'],
      noChange: ['value1, value2, value3', 'value1, value2, value3'], // Already correct
      singleComma: [',', ''], // Single comma remains unchanged
      singleTrailingComma: ['value1,', 'value1'],
      multipleTrailingCommas: ['value1,,,', 'value1'],
      trailingCommaWithSpaces: ['value1,   ', 'value1'],
      multipleTrailingCommasWithSpaces: ['value1, , ,   ', 'value1'],
      nestedParensWithTrailingComma: ['(value1, value2,),', '(value1, value2)'],
      nestedParensWithSpacesAndComma: ['(value1, value2, )  ,', '(value1, value2)'],
      multipleGroupsWithTrailingComma: ['(A, B), (C, D,),', '(A, B), (C, D)'],
      spacesOnly: ['    ', ''],
      singleLeadingComma: [',value1', 'value1'],
      multipleLeadingCommas: [',,,value1', 'value1'],
      leadingCommaWithSpaces: ['   ,value1', 'value1'],
      multipleLeadingCommasWithSpaces: [' , , ,   value1', 'value1'],
      nestedParensWithLeadingComma: [', (value1, value2)', '(value1, value2)'],
      leadingSpacesAndComma: ['   , (value1, value2)', '(value1, value2)'],
      multipleGroupsWithLeadingComma: [', (A, B), (C, D)', '(A, B), (C, D)'],
      emptyParentheses: ['()', ''],
      multipleEmptyParentheses: ['() ()', ''],
      nestedEmptyParentheses: ['(())', ''],
      deeplyNestedEmptyParentheses: ['(((())))', ''],
      emptyParenthesesWithSpaces: ['(   )', ''],
      emptyParenthesesWithCommas: ['(,, ,)', ''],
      multipleEmptyGroups: ['(,,), ()', ''],
      validContentUnchanged: ['(value1, value2)', '(value1, value2)'],
      mixedValidAndEmpty: ['(value1, value2), (,,), ()', '(value1, value2)'],
      nestedValidAndEmpty: ['(value1, (), value2)', '(value1, value2)'],
      multipleLevelsOfEmptyParens: ['((), (,,), ( , (,), ()))', ''],
      mixedNestedValidAndEmpty: ['((value1, ( , )), value2)', '((value1), value2)'],
      onlySpacesInside: ['(    )', ''],
      lotsOfParents: [
        '((((((((((((((((((((((((((((((((((((((((((((((((value1)))))))))))))))))))))))))))))))))))))))))))))))))',
        '((((((((((((((((((((((((((((((((((((((((((((((((value1)))))))))))))))))))))))))))))))))))))))))))))))))',
      ],
    }

    checkExpression(tests)
  })
})

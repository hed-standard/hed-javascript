import chai from 'chai'

const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { generateIssue } from '../common/issues/issues'
import { Schemas, SchemaSpec, SchemasSpec } from '../common/schema/types'
import { recursiveMap } from '../utils/array'
import { parseHedString } from '../parser/parser'
import { ParsedHedTag } from '../parser/parsedHedTag'
import HedStringSplitter from '../parser/splitter'
import { buildSchemas } from '../validator/schema/init'
import ColumnSplicer from '../parser/columnSplicer'
import ParsedHedGroup from '../parser/parsedHedGroup'
import { HedStringTokenizer } from '../parser/tokenizer'
import { HedStringTokenizerOld } from '../parser/tokenizerOld'

describe('HED string parsing', () => {
  it('should include each group as its own single element', () => {
    //const hedString = "Action/Move/Flex,(Relation/Spatial-relation/Left-side-of,Action/Move/Bend,Upper-extremity/Elbow),Position/X-position/70 px,Position/Y-position/23 px"
    //const hedString = 'x/y w/z'
    const hedString = '(r,z)'
    //const hedString = 'r,'
    //const hedString = 'r,y'
    const tok = new HedStringTokenizer(hedString)
    const [tagSpecs, groupBounds, tokenizingIssues] = tok.tokenize()
    assert.isEmpty(Object.values(tokenizingIssues).flat(), 'Parsing issues occurred')
    //const hedString = 'Action/Move/My-flex,(Relation/Spatial-relation/Left-side-of,Action/Move/My-bend,Upper-extremity/My-elbow),Position/X-position/70 m,Position/Y-position/23 m'
    // const [result, issues] = splitHedString(hedString, nullSchema)
    // assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
  })

  // const tokenizeTester = function(testStrings, testFunction) {
  //   for (const [testStringKey, testString] of Object.entries(testStrings)) {
  //     const testResult = testFunction(testStringKey, testString)
  //   }
  // }
  //
  // const tokenizeTesterBad = function(testStrings, issueCodes, testFunction) {
  //   for (const [testStringKey, testString] of Object.entries(testStrings)) {
  //     const testResult = testFunction(testStringKey, issueCode.testStringKey, testString)
  //   }
  // }
  //
  // it('should tokenize valid strings', () => {
  //   const testStrings = {
  //     oneBrace: 'x,{y}',
  //     braceParentheses1: '(({yz}))',
  //     leadingBlank: ' {x},z,',
  //   }
  //   tokenizeTester(testStrings, (key, string) => {
  //     const tok = new HedStringTokenizer(string)
  //     const [tagSpecs, groupBounds, issues] = tok.tokenize()
  //     assert.isEmpty(Object.values(issues).flat(), `${key}: ${issues}`)
  //     const tok1 = new HedStringTokenizerOld(string)
  //     const [tagSpec1, groupBounds1, issues1] = tok1.tokenize()
  //     assert.isEmpty(Object.values(issues1).flat(), `${key}: ${issues1}`)
  //   })
  // })
  //
  // it('should tokenize invalid strings', () => {
  //   const testStrings = {
  //     // oneBrace: 'x,{y}',
  //     // braceParentheses1: '(({yz}))',
  //     // leadingBlank: ' {x},z'
  //     //onlyComma: ' ,',
  //     doubleTrailingComma: 'x,,',
  //   }
  //
  //   const expectedIssues = {
  //     onlyComma: 'emptyTagFound',
  //     doubleTrailingComma: 'emptyTagFound',
  //   }
  //
  //   for (const [testStringKey, testString] of Object.entries(testStrings)) {
  //     const tok = new HedStringTokenizer(testString)
  //     const [tagSpecs, groupBounds, issues] = tok.tokenize()
  //     const issuesFlat = Object.values(issues).flat()
  //     const expectedIssue = expectedIssues[testStringKey] || ''
  //     assert.equal(issuesFlat['code'], expectedIssue, `Expected  ${expectedIssue} for "${testString}"`)
  //   }
  //   // assert.isEmpty(Object.values(issues).flat(), `${key}: ${issues}`)
  //   // const tok1 = new HedStringTokenizerOld(string)
  //   // const [tagSpec1, groupBounds1, issues1] = tok1.tokenize()
  //   // assert.isEmpty(Object.values(issues1).flat(), `${key}: ${issues1}`)
  // })
})

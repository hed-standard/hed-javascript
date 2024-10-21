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
import { HedStringTokenizerOriginal } from '../parser/tokenizerOriginal'
import { BidsEventFile } from '../bids'
import { BidsSidecar } from '../bids/types/json'
import path from 'path'

describe('HED string parsing', () => {
  const schemaMap = new Map([
    ['8.2.0', undefined],
    ['8.3.0', undefined],
  ])

  beforeAll(async () => {
    const spec2 = new SchemaSpec('', '8.2.0', '', path.join(__dirname, '../tests/data/HED8.2.0.xml'))
    const specs2 = new SchemasSpec().addSchemaSpec(spec2)
    const schemas2 = await buildSchemas(specs2)
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.2.0', schemas2)
    schemaMap.set('8.3.0', schemas3)
  })
  //   it('should include each group as its own single element', () => {
  //const hedString =
  //'Action/Move/Flex,(Relation/Spatial-relation/Left-side-of,Action/Move/Bend,Upper-extremity/Elbow),Position/X-position/70 px,Position/Y-position/23 px'
  //const hedString = 'x/y w/z'
  //const hedString = '(r,z)'
  //const hedString = 'r,'
  //const hedString = 'r,y'
  //const hedString = 'r'
  //const hedString = '(r),p'
  //const hedString = '/x'
  //const hedString = 'x/ /y'
  //const hedString = 'x/'
  //const hedString = '((x))'
  //const hedString = '((xy))'
  //const hedString = '((xy), ( h:p, ((q, r ))), g), h,'
  // const hedString = '((xy), g), h'
  // const tok = new HedStringTokenizer(hedString)
  // const [tagSpecs, groupBounds, tokenizingIssues] = tok.tokenize()
  // assert.isEmpty(Object.values(tokenizingIssues).flat(), 'Parsing issues occurred')
  //const hedString = 'Action/Move/My-flex,(Relation/Spatial-relation/Left-side-of,Action/Move/My-bend,Upper-extremity/My-elbow),Position/X-position/70 m,Position/Y-position/23 m'
  // const [result, issues] = splitHedString(hedString, nullSchema)
  // assert.isEmpty(Object.values(issues).flat(), 'Parsing issues occurred')
  // })

  it('should validate a sidecar', () => {
    const nameE = '/sub03/su03_task-test_run-1_events.tsv'
    const nameJ = '/sub03/su03_task-test_run-1_events.json'
    const eventString = 'onset\tduration\n' + '7\t4.0'
    const schema = schemaMap.get('8.3.0')
    const sidecarObject = {
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, Black',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#, {event_code}',
      },
    }
    const bidsSidecar = new BidsSidecar('thisOne', sidecarObject, { relativePath: nameJ, path: nameJ })
    assert(bidsSidecar instanceof BidsSidecar)

    const sidecarIssues = bidsSidecar.validate(schema)
    assert.isEmpty(Object.values(sidecarIssues).flat(), 'Parsing issues occurred')
    //const bidsEvents = new BidsEventFile("thatOne", [], bidsSidecar, eventString, {relativePath: nameE, path: nameE})
    //assert.InstanceOf(bidsEvents, BidsEventFile)
  })
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
// })

import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import { parseHedString } from '../parser/main'
import { ParsedHedGroup } from '../parser/parsedHedGroup'
import { ParsedHedTag } from '../parser/parsedHedTag'
import { ParsedHedString } from '../parser/parsedHedString'
import { SpecialTagValidator } from '../validator/event/special'

import * as hed from '../validator/event'
import { BidsIssue } from '../bids/types/issues'
import { buildSchemas } from '../validator/schema/init'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import path from 'path'
import { BidsSidecar, BidsTsvFile } from '../bids'
const fs = require('fs')

const displayLog = process.env.DISPLAY_LOG === 'true'

const skippedErrors = {
  VERSION_DEPRECATED: 'Not handling in the spec tests',
  ELEMENT_DEPRECATED: 'Not handling in this round. This is a warning',
  STYLE_WARNING: 'Not handling style warnings at this time',
  'invalid-character-name-value-class-deprecated': 'We will let this pass regardless of schema version.',
}
const readFileSync = fs.readFileSync
const test_file_name = 'javascript_tests.json'
//const test_file_name = 'temp3.json';

function comboListToStrings(items) {
  const comboItems = []
  if (items === undefined || items.length === 0) {
    return comboItems
  }
  for (const item of items) {
    const nextItem = [JSON.stringify(item.sidecar), tsvToString(item.events)]
    comboItems.push(nextItem)
  }
  return comboItems
}

function getMergedSidecar(side1, side2) {
  return Object.assign({}, JSON.parse(side1), side2)
}

function loadTestData() {
  const testFile = path.join(__dirname, test_file_name)
  return JSON.parse(readFileSync(testFile, 'utf8'))
}

const testInfo = loadTestData()

function stringifyList(items) {
  const stringItems = []
  if (items === undefined || items.length === 0) {
    return stringItems
  }
  for (const item of items) {
    stringItems.push(JSON.stringify(item))
  }
  return stringItems
}

function tsvListToStrings(eventList) {
  const eventStrings = []
  if (eventList === undefined || eventList.length === 0) {
    return eventStrings
  }
  for (const item of eventList) {
    eventStrings.push(tsvToString(item))
  }
  return eventStrings
}

function tsvToString(events) {
  return events.map((row) => row.join('\t')).join('\n')
}

function getTagInfo(tag) {
  const name = tag._schemaTag.name
  const remainder = tag._remainder
  const longName = tag.longName
  const canonicalTagName = tag.canonicalTagName
  return `name:${name} remainder:${remainder} longName:${longName} canonical:${canonicalTagName}`
}

describe('HED validation using JSON tests', () => {
  const schemaMap = new Map([
    ['8.2.0', undefined],
    ['8.3.0', undefined],
  ])

  const badLog = []
  let totalTests = 0
  let wrongErrors = 0
  let unexpectedErrors = 0

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

  afterAll(() => {
    const outBad = path.join(__dirname, 'tempLog.txt')
    const summary = `Total tests:${totalTests} Wrong error codes:${wrongErrors} Unexpected errors:${unexpectedErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  test('It should indicate that something is a special tag', () => {
    const special = new SpecialTagValidator()
    const schema3 = schemaMap.get('8.3.0')
    expect(schema3).toBeDefined()
    const testString = 'Onset, Offset/Apple, (Onset, Inset, (Offset, Def/Apple), Def, (Red,(Blue)))'
    const [parseTest, issuesTest] = parseHedString(testString, schema3)

    const issueList = special.checkTags(parseTest.tags)

    const output = []
    for (const item of parseTest.tags) {
      output.push(getTagInfo(item))
    }

    for (const item of parseTest.tagGroups) {
      for (const group of item.subGroupArrayIterator()) {
        console.log(group)
      }
    }
    console.log(output.join('\n'))

    console.log('help')
  })
})

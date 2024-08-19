import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import * as hed from '../validator/event'
import { buildSchemas } from '../validator/schema/init'
import { parseHedString, parseHedStrings } from '../parser/main'
import { ParsedHedTag } from '../parser/parsedHedTag'
import { HedValidator, Hed2Validator, Hed3Validator, validateHedEventWithDefinitions } from '../validator/event'
import { generateIssue } from '../common/issues/issues'
import { Schemas, SchemaSpec, SchemasSpec } from '../common/schema/types'
import path from 'path'
import { parseDefinitions } from '../validator/dataset'
import { BidsHedSidecarValidator, BidsHedTsvValidator, BidsSidecar, BidsTsvFile } from '../bids'
const fs = require('fs')

const readFileSync = fs.readFileSync
const test_file_name = 'nonschema_tests.json'
const some_test_name = 'some_tests.json'
let badLog = [],
  finalLog = []

function bidsIssuesToStr(issues) {
  // Convert a list of issue dictionaries into a string of the hedCode keys.
  return issues.map((issue) => issue.hedIssue.hedCode).join(', ')
}

function getIssueCodes(issues) {
  const codes = new Set()
  if (issues === undefined) {
    return codes
  }
  for (const issue of issues) {
    codes.add(issue.hedCode)
  }
  return codes
}

function issuesToStr(issues) {
  // Convert a list of issue dictionaries into a string of the hedCode keys.
  return issues.map((dict) => dict.hedCode).join(', ')
}

function loadTestData() {
  const testFile = path.join(__dirname, test_file_name)
  // Read and parse the test file synchronously
  const testData = JSON.parse(readFileSync(testFile, 'utf8'))
  const someFile = path.join(__dirname, some_test_name)
  const someData = JSON.parse(readFileSync(someFile, 'utf8'))
  return [testData, someData]
}
const [testInfo, someInfo] = loadTestData()

function stringifyList(items) {
  const stringItems = new Array()
  if (items === undefined || items.length === 0) {
    return stringItems
  }

  for (const item of items) {
    stringItems.push(JSON.stringify(item))
  }
  return stringItems
}

function tsvListToStrings(eventList) {
  const eventStrings = new Array()
  for (const item of eventList) {
    eventStrings.push(tsvToString(item))
  }
  return eventStrings
}

function tsvToString(events) {
  return events.map((row) => row.join('\t')).join('\n')
}

describe('HED validation', () => {
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

  afterAll(() => {
    const outlog = path.join(__dirname, 'test_log.txt')
    fs.writeFileSync(outlog, finalLog.join('\n'), 'utf8')
    const outbad = path.join(__dirname, 'test_badlog.txt')
    fs.writeFileSync(outbad, badLog.join('\n'), 'utf8')
  })

  test('should load testInfo and schemas correctly', () => {
    expect(someInfo).toBeDefined()
    expect(testInfo).toBeDefined()
    expect(schemaMap).toBeDefined()
    const schema2 = schemaMap.get('8.2.0')
    expect(schema2).toBeDefined()
    const schema3 = schemaMap.get('8.3.0')
    expect(schema3).toBeDefined()
  })

  describe.each(someInfo)(
    '$error_code $name : $description',
    ({ error_code, name, description, schema, definitions, tests }) => {
      let hedSchema
      let parsedDefStrings, parsedDefIssues
      let defs, defIssues
      const failedSidecars = stringifyList(tests.sidecar_tests.fails)
      const passedSidecars = stringifyList(tests.sidecar_tests.passes)
      const failedEvents = tsvListToStrings(tests.event_tests.fails)
      const passedEvents = tsvListToStrings(tests.event_tests.passes)

      const eventsValidator = async function (ecode, ename, events, schema, expectError) {
        const bidsTsv = new BidsTsvFile(`events`, events, null, [], definitions)
        const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchema)
        const eventsIssues = await eventsVal.validate()

        const log = new Array()
        const header = `\n${ecode}: ${ename}\tEVENTS:\n"${events}"`
        log.push(header)
        const errors = []
        const errorCodes = new Set()
        for (const issue of eventsIssues) {
          errorCodes.add(issue.hedIssue.hedCode)
          errors.push(`---has error [${issue.hedIssue.hedCode}]`)
        }
        const errorString = errors.join('\n\t')
        if (errorString.length > 0) {
          log.push(`${errorString}`)
        }
        try {
          if (expectError && errorCodes.size > 0 && !errorCodes.has(ecode)) {
            const wrongError = `does not have expected error code ${ecode}`
            log.push(wrongError)
            assert(errorCodes.has(ecode), true, wrongError)
          } else if (!expectError && errorCodes.size > 0) {
            const hasErrors = `should not have errors but has errors ${errorString}`
            log.push(hasErrors)
            assert(errorString.length === 0, true, hasErrors)
          }
        } finally {
          badLog.push(log.join('\n'))
        }
      }

      const sideValidator = async function (ecode, ename, side, schema, expectError) {
        const side1 = JSON.parse(side)
        const bidsSide = new BidsSidecar(`sidecar`, side1, null)
        const sideVal = new BidsHedSidecarValidator(bidsSide, schema)
        const sidecarIssues = await sideVal.validate()

        const log = new Array()
        const header = `\n${ecode}: ${ename}\tSIDECAR: "${side}"`
        log.push(header)
        const errors = []
        const errorCodes = new Set()
        for (const issue of sidecarIssues) {
          errorCodes.add(issue.hedIssue.hedCode)
          errors.push(`--- has error [${issue.hedIssue.hedCode}]`)
        }
        const errorString = errors.join('\n---')
        if (errorString.length > 0) {
          log.push(`---${errorString}`)
        }
        try {
          if (expectError && errorCodes.size > 0 && !errorCodes.has(ecode)) {
            const wrongError = `--- does not have expected error code`
            log.push(wrongError)
            assert(errorCodes.has(ecode), true, wrongError)
          } else if (!expectError && errorCodes.size > 0) {
            const hasErrors = `should not have errors but has errors ${errorString}`
            log.push(hasErrors)
            assert(errorString.length === 0, true, hasErrors)
          }
        } finally {
          badLog.push(log.join('\n'))
        }
      }

      beforeAll(async () => {
        hedSchema = schemaMap.get(schema)
        ;[parsedDefStrings, parsedDefIssues] = parseHedStrings(definitions, hedSchema)
        ;[defs, defIssues] = parseDefinitions(parsedDefStrings)
        finalLog.push(`\n[${error_code}:${name}]: ${description}`)
      })

      test('it should have HED schema defined', () => {
        expect(hedSchema).toBeDefined()
      })

      test('it should have definitions with no issues', () => {
        expect(defIssues).toHaveLength(0)
      })

      // STRING tests
      test.each(tests.string_tests.passes)('Valid string: %s', (str) => {
        const [valid_strings, string_passes_issues] = validateHedEventWithDefinitions(str, hedSchema, defs)

        const stringError = `\tSTRING: "${str}" should be valid but raised ${issuesToStr(string_passes_issues)}`
        if (!valid_strings) {
          badLog.push(`${error_code}: ${name}`)
          badLog.push(stringError)
        }
        assert.strictEqual(valid_strings, true, stringError)
      })

      test.each(tests.string_tests.fails)('Invalid string: %s', (str) => {
        const [invalid_strings, string_fails_issues] = validateHedEventWithDefinitions(str, hedSchema, defs)
        const codes = getIssueCodes(string_fails_issues)

        const stringWrongError = `\tSTRING: "${str}" has error codes ${JSON.stringify([...codes])} not ${error_code}`
        if (!invalid_strings && !codes.has(error_code)) {
          badLog.push(`${error_code}: ${name}`)
          badLog.push(stringWrongError)
        }
        //assert.strictEqual(invalid_strings, false, stringNoError);
        assert(codes.has(error_code), stringWrongError)
      })

      // SIDECAR tests
      test.each(passedSidecars)(`Valid sidecar: %s`, (side) => {
        if (side === '{}') {
          return
        }
        sideValidator(error_code, name, side, hedSchema, false)
      })

      test.each(failedSidecars)(`Invalid sidecar: %s`, (side) => {
        if (side === '{}') {
          return
        }
        sideValidator(error_code, name, side, hedSchema, true)
      })

      test.each(passedEvents)(`Valid events: %s`, (events) => {
        if (events.length === 0) {
          return
        }
        eventsValidator(error_code, name, events, hedSchema, false)
        // const bidsTsv = new BidsTsvFile(`events}`, events, null, [], definitions);
        // const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchema);
        // const eventsIssues = eventsVal.validate();
        // const eventsError = `\tEVENTS: "${events}" should be valid but raised ${eventsIssues.join(',')}`
        // if (eventsIssues.length > 0) {
        //   badLog.push(`${error_code}: ${name}`);
        //   badLog.push(eventsError);
        // }
        // assert(eventsIssues.length === 0,  eventsError);
      })

      test.each(failedEvents)('Invalid events: %s', (events) => {
        if (events.length === 0) {
          return
        }
        eventsValidator(error_code, name, events, hedSchema, true)
        //   const bidsTsv = new BidsTsvFile(`events`, events, null, [], definitions);
        //   const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchema);
        //   const eventsIssues = eventsVal.validate();
        //   const codes = getIssueCodes(eventsIssues);
        //
        //   const eventsWrongError = `\tEVENTS: "${events}" has error codes ${JSON.stringify([...codes])} not ${error_code}`
        //   if (!codes.has(error_code)) {
        //     badLog.push(`${error_code}: ${name}`);
        //     badLog.push(eventsWrongError);
        //   }
        //   assert(codes.has(error_code), eventsWrongError);
        // });
      })
    },
  )
})

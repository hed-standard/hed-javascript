import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import * as hed from '../validator/event'
import { BidsHedIssue } from '../bids/types/issues'
import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import path from 'path'
import { BidsSidecar, BidsTsvFile } from '../bids'
import { generateIssue, IssueError } from '../common/issues/issues'
const fs = require('fs')

const displayLog = process.env.DISPLAY_LOG === 'true'

const skippedErrors = {
  VERSION_DEPRECATED: 'Not handling in the spec tests',
  ELEMENT_DEPRECATED: 'Not handling in this round. This is a warning',
  STYLE_WARNING: 'Not handling style warnings at this time',
  'invalid-character-name-value-class-deprecated': 'We will let this pass regardless of schema version.',
}
const readFileSync = fs.readFileSync
const test_file_name = 'javascriptTests.json'
//const test_file_name = 'temp3.json'

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
    const outBad = path.join(__dirname, 'runLog.txt')
    const summary = `Total tests:${totalTests} Wrong error codes:${wrongErrors} Unexpected errors:${unexpectedErrors}\n`
    if (displayLog) {
      fs.writeFileSync(outBad, summary + badLog.join('\n'), 'utf8')
    }
  })

  test('should load testInfo and schemas correctly', () => {
    expect(testInfo).toBeDefined()
    expect(schemaMap).toBeDefined()
    const schema2 = schemaMap.get('8.2.0')
    expect(schema2).toBeDefined()
    const schema3 = schemaMap.get('8.3.0')
    expect(schema3).toBeDefined()
  })

  describe.each(testInfo)(
    '$error_code $name : $description',
    ({ error_code, alt_codes, name, description, schema, warning, definitions, tests }) => {
      let hedSchema
      let itemLog
      let defs
      let hasWarning
      const failedSidecars = stringifyList(tests.sidecar_tests.fails)
      const passedSidecars = stringifyList(tests.sidecar_tests.passes)
      const failedEvents = tsvListToStrings(tests.event_tests.fails)
      const passedEvents = tsvListToStrings(tests.event_tests.passes)
      const failedCombos = comboListToStrings(tests.combo_tests.fails)
      const passedCombos = comboListToStrings(tests.combo_tests.passes)

      const assertErrors = function (eCode, altCodes, expectError, iLog, header, issues) {
        const errors = []
        const log = [header]
        totalTests += 1

        for (const issue of issues) {
          if (issue instanceof BidsHedIssue) {
            errors.push(`${issue.hedIssue.hedCode}`)
          } else {
            errors.push(`${issue.hedCode}`)
          }
        }
        let altErrorString = ''
        if (altCodes.length > 0) {
          altErrorString = ` or alternative error codes [${altCodes.join(' ,')}] `
        }
        const errorString = errors.join(',')
        if (errors.length > 0) {
          log.push(`---has errors [${errorString}]`)
        }
        const expectedErrors = [...[eCode], ...altCodes]
        const wrongError = `---expected ${eCode} ${altErrorString} but got errors [${errorString}]`
        const hasErrors = `---expected no errors but got errors [${errorString}]`
        if (expectError && !expectedErrors.some((substring) => errorString.includes(substring))) {
          log.push(wrongError)
          iLog.push(log.join('\n'))
          wrongErrors += 1
          assert(errorString.includes(eCode), `${header}---expected ${eCode} and got errors [${errorString}]`)
        } else if (!expectError && errorString.length > 0) {
          log.push(hasErrors)
          iLog.push(log.join('\n'))
          unexpectedErrors += 1
          assert(errorString.length === 0, `${header}---expected no errors but got errors [${errorString}]`)
        }
      }

      const comboValidator = function (eCode, altCodes, eName, side, events, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${eName}](${status})\tCOMBO\t"${side}"\n"${events}"`
        const mergedSide = getMergedSidecar(side, defs)
        let sidecarIssues = []
        try {
          const bidsSide = new BidsSidecar(`sidecar`, mergedSide, { relativePath: 'combo test sidecar' })
          sidecarIssues = bidsSide.validate(schema)
        } catch (e) {
          sidecarIssues = [convertIssue(e)]
        }
        let eventsIssues = []
        try {
          const bidsTsv = new BidsTsvFile(`events`, events, { relativePath: 'combo test tsv' }, [side], mergedSide)
          eventsIssues = bidsTsv.validate(schema)
        } catch (e) {
          eventsIssues = [convertIssue(e)]
        }
        const allIssues = [...sidecarIssues, ...eventsIssues]
        assertErrors(eCode, altCodes, expectError, iLog, header, allIssues)
      }

      const eventsValidator = function (eCode, altCodes, eName, events, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${eName}](${status})\tEvents:\n"${events}"`
        let eventsIssues = []
        try {
          const bidsTsv = new BidsTsvFile(`events`, events, { relativePath: 'events test' }, [], defs)
          eventsIssues = bidsTsv.validate(schema)
        } catch (e) {
          eventsIssues = [convertIssue(e)]
        }
        assertErrors(eCode, altCodes, expectError, iLog, header, eventsIssues)
      }

      const sideValidator = function (eCode, altCodes, eName, side, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${eName}](${status})\tSIDECAR "${side}"`
        const side1 = getMergedSidecar(side, defs)
        let sidecarIssues = []
        try {
          const bidsSide = new BidsSidecar(`sidecar`, side1, { relativePath: 'sidecar test' })
          sidecarIssues = bidsSide.validate(schema)
        } catch (e) {
          sidecarIssues = [convertIssue(e)]
        }
        assertErrors(eCode, altCodes, expectError, iLog, header, sidecarIssues)
      }

      const stringValidator = function (eCode, altCodes, eName, str, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${eName}](${status})\tSTRING: "${str}"`
        const hTsv = `HED\n${str}\n`
        let stringIssues = []
        try {
          const bidsTsv = new BidsTsvFile(`events`, hTsv, { relativePath: 'string test tsv' }, [], defs)
          stringIssues = bidsTsv.validate(schema)
        } catch (e) {
          stringIssues = [convertIssue(e)]
        }
        assertErrors(eCode, altCodes, expectError, iLog, header, stringIssues)
      }

      /**
       * Convert an Error into an Issue.
       *
       * @param {Error} issueError A thrown error.
       * @returns {Issue} A HED issue.
       */
      const convertIssue = function (issueError) {
        if (issueError instanceof IssueError) {
          return issueError.issue
        } else {
          return generateIssue('internalError', { message: issueError.message })
        }
      }

      beforeAll(async () => {
        hedSchema = schemaMap.get(schema)
        defs = { definitions: { HED: { defList: definitions.join(',') } } }
        itemLog = []
        hasWarning = warning
      })

      afterAll(() => {
        badLog.push(itemLog.join('\n'))
      })

      if (error_code in skippedErrors || name in skippedErrors) {
        //badLog.push(`${error_code} skipped because ${skippedErrors["error_code"]}`);
        test.skip(`Skipping tests ${error_code} skipped because ${skippedErrors['error_code']}`, () => {})
      } else {
        test('it should have HED schema defined', () => {
          expect(hedSchema).toBeDefined()
        })

        if (tests.string_tests.passes.length > 0) {
          test.each(tests.string_tests.passes)('Valid string: %s', (str) => {
            stringValidator(error_code, alt_codes, name, str, hedSchema, defs, false, itemLog)
          })
        }

        if (tests.string_tests.fails.length > 0) {
          test.each(tests.string_tests.fails)('Invalid string: %s', (str) => {
            stringValidator(error_code, alt_codes, name, str, hedSchema, defs, true, itemLog)
          })
        }

        if (passedSidecars.length > 0) {
          test.each(passedSidecars)(`Valid sidecar: %s`, (side) => {
            sideValidator(error_code, alt_codes, name, side, hedSchema, defs, false, itemLog)
          })
        }

        if (failedSidecars.length > 0) {
          test.each(failedSidecars)(`Invalid sidecar: %s`, (side) => {
            sideValidator(error_code, alt_codes, name, side, hedSchema, defs, true, itemLog)
          })
        }

        if (passedEvents.length > 0) {
          test.each(passedEvents)(`Valid events: %s`, (events) => {
            eventsValidator(error_code, alt_codes, name, events, hedSchema, defs, false, itemLog)
          })
        }

        if (failedEvents.length > 0) {
          test.each(failedEvents)(`Invalid events: %s`, (events) => {
            eventsValidator(error_code, alt_codes, name, events, hedSchema, defs, true, itemLog)
          })
        }

        if (passedCombos.length > 0) {
          test.each(passedCombos)(`Valid combo: [%s] [%s]`, (side, events) => {
            comboValidator(error_code, alt_codes, name, side, events, hedSchema, defs, false, itemLog)
          })
        }

        if (failedCombos.length > 0) {
          test.each(failedCombos)(`Invalid combo: [%s] [%s]`, (side, events) => {
            comboValidator(error_code, alt_codes, name, side, events, hedSchema, defs, true, itemLog)
          })
        }
      }
    },
  )
})

import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import * as hed from '../validator/event'
import { BidsIssue } from '../bids/types/issues'
import { buildSchemas } from '../validator/schema/init'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import path from 'path'
import { BidsSidecar, BidsTsvFile } from '../bids'
const fs = require('fs')

const readFileSync = fs.readFileSync
//const test_file_name = 'nonschema_tests.json';
const test_file_name = 'some_tests.json'

function comboListToStrings(items) {
  const comboItems = new Array()
  if (items === undefined || items.length === 0) {
    return comboItems
  }
  for (const item of items) {
    const nextItem = [JSON.stringify(item.sidecar), tsvToString(item.events)]
    comboItems.push(nextItem)
  }
  return comboItems
}

function getIssues(expectError, eCode, issues) {
  const errors = new Array()
  const log = new Array()
  for (const issue of issues) {
    if (issue instanceof BidsIssue) {
      errors.push(`${issue.hedIssue.hedCode}`)
    } else {
      errors.push(`${issue.hedCode}`)
    }
  }
  const errorString = errors.join(',')
  if (errors.length > 0) {
    log.push(`---has errors [${errorString}]`)
  }
  const wrongError = `---expected ${eCode} but got errors [${errorString}]`
  const hasErrors = `---expected no errors but got errors [${errorString}]`
  if (expectError && !errorString.includes(eCode)) {
    log.push(wrongError)
  } else if (!expectError && errorString.length > 0) {
    log.push(hasErrors)
  }
  return [log.join('\n'), errorString]
}

function getMergedSidecar(side, definitions) {
  const defSide = { definitions: { HED: { defList: definitions.join(',') } } }
  const defstring = JSON.stringify(defSide)
  const sideJSON = JSON.parse(side)
  const mergedSide = Object.assign({}, sideJSON, defSide)
  return mergedSide
}

function loadTestData() {
  const testFile = path.join(__dirname, test_file_name)
  const testData = JSON.parse(readFileSync(testFile, 'utf8'))
  return testData
}
const testInfo = loadTestData()

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

  const badLog = new Array()

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
    const outBad = path.join(__dirname, 'runlog.txt')
    fs.writeFileSync(outBad, badLog.join('\n'), 'utf8')
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
    ({ error_code, name, description, schema, definitions, tests }) => {
      let hedSchema
      let itemLog
      let defs
      const failedSidecars = stringifyList(tests.sidecar_tests.fails)
      const passedSidecars = stringifyList(tests.sidecar_tests.passes)
      const failedEvents = tsvListToStrings(tests.event_tests.fails)
      const passedEvents = tsvListToStrings(tests.event_tests.passes)
      const failedCombos = comboListToStrings(tests.combo_tests.fails)
      const passedCombos = comboListToStrings(tests.combo_tests.passes)

      const comboValidator = function (eCode, eName, side, events, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${eName}](${status})\tCOMBO\t"${side}"\n"${events}"\n`
        const mergedSide = getMergedSidecar(side, definitions)
        const bidsSide = new BidsSidecar(`sidecar`, mergedSide, null)
        const bidsTsv = new BidsTsvFile(`events`, events, null, [side], mergedSide)
        const sidecarIssues = bidsSide.validate(schema)
        const eventsIssues = bidsTsv.validate(schema)
        const allIssues = [...sidecarIssues, ...eventsIssues]
        const [logString, errorString] = getIssues(expectError, eCode, allIssues)
        iLog.push(header + logString)
        if (expectError) {
          assert(errorString.includes(eCode), `${header}---expected ${eCode} and got errors [${errorString}]`)
        } else {
          assert(errorString.length === 0, `${header}---expected no errors but got errors [${errorString}}]`)
        }
      }

      const eventsValidator = function (eCode, eName, events, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${eName}](${status})\tEvents:\n"${events}"\n`
        const bidsTsv = new BidsTsvFile(`events`, events, null, [], defs)
        const eventsIssues = bidsTsv.validate(schema)
        const [logString, errorString] = getIssues(expectError, eCode, eventsIssues)
        iLog.push(header + logString)
        if (expectError) {
          assert(errorString.includes(eCode), `${header}---expected ${eCode} and got errors [${errorString}]`)
        } else {
          assert(errorString.length === 0, `${header}---expected no errors but got errors [${errorString}}]`)
        }
      }

      const sideValidator = function (eCode, ename, side, schema, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${ename}](${status})\tSIDECAR "${side}"\n`
        const side1 = getMergedSidecar(side, definitions)
        const bidsSide = new BidsSidecar(`sidecar`, side1, null)
        const sidecarIssues = bidsSide.validate(schema)
        const [logString, errorString] = getIssues(expectError, eCode, sidecarIssues)
        iLog.push(header + logString)
        if (expectError) {
          assert(errorString.includes(eCode), `${header}---expected ${eCode} and got errors [${errorString}]`)
        } else {
          assert(errorString.length === 0, `${header}---expected no errors but got errors [${errorString}}]`)
        }
      }

      const stringValidator = function (eCode, ename, str, schema, defs, expectError, iLog) {
        const status = expectError ? 'Expect fail' : 'Expect pass'
        const header = `\n[${eCode} ${ename}](${status})\tSTRING: "${str}"\n`
        const hTsv = `HED\n${str}\n`
        const bidsTsv = new BidsTsvFile(`events`, hTsv, null, [], defs)
        const stringIssues = bidsTsv.validate(schema)
        const [logString, errorString] = getIssues(expectError, eCode, stringIssues)
        iLog.push(header + logString)
        if (expectError) {
          assert(errorString.includes(eCode), `${header}---expected ${eCode} and got errors [${errorString}]`)
        } else {
          assert(errorString.length === 0, `${header}---expected no errors but got errors [${errorString}}]`)
        }
      }

      beforeAll(async () => {
        hedSchema = schemaMap.get(schema)
        defs = getMergedSidecar('{}', definitions)
        itemLog = new Array()
      })

      afterAll(() => {
        badLog.push(itemLog.join('\n'))
      })

      test('it should have HED schema defined', () => {
        expect(hedSchema).toBeDefined()
      })

      if (tests.string_tests.passes.length > 0) {
        test.each(tests.string_tests.passes)('Valid string: %s', (str) => {
          stringValidator(error_code, name, str, hedSchema, defs, false, itemLog)
        })
      }

      if (tests.string_tests.fails.length > 0) {
        test.each(tests.string_tests.fails)('Invalid string: %s', (str) => {
          stringValidator(error_code, name, str, hedSchema, defs, true, itemLog)
        })
      }

      if (passedSidecars.length > 0) {
        test.each(passedSidecars)(`Valid sidecar: %s`, (side) => {
          sideValidator(error_code, name, side, hedSchema, false, itemLog)
        })
      }

      if (failedSidecars.length > 0) {
        test.each(failedSidecars)(`Invalid sidecar: %s`, (side) => {
          sideValidator(error_code, name, side, hedSchema, true, itemLog)
        })
      }

      if (passedEvents.length > 0) {
        test.each(passedEvents)(`Valid events: %s`, (events) => {
          eventsValidator(error_code, name, events, hedSchema, defs, false, itemLog)
        })
      }

      if (failedEvents.length > 0) {
        test.each(failedEvents)('Invalid events: %s', (events) => {
          eventsValidator(error_code, name, events, hedSchema, defs, true, itemLog)
        })
      }

      if (passedCombos.length > 0) {
        test.each(passedCombos)(`Valid combo: [%s] [%s]`, (side, events) => {
          comboValidator(error_code, name, side, events, hedSchema, defs, false, itemLog)
        })
      }

      if (failedCombos.length > 0) {
        test.each(failedCombos)(`Invalid combo: [%s] [%s]`, (side, events) => {
          comboValidator(error_code, name, side, events, hedSchema, defs, true, itemLog)
        })
      }
    },
  )
})

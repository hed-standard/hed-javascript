import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { buildSchemas } from '../validator/schema/init'

import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import { parseHedStrings } from '../parser/main'
import { validateHedEventWithDefinitions } from '../validator/event/init'
import { BidsSidecar } from '../bids/types/json'
import { BidsTsvFile } from '../bids/types/tsv'
import BidsHedSidecarValidator from '../bids/validator/bidsHedSidecarValidator'
import BidsHedTsvValidator from '../bids/validator/bidsHedTsvValidator'
import { parseDefinitions } from '../validator/dataset'
const fs = require('fs')

const readFileSync = fs.readFileSync
let finalLog
let testInfo
let schemaMap
let schemaSpecsMap

function defsToMap(defList) {
  const defMap = {}

  defList.forEach((str, index) => {
    defMap[`def${index + 1}`] = str
  })
  if (defMap.size === 0) {
    return {}
  }
  return { definitions: { HED: defMap } }
}

function tsvToString(events) {
  return events.map((row) => row.join('\t')).join('\n')
}
function bidsIssuesToStr(issues) {
  // Convert a list of issue dictionaries into a string of the hedCode keys.
  return issues.map((issue) => issue.hedIssue.hedCode).join(', ')
}

function issuesToStr(issues) {
  // Convert a list of issue dictionaries into a string of the hedCode keys.
  return issues.map((dict) => dict.hedCode).join(', ')
}

const loadTestData = () => {
  const testFile = 'spec_tests/specification.json'

  // Read and parse the test file synchronously
  const data = readFileSync(testFile, 'utf8')
  testInfo = JSON.parse(data)
}

// Load data before defining the tests
loadTestData()

describe('HED', () => {
  beforeAll(async () => {
    schemaSpecsMap = {}
    schemaMap = {}
    finalLog = ''
    await Promise.all(
      testInfo.map(async (item) => {
        if (!(item['schema'] in schemaMap)) {
          const schemaFile = 'tests/data/HED' + item['schema'] + '.xml'
          const schemaSpec = new SchemaSpec('', item['schema'], '', schemaFile)
          const specs = new SchemasSpec().addSchemaSpec(schemaSpec)
          schemaSpecsMap[item['schema']] = specs
          schemaMap[item['schema']] = await buildSchemas(specs)
        }
      }),
    )
  })

  afterAll(() => {
    console.log(finalLog)
  })

  test('should load testInfo correctly', () => {
    expect(testInfo).toBeDefined()
  })

  // Define dynamic tests
  testInfo.forEach((info) => {
    test(`Tests ${info['error_code']}: ${info['name']}`, () => {
      finalLog = finalLog + `Running test for ${info['error_code']}: ${info['name']}\n`
      const hedSchemas = schemaMap[info['schema']]
      const [parsedDefStrings] = parseHedStrings(info['definitions'], hedSchemas)
      const [definitions, definitionIssues] = parseDefinitions(parsedDefStrings)
      expect(definitionIssues).toHaveLength(0)

      const string_tests_passes = info['tests']['string_tests']['passes']
      string_tests_passes.forEach((str) => {
        const [valid_strings] = validateHedEventWithDefinitions(str, hedSchemas, definitions)
        assert.strictEqual(valid_strings, true, `${str} should be valid`)
      })
      finalLog = finalLog + `\tValid string tests:\n\t\tpassed\n\tInvalid string tests:\n`

      const string_tests_fails = info['tests']['string_tests']['fails']
      string_tests_fails.forEach((str, index) => {
        const [invalid_strings, string_fails_issues] = validateHedEventWithDefinitions(str, hedSchemas, definitions)
        finalLog = finalLog + `\t\tstr[${index}] ${issuesToStr(string_fails_issues)}: ${str}\n`
        assert.strictEqual(invalid_strings, false, `${str} should be invalid`)
      })

      const sidecar_tests_passes = info['tests']['sidecar_tests']['passes']
      sidecar_tests_passes.forEach((sidecar, index) => {
        const bidsSide = new BidsSidecar(`sidecar: ${index}`, sidecar, null)
        const sideVal = new BidsHedSidecarValidator(bidsSide, hedSchemas)
        const sidecarIssues = sideVal.validate()
        expect(sidecarIssues).toHaveLength(0)
      })
      finalLog = finalLog + `\tValid sidecar tests:\n\t\tpassed\n\tInvalid sidecar tests:\n`

      const sidecar_tests_fails = info['tests']['sidecar_tests']['fails']
      sidecar_tests_fails.forEach((sidecar, index) => {
        const bidsSide = new BidsSidecar(`sidecar: ${index}`, sidecar, null)
        const sideVal = new BidsHedSidecarValidator(bidsSide, hedSchemas)
        const sidecarIssues = sideVal.validate()
        finalLog = finalLog + `\t\tsidecar[${index}] ${bidsIssuesToStr(sidecarIssues)} \n`
        expect(sidecarIssues.length).toBeGreaterThan(0)
      })

      const event_tests_passes = info['tests']['event_tests']['passes']
      event_tests_passes.forEach((events, index) => {
        const eventString = tsvToString(events)
        const defDict = defsToMap(info['definitions'])
        const bidsTsv = new BidsTsvFile(`events: ${index}`, eventString, null, [], defDict)
        const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchemas)
        const eventsIssues = eventsVal.validate()
        expect(eventsIssues).toHaveLength(0)
      })
      finalLog = finalLog + `\tValid events tests:\n\t\tpassed\n\tInvalid events tests:\n`

      const event_tests_fails = info['tests']['event_tests']['fails']
      event_tests_fails.forEach((events, index) => {
        const eventString = tsvToString(events)
        const defDict = defsToMap(info['definitions'])
        const bidsTsv = new BidsTsvFile(`events: ${index}`, eventString, null, [], defDict)
        const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchemas)
        const eventsIssues = eventsVal.validate()
        finalLog = finalLog + `\t\tevents[${index}] ${bidsIssuesToStr(eventsIssues)} \n`
        expect(eventsIssues.length).toBeGreaterThan(0)
      })

      const combo_tests_passes = info['tests']['combo_tests']['passes']
      combo_tests_passes.forEach((item, index) => {
        const eventString = tsvToString(item['events'])
        const defDict = defsToMap(info['definitions'])
        const sidecarDict = item['sidecar']
        const mergedJson = { ...sidecarDict, ...defDict }
        const bidsTsv = new BidsTsvFile(`events: ${index}`, eventString, null, [], mergedJson)
        const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchemas)
        const eventsIssues = eventsVal.validate()
        expect(eventsIssues).toHaveLength(0)
      })
      finalLog = finalLog + `\tValid combo tests:\n\t\tpassed\n\tInvalid combo tests:\n`

      const combo_tests_fails = info['tests']['combo_tests']['fails']
      combo_tests_fails.forEach((item, index) => {
        const eventString = tsvToString(item['events'])
        const defDict = defsToMap(info['definitions'])
        const sidecarDict = item['sidecar']
        const mergedJson = { ...sidecarDict, ...defDict }
        const bidsTsv = new BidsTsvFile(`events: ${index}`, eventString, null, [], mergedJson)
        const eventsVal = new BidsHedTsvValidator(bidsTsv, hedSchemas)
        const eventsIssues = eventsVal.validate()
        finalLog = finalLog + `\t\tevents[${index}] ${bidsIssuesToStr(eventsIssues)} \n`
        expect(eventsIssues.length).toBeGreaterThan(0)
      })
    })
  })
})

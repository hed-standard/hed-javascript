import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { BidsHedIssue } from '../src/bids/types/issues'
import { buildSchemas } from '../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../src/schema/specs'
import { Schemas } from '../src/schema/containers'
import path from 'path'
import { BidsSidecar, BidsTsvFile } from '../src/bids'
import { generateIssue, IssueError } from '../src/issues/issues'
import { DefinitionManager } from '../src/parser/definitionManager'
import parseTSV from '../src/bids/tsvParser'
import { shouldRun } from '../tests/testUtilities'
const fs = require('fs')

const skipMap = new Map()
const runAll = true
//const runMap = new Map([['DEF_EXPAND_INVALID', ['def-expand-invalid-missing-placeholder']]])
//const runMap = new Map([['TAG_GROUP_ERROR', ['tag-group-error-missing']]])
const runMap = new Map([['TAG_EXPRESSION_REPEATED', ['tags-duplicated-across-multiple-rows']]])
//const runOnly = new Set(["eventsPass"])
const runOnly = new Set()
const skippedErrors = {
  VERSION_DEPRECATED: 'not handling in the spec tests.',
  ELEMENT_DEPRECATED: 'not handling tag deprecated in the spec tests.',
  STYLE_WARNING: 'not handling style warnings at this time',
  'invalid-character-name-value-class-deprecated': 'not handling deprecated in the spec tests.',
}
const readFileSync = fs.readFileSync
const test_file_name = 'javascriptTests.json'
// const test_file_name = 'temp6.json'

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

  beforeAll(async () => {
    const spec2 = new SchemaSpec('', '8.2.0', '', path.join(__dirname, '../tests/data/HED8.2.0.xml'))
    const specs2 = new SchemasSpec().addSchemaSpec(spec2)

    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)

    const spec3Lib = new SchemaSpec('ts', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
    const specs3Lib = new SchemasSpec().addSchemaSpec(spec3Lib)

    const specScore = new SchemaSpec('sc', '1.0.0', 'score', path.join(__dirname, '../tests/data/HED_score_1.0.0.xml'))
    const specsScore = new SchemasSpec().addSchemaSpec(specScore)

    const [schemas2, schemas3, schemas3lib, schemaScore] = await Promise.all([
      buildSchemas(specs2),
      buildSchemas(specs3),
      buildSchemas(specs3Lib),
      buildSchemas(specsScore),
    ])

    schemaMap.set('8.2.0', schemas2)
    schemaMap.set('8.3.0', schemas3)
    schemaMap.set('ts:8.3.0', schemas3lib)
    schemaMap.set('sc:score_1.0.0', schemaScore)
  })

  afterAll(() => {})

  test('should load testInfo and schemas correctly', () => {
    expect(testInfo).toBeDefined()
    expect(schemaMap).toBeDefined()
    const schema2 = schemaMap.get('8.2.0')
    expect(schema2).toBeDefined()
    const schema3 = schemaMap.get('8.3.0')
    expect(schema3).toBeDefined()
    const schema3lib = schemaMap.get('ts:8.3.0')
    expect(schema3lib).toBeDefined()
    const schemaScore = schemaMap.get('sc:score_1.0.0')
    expect(schemaScore).toBeDefined()
  })

  describe.each(testInfo)(
    '$error_code $name : $description',
    ({ error_code, alt_codes, name, schema, definitions, warning, tests }) => {
      let hedSchema
      let defList
      let expectedErrors
      let noErrors

      const failedSidecars = stringifyList(tests.sidecar_tests.fails)
      const passedSidecars = stringifyList(tests.sidecar_tests.passes)
      const failedEvents = tsvListToStrings(tests.event_tests.fails)
      const passedEvents = tsvListToStrings(tests.event_tests.passes)
      const failedCombos = comboListToStrings(tests.combo_tests.fails)
      const passedCombos = comboListToStrings(tests.combo_tests.passes)

      const assertErrors = function (expectedErrors, issues, header) {
        // Get the set of actual issues that were encountered.
        const errors = new Set()
        for (const issue of issues) {
          if (issue instanceof BidsHedIssue) {
            errors.add(issue.hedIssue.hedCode)
          } else {
            errors.add(issue.hedCode)
          }
        }
        let hasIntersection = [...expectedErrors].some((element) => errors.has(element))
        if (expectedErrors.size === 0 && errors.size === 0) {
          hasIntersection = true
        }
        assert.isTrue(
          hasIntersection,
          `${header} expected one of errors[${[...expectedErrors].join(', ')}] but received [${[...errors].join(', ')}]`,
        )
      }

      const comboValidator = function (side, events, expectedErrors) {
        const status = expectedErrors.size === 0 ? 'Expect pass' : 'Expect fail'
        const header = `\n[${error_code} ${name}](${status})\tCOMBO\t"${side}"\n"${events}"`
        let issues
        try {
          const defManager = new DefinitionManager()
          defManager.addDefinitions(defList)
          const parsedTsv = parseTSV(events)
          assert.instanceOf(parsedTsv, Map, `${events} cannot be parsed`)
          const bidsTsv = new BidsTsvFile(
            `events`,
            { relativePath: 'combo test tsv' },
            parsedTsv,
            JSON.parse(side),
            defManager,
          )
          issues = bidsTsv.validate(hedSchema)
        } catch (e) {
          issues = [convertIssue(e)]
        }
        assertErrors(expectedErrors, issues, header)
      }

      const eventsValidator = function (events, expectedErrors) {
        const status = expectedErrors.size === 0 ? 'Expect pass' : 'Expect fail'
        const header = `\n[${error_code} ${name}](${status})\tEvents:\n"${events}"`
        let eventsIssues
        try {
          const defManager = new DefinitionManager()
          defManager.addDefinitions(defList)
          const parsedTsv = parseTSV(events)
          assert.instanceOf(parsedTsv, Map, `${events} cannot be parsed`)
          const bidsTsv = new BidsTsvFile(`events`, { relativePath: 'events test' }, parsedTsv, {}, defManager)
          eventsIssues = bidsTsv.validate(hedSchema)
        } catch (e) {
          eventsIssues = [convertIssue(e)]
        }
        assertErrors(expectedErrors, eventsIssues, header)
      }

      const sideValidator = function (side, expectedErrors) {
        const status = expectedErrors.size === 0 ? 'Expect pass' : 'Expect fail'
        const header = `\n[${error_code} ${name}](${status})\tSIDECAR "${side}"`
        let issues
        try {
          const defManager = new DefinitionManager()
          defManager.addDefinitions(defList)
          const bidsSide = new BidsSidecar(`sidecar`, { relativePath: 'bidsFile test' }, JSON.parse(side), defManager)
          issues = bidsSide.validate(hedSchema)
        } catch (e) {
          issues = [convertIssue(e)]
        }
        assertErrors(expectedErrors, issues, header)
      }

      const stringValidator = function (str, expectedErrors) {
        const status = expectedErrors.size === 0 ? 'Expect pass' : 'Expect fail'
        const header = `\n[${error_code} ${name}](${status})\tSTRING: "${str}"`
        const hTsv = `onset\tHED\n5.4\t${str}\n`
        let stringIssues
        try {
          const defManager = new DefinitionManager()
          defManager.addDefinitions(defList)
          const parsedTsv = parseTSV(hTsv)
          assert.instanceOf(parsedTsv, Map, `${str} cannot be parsed`)
          const bidsTsv = new BidsTsvFile(`string`, { relativePath: 'string test tsv' }, parsedTsv, {}, defManager)
          stringIssues = bidsTsv.validate(hedSchema)
        } catch (e) {
          stringIssues = [convertIssue(e)]
        }
        assertErrors(expectedErrors, stringIssues, header)
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

      const getSchema = function (schemaVersion) {
        const parts = schemaVersion.split(':', 2)
        const prefix = parts.length === 1 ? '' : parts[0]
        const thisSchema = schemaMap.get(schemaVersion).schemas
        return [prefix, thisSchema.get(prefix)]
      }

      const getSchemas = function (schemaVersion) {
        const hedMap = new Map()
        if (typeof schemaVersion === 'string') {
          const [prefix, schema] = getSchema(schemaVersion)
          hedMap.set(prefix, schema)
        } else {
          for (const version of schemaVersion) {
            const [prefix, schema] = getSchema(version)
            hedMap.set(prefix, schema)
          }
        }
        return new Schemas(hedMap)
      }

      beforeAll(async () => {
        hedSchema = getSchemas(schema)
        assert(hedSchema !== undefined, 'HED schemas required should be defined')
        let defIssues
        ;[defList, defIssues] = DefinitionManager.createDefinitions(definitions, hedSchema)
        assert.equal(defIssues.length, 0, `${name}: input definitions "${definitions}" have errors "${defIssues}"`)
        expectedErrors = new Set(alt_codes)
        expectedErrors.add(error_code)
        noErrors = new Set()
      })

      afterAll(() => {})

      // If debugging a single test
      if (!shouldRun(error_code, name, runAll, runMap, skipMap)) {
        // eslint-disable-next-line no-console
        console.log(`----Skipping JSON Spec tests ${error_code} [${name}]}`)
        return
      }
      // Run tests except for the ones explicitly skipped or because they are warnings
      if (warning) {
        test.skip(`Skipping tests ${error_code} [${name}] skipped because warning not error`, () => {})
      } else if (error_code in skippedErrors) {
        test.skip(`Skipping tests ${error_code} [${name}] skipped because ${skippedErrors[error_code]}`, () => {})
      } else if (name in skippedErrors) {
        test.skip(`Skipping tests ${error_code} [${name}] skipped because ${skippedErrors[name]}`, () => {})
      } else {
        test('it should have HED schema defined', () => {
          expect(hedSchema).toBeDefined()
        })

        if (tests.string_tests.passes.length > 0 && (runOnly.size === 0 || runOnly.has('stringPass'))) {
          test.each(tests.string_tests.passes)('Valid string: %s', (str) => {
            stringValidator(str, new Set())
          })
        }

        if (tests.string_tests.fails.length > 0 && (runOnly.size === 0 || runOnly.has('stringFail'))) {
          test.each(tests.string_tests.fails)('Invalid string: %s', (str) => {
            stringValidator(str, expectedErrors)
          })
        }

        if (passedSidecars.length > 0 && (runOnly.size === 0 || runOnly.has('sidecarPass'))) {
          test.each(passedSidecars)(`Valid sidecar: %s`, (side) => {
            sideValidator(side, noErrors)
          })
        }

        if (failedSidecars.length > 0 && (runOnly.size === 0 || runOnly.has('sidecarFail'))) {
          test.each(failedSidecars)(`Invalid sidecar: %s`, (side) => {
            sideValidator(side, expectedErrors)
          })
        }

        if (passedEvents.length > 0 && (runOnly.size === 0 || runOnly.has('eventsPass'))) {
          test.each(passedEvents)(`Valid events: %s`, (events) => {
            eventsValidator(events, noErrors)
          })
        }

        if (failedEvents.length > 0 && (runOnly.size === 0 || runOnly.has('eventsFail'))) {
          test.each(failedEvents)(`Invalid events: %s`, (events) => {
            eventsValidator(events, expectedErrors)
          })
        }

        if (passedCombos.length > 0 && (runOnly.size === 0 || runOnly.has('combosPass'))) {
          test.each(passedCombos)(`Valid combo: [%s] [%s]`, (side, events) => {
            comboValidator(side, events, noErrors)
          })
        }

        if (failedCombos.length > 0 && (runOnly.size === 0 || runOnly.has('combosFail'))) {
          test.each(failedCombos)(`Invalid combo: [%s] [%s]`, (side, events) => {
            comboValidator(side, events, expectedErrors)
          })
        }
      }
    },
  )
})

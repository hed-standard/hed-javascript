import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { BidsHedIssue } from '../bids/types/issues'
import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import path from 'path'
import { BidsSidecar, BidsTsvFile } from '../bids'
import { generateIssue, IssueError } from '../common/issues/issues'
import { DefinitionManager } from '../parser/definitionManager'
import parseTSV from '../bids/tsvParser'
import { shouldRun } from '../tests/testUtilities'
const fs = require('fs')

const skipMap = new Map()
const runAll = true
//const runMap = new Map([['DEF_EXPAND_INVALID', ['def-expand-invalid-missing-placeholder']]])
const runMap = new Map([['TAG_GROUP_ERROR', ['tag-group-error-missing']]])

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
    const schemas2 = await buildSchemas(specs2)
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.2.0', schemas2)
    schemaMap.set('8.3.0', schemas3)
  })

  afterAll(() => {})

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
            parsedTsv,
            { relativePath: 'combo test tsv' },
            [],
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
          const bidsTsv = new BidsTsvFile(`events`, parsedTsv, { relativePath: 'events test' }, [], {}, defManager)
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
          const bidsSide = new BidsSidecar(`sidecar`, JSON.parse(side), { relativePath: 'sidecar test' }, defManager)
          issues = bidsSide.validate(hedSchema)
        } catch (e) {
          issues = [convertIssue(e)]
        }
        assertErrors(expectedErrors, issues, header)
      }

      const stringValidator = function (str, expectedErrors) {
        const status = expectedErrors.size === 0 ? 'Expect pass' : 'Expect fail'
        const header = `\n[${error_code} ${name}](${status})\tSTRING: "${str}"`
        const hTsv = `HED\n${str}\n`
        let stringIssues
        try {
          const defManager = new DefinitionManager()
          defManager.addDefinitions(defList)
          const parsedTsv = parseTSV(hTsv)
          assert.instanceOf(parsedTsv, Map, `${str} cannot be parsed`)
          const bidsTsv = new BidsTsvFile(`string`, parsedTsv, { relativePath: 'string test tsv' }, [], {}, defManager)
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

      beforeAll(async () => {
        hedSchema = schemaMap.get(schema)
        let defIssues
        ;[defList, defIssues] = DefinitionManager.createDefinitions(definitions, hedSchema)
        assert.equal(defIssues.length, 0, `${name}: input definitions "${definitions}" have errors "${defIssues}"`)
        expectedErrors = new Set(alt_codes)
        expectedErrors.add(error_code)
        noErrors = new Set()
      })

      afterAll(() => {})

      if (!shouldRun(error_code, name, runAll, runMap, skipMap)) {
        console.log(`----Skipping JSON Spec tests ${error_code} [${name}]}`)
        return
      }
      if (error_code in skippedErrors || name in skippedErrors || warning) {
        test.skip(`Skipping tests ${error_code} skipped because ${skippedErrors['error_code']}`, () => {})
      } else {
        test('it should have HED schema defined', () => {
          expect(hedSchema).toBeDefined()
        })

        if (tests.string_tests.passes.length > 0) {
          test.each(tests.string_tests.passes)('Valid string: %s', (str) => {
            stringValidator(str, new Set())
          })
        }

        if (tests.string_tests.fails.length > 0) {
          test.each(tests.string_tests.fails)('Invalid string: %s', (str) => {
            stringValidator(str, expectedErrors)
          })
        }

        if (passedSidecars.length > 0) {
          test.each(passedSidecars)(`Valid sidecar: %s`, (side) => {
            sideValidator(side, noErrors)
          })
        }

        if (failedSidecars.length > 0) {
          test.each(failedSidecars)(`Invalid sidecar: %s`, (side) => {
            sideValidator(side, expectedErrors)
          })
        }

        if (passedEvents.length > 0) {
          test.each(passedEvents)(`Valid events: %s`, (events) => {
            eventsValidator(events, noErrors)
          })
        }

        if (failedEvents.length > 0) {
          test.each(failedEvents)(`Invalid events: %s`, (events) => {
            eventsValidator(events, expectedErrors)
          })
        }

        if (passedCombos.length > 0) {
          test.each(passedCombos)(`Valid combo: [%s] [%s]`, (side, events) => {
            comboValidator(side, events, noErrors)
          })
        }

        if (failedCombos.length > 0) {
          test.each(failedCombos)(`Invalid combo: [%s] [%s]`, (side, events) => {
            comboValidator(side, events, expectedErrors)
          })
        }
      }
    },
  )
})

/**
 * Run the hed-tests JSON validation suite (spec_tests/hed-tests, a git submodule) against this
 * validator.
 *
 * Only validation_tests.json is run. The suite's schema_tests.json validates HED schema files
 * themselves (mediawiki source text); hed-javascript assumes the schemas it loads are valid and
 * does not implement schema validation, so that file is skipped as a block below.
 *
 * Schema loading convention (hed-tests json_test_data/test_schemas/README.md): every version
 * string in a case's "schema" field is resolved against test_schemas/hedxml by its cache-convention
 * file name (HED<version>.xml or HED_<library>_<version>.xml) when such a file exists, and
 * otherwise against the schemas bundled in src/data/schemas. A schema build that throws becomes
 * the issue list of every sub-test of that case, so SCHEMA_LOAD_FAILED cases are expressible.
 *
 * Cases this validator does not pass yet are listed by name in skippedTests.js.
 */
import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, test } from '@jest/globals'
import path from 'node:path'
import fs from 'node:fs'

import { BidsHedIssue } from '../src/bids/types/issues'
import { buildSchemas } from '../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../src/schema/specs'
import { BidsSidecar, BidsTsvFile } from '../src/bids'
import { generateIssue, IssueError } from '../src/issues/issues'
import { DefinitionManager } from '../src/parser/definitionManager'
import parseTSV from '../src/bids/tsvParser'
import { shouldRun } from '../tests/testHelpers/testUtilities'
import { skippedTests } from './skippedTests'

const hedTestsDataDir = path.join(__dirname, 'hed-tests', 'json_test_data')
const testSchemasDir = path.join(hedTestsDataDir, 'test_schemas', 'hedxml')
const validationTestsFile = path.join(hedTestsDataDir, 'validation_tests.json')

// Debugging hooks: set runAll to false and list the cases to run in runMap, or keep runAll and
// list cases to skip in skipMap. Both map an error code to an array of case names (empty = all).
const runAll = true
const runMap = new Map()
const skipMap = new Map()
// Restrict to some sub-test kinds while debugging, e.g. new Set(['stringFail']). Empty = all.
const runOnly = new Set()

function loadTestData() {
  if (!fs.existsSync(validationTestsFile)) {
    throw new Error(
      `${validationTestsFile} not found. The hed-tests submodule is not checked out: run "git submodule update --init".`,
    )
  }
  return JSON.parse(fs.readFileSync(validationTestsFile, 'utf8'))
}

const testInfo = loadTestData()

/**
 * Build the Schemas object for a case's "schema" field.
 *
 * @param {string|string[]} schemaVersions One version string or a list of them.
 * @returns {Promise<Schemas>} The built schemas.
 * @throws {IssueError} If the schemas cannot be built.
 */
function buildTestSchemas(schemaVersions) {
  const versions = typeof schemaVersions === 'string' ? [schemaVersions] : schemaVersions
  const specs = new SchemasSpec()
  for (const version of versions) {
    const spec = SchemaSpec.parseVersionSpec(version)
    const localFile = path.join(testSchemasDir, spec.localName + '.xml')
    if (fs.existsSync(localFile)) {
      spec.localPath = localFile
    }
    specs.addSchemaSpec(spec)
  }
  return buildSchemas(specs)
}

const schemaCache = new Map()

/**
 * Build the schemas for a case, caching by the JSON of the "schema" field.
 *
 * @param {string|string[]} schemaVersions The case's "schema" field.
 * @returns {Promise<Schemas>} The built schemas.
 */
function getTestSchemas(schemaVersions) {
  const key = JSON.stringify(schemaVersions)
  if (!schemaCache.has(key)) {
    schemaCache.set(key, buildTestSchemas(schemaVersions))
  }
  return schemaCache.get(key)
}

/**
 * Convert a thrown error into an issue.
 *
 * @param {Error} error A thrown error.
 * @returns {Issue} The issue.
 */
function convertIssue(error) {
  if (error instanceof IssueError) {
    return error.issue
  }
  return generateIssue('internalError', { message: error.message })
}

/**
 * Separate the error codes and warning codes of a list of issues.
 *
 * @param {Array<Issue|BidsHedIssue>} issues The issues.
 * @returns {[Set<string>, Set<string>]} The error codes and the warning codes.
 */
function extractErrorCodes(issues) {
  const errors = new Set()
  const warnings = new Set()
  for (const issue of issues) {
    const hedIssue = issue instanceof BidsHedIssue ? issue.hedIssue : issue
    if (hedIssue.level === 'error') {
      errors.add(hedIssue.hedCode)
    } else if (hedIssue.level === 'warning') {
      warnings.add(hedIssue.hedCode)
    }
  }
  return [errors, warnings]
}

function tsvToString(events) {
  return events.map((row) => row.join('\t')).join('\n')
}

function stringifyList(items) {
  return (items ?? []).map((item) => JSON.stringify(item))
}

function tsvListToStrings(eventList) {
  return (eventList ?? []).map((events) => tsvToString(events))
}

function comboListToStrings(items) {
  return (items ?? []).map((item) => [JSON.stringify(item.sidecar), tsvToString(item.events)])
}

describe('HED validation using the hed-tests JSON suite', () => {
  test('should load the test data', () => {
    expect(testInfo).toBeDefined()
    expect(testInfo.length).toBeGreaterThan(0)
  })

  describe.each(testInfo)(
    '$error_code $name : $description',
    ({ error_code, alt_codes, name, schema, definitions, warning, tests }) => {
      let hedSchemas = null
      let loadIssue = null
      let defList = []
      let expectedErrors
      const noErrors = new Set()

      const passedStrings = tests.string_tests?.passes ?? []
      const failedStrings = tests.string_tests?.fails ?? []
      const passedSidecars = stringifyList(tests.sidecar_tests?.passes)
      const failedSidecars = stringifyList(tests.sidecar_tests?.fails)
      const passedEvents = tsvListToStrings(tests.event_tests?.passes)
      const failedEvents = tsvListToStrings(tests.event_tests?.fails)
      const passedCombos = comboListToStrings(tests.combo_tests?.passes)
      const failedCombos = comboListToStrings(tests.combo_tests?.fails)

      const assertErrors = function (expected, issues, header) {
        const [errors, warnings] = extractErrorCodes(issues)
        if (warning) {
          assert.isTrue(errors.size === 0, `${header} expected no errors but received [${[...errors].join(', ')}]`)
          let warningIntersection = [...expected].some((element) => warnings.has(element))
          if (expected.size === 0 && warnings.size === 0) {
            warningIntersection = true
          }
          assert.isTrue(
            warningIntersection,
            `${header} expected one of warnings[${[...expected].join(', ')}] but received [${[...warnings].join(', ')}]`,
          )
          return
        }
        let errorIntersection = [...expected].some((element) => errors.has(element))
        if (expected.size === 0 && errors.size === 0) {
          errorIntersection = true
        }
        assert.isTrue(
          errorIntersection,
          `${header} expected one of errors[${[...expected].join(', ')}] but received [${[...errors].join(', ')}]`,
        )
      }

      /**
       * Run a validation, returning the schema load issue instead if the schemas did not build.
       *
       * @param {function(): Array<Issue|BidsHedIssue>} validate The validation to run.
       * @returns {Array<Issue|BidsHedIssue>} The issues.
       */
      const runValidation = function (validate) {
        if (loadIssue !== null) {
          return [loadIssue]
        }
        try {
          return validate()
        } catch (e) {
          return [convertIssue(e)]
        }
      }

      const newDefManager = function () {
        const defManager = new DefinitionManager()
        defManager.addDefinitions(defList)
        return defManager
      }

      const statusOf = (expected) => (expected.size === 0 ? 'Expect pass' : 'Expect fail')

      const stringValidator = function (str, expected) {
        const header = `\n[${error_code} ${name}](${statusOf(expected)})\tSTRING: "${str}"`
        const hTsv = `onset\tHED\n5.4\t${str}\n`
        const issues = runValidation(() => {
          const parsedTsv = parseTSV(hTsv)
          assert.instanceOf(parsedTsv, Map, `${str} cannot be parsed`)
          return new BidsTsvFile('string', { path: 'string test tsv' }, parsedTsv, {}, newDefManager()).validate(
            hedSchemas,
          )
        })
        assertErrors(expected, issues, header)
      }

      const sidecarValidator = function (side, expected) {
        const header = `\n[${error_code} ${name}](${statusOf(expected)})\tSIDECAR "${side}"`
        const issues = runValidation(() =>
          new BidsSidecar('sidecar', { path: 'sidecar test' }, JSON.parse(side), newDefManager()).validate(hedSchemas),
        )
        assertErrors(expected, issues, header)
      }

      const eventsValidator = function (events, expected) {
        const header = `\n[${error_code} ${name}](${statusOf(expected)})\tEvents:\n"${events}"`
        const issues = runValidation(() => {
          const parsedTsv = parseTSV(events)
          assert.instanceOf(parsedTsv, Map, `${events} cannot be parsed`)
          return new BidsTsvFile('events', { path: 'events test' }, parsedTsv, {}, newDefManager()).validate(hedSchemas)
        })
        assertErrors(expected, issues, header)
      }

      const comboValidator = function (side, events, expected) {
        const header = `\n[${error_code} ${name}](${statusOf(expected)})\tCOMBO\t"${side}"\n"${events}"`
        const issues = runValidation(() => {
          const parsedTsv = parseTSV(events)
          assert.instanceOf(parsedTsv, Map, `${events} cannot be parsed`)
          return new BidsTsvFile(
            'events',
            { path: 'combo test tsv' },
            parsedTsv,
            JSON.parse(side),
            newDefManager(),
          ).validate(hedSchemas)
        })
        assertErrors(expected, issues, header)
      }

      beforeAll(async () => {
        expectedErrors = new Set(alt_codes ?? [])
        expectedErrors.add(error_code)
        try {
          hedSchemas = await getTestSchemas(schema)
        } catch (e) {
          loadIssue = convertIssue(e)
          return
        }
        let defIssues
        ;[defList, defIssues] = DefinitionManager.createDefinitions(definitions ?? [], hedSchemas)
        assert.equal(defIssues.length, 0, `${name}: input definitions "${definitions}" have errors "${defIssues}"`)
      })

      if (!shouldRun(error_code, name, runAll, runMap, skipMap)) {
        // eslint-disable-next-line no-console
        console.log(`----Skipping hed-tests case ${error_code} [${name}]`)
        return
      }

      if (name in skippedTests) {
        test.skip(`Skipping ${error_code} [${name}]: ${skippedTests[name]}`, () => {})
        return
      }

      test('it should build the schemas', () => {
        expect(loadIssue === null || expectedErrors.has(loadIssue.hedCode)).toBe(true)
      })

      if (passedStrings.length > 0 && (runOnly.size === 0 || runOnly.has('stringPass'))) {
        test.each(passedStrings)('Valid string: %s', (str) => {
          stringValidator(str, noErrors)
        })
      }

      if (failedStrings.length > 0 && (runOnly.size === 0 || runOnly.has('stringFail'))) {
        test.each(failedStrings)('Invalid string: %s', (str) => {
          stringValidator(str, expectedErrors)
        })
      }

      if (passedSidecars.length > 0 && (runOnly.size === 0 || runOnly.has('sidecarPass'))) {
        test.each(passedSidecars)('Valid sidecar: %s', (side) => {
          sidecarValidator(side, noErrors)
        })
      }

      if (failedSidecars.length > 0 && (runOnly.size === 0 || runOnly.has('sidecarFail'))) {
        test.each(failedSidecars)('Invalid sidecar: %s', (side) => {
          sidecarValidator(side, expectedErrors)
        })
      }

      if (passedEvents.length > 0 && (runOnly.size === 0 || runOnly.has('eventsPass'))) {
        test.each(passedEvents)('Valid events: %s', (events) => {
          eventsValidator(events, noErrors)
        })
      }

      if (failedEvents.length > 0 && (runOnly.size === 0 || runOnly.has('eventsFail'))) {
        test.each(failedEvents)('Invalid events: %s', (events) => {
          eventsValidator(events, expectedErrors)
        })
      }

      if (passedCombos.length > 0 && (runOnly.size === 0 || runOnly.has('comboPass'))) {
        test.each(passedCombos)('Valid combo: [%s] [%s]', (side, events) => {
          comboValidator(side, events, noErrors)
        })
      }

      if (failedCombos.length > 0 && (runOnly.size === 0 || runOnly.has('comboFail'))) {
        test.each(failedCombos)('Invalid combo: [%s] [%s]', (side, events) => {
          comboValidator(side, events, expectedErrors)
        })
      }
    },
  )
})

describe('HED schema tests from the hed-tests JSON suite', () => {
  test.skip('schema_tests.json is not run: hed-javascript assumes the schemas it loads are valid and does not validate schema files', () => {})
})

import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'
import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { BidsHedTsvValidator, BidsSidecar, BidsTsvFile } from '../bids'
import parseTSV from '../bids/tsvParser'
import { IssueError } from '../common/issues/issues'
import { bidsTestData } from './testData/bidsTests.data'
import { shouldRun } from './testUtilities'
import { DefinitionManager } from '../parser/definitionManager'
import { parseHedString } from '../parser/parser'

// Ability to select individual tests to run
//const skipMap = new Map([['definition-tests', ['invalid-missing-definition-for-def', 'invalid-nested-definition']]])
const skipMap = new Map()
const runAll = true
const runMap = new Map([['definition-tests', ['invalid-definition-with-missing-placeholder']]])

describe('BIDS validation', () => {
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

  describe.each(bidsTestData)('$name : $description', ({ name, tests }) => {
    const assertErrors = function (test, type, expectedErrors, issues) {
      const status = expectedErrors.length > 0 ? 'Expect fail' : 'Expect pass'
      const header = `[${name}:${test.testname}][${type}](${status})`
      assert.sameDeepMembers(issues, expectedErrors, header)
    }

    const validate = function (test) {
      // Make sure that the schema is available
      const header = `[${test.testname} (Expect pass)]`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `${header}:${test.schemaVersion} is not available in test ${test.name}`)

      // const defManager = new DefinitionManager()
      // for (const def of test.definitions) {
      //   const [parsedGroup, issueObjs] = parseHedString(def, thisSchema, true, true )
      //   if ( Object.values( issueObjs).flat().length > 0 || !parsedGroup) {
      //     IssueError.generateAndThrow('internalError', { message: 'Bad input definition "${def}" in the test data' })
      //   }
      //   defManager.addDefinition(parsedGroup.tagGroups[0])
      // }

      //Validate the sidecar by itself
      let issues
      let defList

      ;[defList, issues] = DefinitionManager.createDefinitions(test.definitions, thisSchema)
      assert.equal(issues.length, 0, `${header}: input definitions "${test.definitions}" have errors "${issues}"`)
      let defManager = new DefinitionManager()
      issues = defManager.addDefinitions(defList)
      assert.equal(issues.length, 0, `${header}: input definitions "${test.definitions}" have conflicts "${issues}"`)

      const sidecarName = test.testname + '.json'
      const bidsSidecar = new BidsSidecar(
        'thisOne',
        test.sidecar,
        { relativePath: sidecarName, path: sidecarName },
        defManager,
      )
      assert.instanceOf(bidsSidecar, BidsSidecar, 'Test')
      const sidecarIssues = bidsSidecar.validate(thisSchema)
      assertErrors(test, 'Sidecar only', test.sidecarErrors, sidecarIssues)

      // Parse the events file
      const eventName = test.testname + '.tsv'
      defManager = new DefinitionManager()
      defManager.addDefinitions(defList)
      const parsedTsv = parseTSV(test.eventsString)
      assert.instanceOf(parsedTsv, Map, `${eventName} cannot be parsed`)

      // Validate the events file with no sidecar
      const bidsTsv = new BidsTsvFile(
        test.testname,
        parsedTsv,
        { relativePath: eventName, path: eventName },
        [],
        {},
        defManager,
      )
      const validatorNoSide = new BidsHedTsvValidator(bidsTsv, thisSchema)
      validatorNoSide.validate()
      assertErrors(test, 'Events', test.tsvErrors, validatorNoSide.issues)

      // Validate the events file with the sidecar
      defManager = new DefinitionManager()
      defManager.addDefinitions(defList)
      const bidsTsvSide = new BidsTsvFile(
        test.testname,
        parsedTsv,
        { relativePath: eventName, path: eventName },
        [],
        test.sidecar,
        defManager,
      )
      const validatorWithSide = new BidsHedTsvValidator(bidsTsvSide, thisSchema)
      validatorWithSide.validate()
      assertErrors(test, 'Events+side', test.comboErrors, validatorWithSide.issues)
    }

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          validate(test)
        } else {
          console.log(`----Skipping bidsTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

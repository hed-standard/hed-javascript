import path from 'node:path'

import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'

import { buildSchemas } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { parseHedString } from '../../src/parser/parser'
import { definitionTestData } from '../jsonTestData/definitionManagerCreationTests.data'
import { shouldRun } from '../testHelpers/testUtilities'
import { Definition, DefinitionManager } from '../../src/parser/definitionManager'
import { Issue } from '../../src/issues/issues'

const skipMap = new Map()
const runAll = true
const runMap = new Map([['definition-creation-validation', ['valid-definition-creation-from-string']]])

const testDefinitions = function (test, thisSchema, defManager) {
  const status = test.errors.length === 0 ? 'Expect pass' : 'Expect fail'
  const header = `[${test.testname} (${status})]`
  assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.testname}`)

  let thisDefManager
  if (!test.definition) {
    thisDefManager = defManager
  } else {
    thisDefManager = new DefinitionManager()
    const [defsToAdd, defIssues] = DefinitionManager.createDefinitions([test.definition], thisSchema)
    if (defIssues.length > 0) {
      throw new Error(`Invalid test definitions: ${test.definition}`)
    }
    thisDefManager.addDefinitions(defsToAdd)
  }

  // If there should be no errors, check that an illegalDefinitionContext error is detected.
  if (Array.isArray(test.errors) && test.errors.length === 0) {
    const [parsedHed, errorIssues, warningIssues] = parseHedString(test.stringIn, thisSchema, false, true, true)
    assert.isNull(parsedHed)
    assert.deepStrictEqual(warningIssues, [], `${header}: Should have no warnings`)
    assert.strictEqual(errorIssues.length, 1)
    assert.instanceOf(errorIssues[0], Issue, `${header}: Expected errorIssues[0] to be an instance of IssueError`)
    assert.strictEqual(errorIssues[0].internalCode, 'illegalDefinitionContext')
    const [defInfo, defErrorIssues, defWarningIssues] = Definition.createDefinition(test.stringIn, thisSchema)
    assert.instanceOf(defInfo, Definition, `${header}: Expected defInfo to be an instance of Definition`)
    assert.strictEqual(defErrorIssues.length, 0)
    assert.strictEqual(defWarningIssues.length, 0)
  } else if (Array.isArray(test.errors) && test.errors.length > 0) {
    const [defInfo1, defErrorIssues1, defWarningIssues1] = Definition.createDefinition(test.stringIn, thisSchema)
    assert.isNull(defInfo1)
    assert.deepStrictEqual(
      defErrorIssues1,
      test.errors,
      `${header}: expected ${defErrorIssues1} errors but received ${test.errors}\n`,
    )
    assert.strictEqual(defWarningIssues1.length, 0)
  }
}

describe('DefinitionManager tests', () => {
  const schemaMap = new Map([['8.4.0', undefined]])

  beforeAll(async () => {
    const spec3 = new SchemaSpec('', '8.4.0', '', path.join(__dirname, '../../src/data/schemas/HED8.4.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.4.0', schemas3)
  })

  afterAll(() => {})

  describe.each(definitionTestData)('$name : $description', ({ name, schemaVersion, definitions, tests }) => {
    let thisSchema
    let defManager

    beforeAll(async () => {
      thisSchema = schemaMap.get(schemaVersion)
      const [defList, issues] = DefinitionManager.createDefinitions(definitions, thisSchema)
      if (issues.length > 0) {
        throw new Error(`Invalid test definitions: ${definitions}`)
      }
      defManager = new DefinitionManager()
      const addIssues = defManager.addDefinitions(defList)
      if (addIssues.length > 0) {
        throw new Error(`Invalid test definitions: ${definitions}`)
      }
    })

    afterAll(() => {})

    test.each(tests)('$testname: $explanation ', (test) => {
      if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
        testDefinitions(test, thisSchema, defManager)
      } else {
        // eslint-disable-next-line no-console
        console.log(`----Skipping definitionManagerTest ${name}: ${test.testname}`)
      }
    })
  })
})

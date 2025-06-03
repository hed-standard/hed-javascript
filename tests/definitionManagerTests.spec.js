import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../src/schema/specs'
import { parseHedString } from '../src/parser/parser'
import { definitionTestData } from './testData/definitionManagerTests.data'
import { shouldRun } from './testUtilities'
import { DefinitionManager } from '../src/parser/definitionManager'

const skipMap = new Map()
const runAll = true
const runMap = new Map([['def-or-def-expand', ['invalid-def-expand-should-have-a-group']]])

describe('DefinitionManager tests', () => {
  const schemaMap = new Map([['8.3.0', undefined]])

  beforeAll(async () => {
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../src/data/schemas/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
    schemaMap.set('8.3.0', schemas3)
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

    const testDefinitions = function (test) {
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
          throw new Error(`Invalid test definitions: ${definitions}`)
        }
        thisDefManager.addDefinitions(defsToAdd)
      }
      const [parsedHed, errorIssues, warningIssues] = parseHedString(
        test.stringIn,
        thisSchema,
        false,
        test.placeholderAllowed,
        true,
      )
      if (parsedHed === null && errorIssues.length > 0) {
        assert.deepStrictEqual(
          errorIssues,
          test.errors,
          `${header}: expected ${errorIssues} errors but received ${test.errors}\n`,
        )
      }
      if (parsedHed === null) {
        return
      }
      errorIssues.push(...thisDefManager.validateDefs(parsedHed, thisSchema, test.placeholderAllowed))
      errorIssues.push(...thisDefManager.validateDefExpands(parsedHed, thisSchema, test.placeholderAllowed))
      assert.deepStrictEqual(
        errorIssues,
        test.errors,
        `${header}: expected ${errorIssues} errors but received ${test.errors}\n`,
      )
    }

    test.each(tests)('$testname: $explanation ', (test) => {
      if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
        testDefinitions(test)
      } else {
        // eslint-disable-next-line no-console
        console.log(`----Skipping definitionManagerTest ${name}: ${test.testname}`)
      }
    })
  })
})

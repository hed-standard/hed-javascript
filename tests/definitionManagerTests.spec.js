import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { generateIssue, IssueError } from '../common/issues/issues'
import { parseHedString, parseHedStrings } from '../parser/parser'
import { definitionTestData } from './testData/definitionManagerTests.data'
import { shouldRun, getHedString } from './testUtilities'
import { DefinitionManager } from '../parser/definitionManager'

const skipMap = new Map()
const runAll = true
const runMap = new Map([['def-or-def-expand', ['invalid-def-extra-level']]])

describe('DefinitionManager tests', () => {
  const schemaMap = new Map([['8.3.0', undefined]])

  beforeAll(async () => {
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
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

      // Parse the string before converting
      const [parsedString, errorIssues, warningIssues] = getHedString(test.stringIn, thisSchema, test.fullCheck, false)
      const defIssues = defManager.checkDef(parsedString.topLevelTags[0])

      assert.deepStrictEqual(
        defIssues,
        test.errors,
        `${header}: expected ${errorIssues} errors but received ${test.errors}\n`,
      )
    }

    test.each(tests)('$testname: $explanation ', (test) => {
      if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
        testDefinitions(test)
      } else {
        console.log(`----Skipping stringParserTest ${name}: ${test.testname}`)
      }
    })
  })
})

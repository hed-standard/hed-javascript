import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { splitterTestData } from './testData/splitterTests.data'
import { shouldRun } from './testUtilities'
import ParsedHedGroup from '../parser/parsedHedGroup'
import { filterByClass } from '../parser/parseUtils'
import HedStringSplitter from '../parser/splitter'
const skipMap = new Map()
const runAll = true
const runMap = new Map([['valid-strings', ['empty-string']]])

describe('Parse HED string tests', () => {
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

  describe.each(splitterTestData)('$name : $description', ({ name, tests }) => {
    const testSplit = function (test) {
      const header = `[${test.testname}]: ${test.explanation}`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.testname}`)

      const [parsedTags, parsingIssues] = new HedStringSplitter(test.stringIn, thisSchema).splitHedString()
      assert.isEmpty([...parsingIssues], `${header} expects no splitting issues`)

      const parsedGroups = filterByClass(parsedTags, ParsedHedGroup)
      assert.equal(parsedGroups.length, test.allSubgroupCount, `[${header}] should have correct number of subgroups)`)
      for (let i = 0; i < parsedGroups.length; i++) {
        assert.equal(
          parsedGroups[i].allTags.length,
          test.allGroupTagCount[i],
          `[${header}] should have correct number of tags in group ${parsedGroups[i].toString()})`,
        )
      }
    }

    beforeAll(async () => {})

    afterAll(() => {})

    if (tests && tests.length > 0) {
      test.each(tests)('$testname: $explanation ', (test) => {
        if (shouldRun(name, test.testname, runAll, runMap, skipMap)) {
          testSplit(test)
        } else {
          console.log(`----Skipping stringParserTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

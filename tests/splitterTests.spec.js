import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../src/schema/specs'
import { splitterTestData } from './testData/splitterTests.data'
import { shouldRun } from './testHelpers/testUtilities'
import ParsedHedGroup from '../src/parser/parsedHedGroup'
import { filterByClass } from '../src/parser/parseUtils'
import HedStringSplitter from '../src/parser/splitter'
const skipMap = new Map()
const runAll = true
const runMap = new Map([['valid-strings', ['empty-string']]])

describe('Parse HED string tests', () => {
  const schemaMap = new Map([['8.3.0', undefined]])

  beforeAll(async () => {
    const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../src/data/schemas/HED8.3.0.xml'))
    const specs3 = new SchemasSpec().addSchemaSpec(spec3)
    const schemas3 = await buildSchemas(specs3)
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
          // eslint-disable-next-line no-console
          console.log(`----Skipping stringParserTest ${name}: ${test.testname}`)
        }
      })
    }
  })
})

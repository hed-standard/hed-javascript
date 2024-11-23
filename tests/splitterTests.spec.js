import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, afterAll } from '@jest/globals'
import path from 'path'

import { buildSchemas } from '../schema/init'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { splitterTestData } from './testData/splitterTests.data'
import { shouldRun } from './testUtilities'
import ParsedHedGroup from '../parser/parsedHedGroup'
import HedStringSplitter from '../parser/splitter'
const skipMap = new Map()
const runAll = true
const runMap = new Map([['valid-strings', ['multiple-nested-groups']]])

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

  describe('testExperiment', () => {
    /*it('Should give experiment', () => {
      const thisSchema = schemaMap.get('8.3.0')
      // const w = new TagSpec('Speed/5 mph', 0, 10, '')
      // const g = new ParsedHedTag(w, thisSchema, 'Speed/5 mph')
      const stringIn = 'Item, Sensory-event, (Red, Blue, {help}, (Definition/Blech, (Green, Black))), (Orange, ((Definition/Blech1, (White))))'
      //const stringIn = 'Item, ((Def-expand/Apple, (Purple)), (((Def-expand/Banana, (Orange)), Item)), Sensory-event), Red'
      //const stringIn = 'Item/Object, (Length/5 m, (Green)), (Green, Object), (Sensory-event, Green), Red'
      const [parsedString, issues] = parseHedString(stringIn, thisSchema)
      console.log(issues)
*/
  })

  describe.each(splitterTestData)('$name : $description', ({ name, tests }) => {
    const testSplit = function (test) {
      const header = `[${test.testname}]: ${test.explanation}`
      const thisSchema = schemaMap.get(test.schemaVersion)
      assert.isDefined(thisSchema, `header: ${test.schemaVersion} is not available in test ${test.testname}`)

      const [parsedTags, parsingIssues] = new HedStringSplitter(test.stringIn, thisSchema).splitHedString()
      assert.isEmpty([...parsingIssues.syntax, ...parsingIssues.conversion], `${header} expects no splitting issues`)

      const parsedGroups = parsedTags.filter((obj) => obj instanceof ParsedHedGroup)
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

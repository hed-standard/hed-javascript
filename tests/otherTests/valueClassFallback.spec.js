import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemas, buildSchemasFromVersion } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { parseHedString } from '../../src/parser/parser'

// The validators never refuse a schema for a compliance fault: older published schemas have many. A value class
// that cannot be used as written falls back silently to textClass (Kay, 2026-11-05).
describe('Value class fallback for schema faults', () => {
  const codes = (hedString, schemas) =>
    parseHedString(hedString, schemas, false, false, true)[1].map((issue) => issue.hedCode)
  const valueClassNames = (schemas, tagName) =>
    schemas.baseSchema.entries.tags
      .getEntry(tagName.toLowerCase())
      .valueTag.valueClasses.map((valueClass) => valueClass.name)

  describe('a valueClass the schema does not define (HED 8.0.0 labelClass)', () => {
    let schemas

    beforeAll(async () => {
      schemas = await buildSchemasFromVersion('8.0.0')
    })

    it.each(['Parameter-label', 'Timbre'])('%s/# takes textClass in place of the undefined labelClass', (tag) => {
      assert.deepEqual(valueClassNames(schemas, tag), ['textClass'])
    })

    it('leaves a defined value class alone', () => {
      assert.deepEqual(valueClassNames(schemas, 'Label'), ['nameClass'])
    })

    it.each(['Parameter-label/abc', 'Parameter-label/a b', 'Parameter-label/a?b', 'Timbre/abc'])(
      'accepts %s',
      (hedString) => {
        assert.deepEqual(codes(hedString, schemas), [])
      },
    )
  })

  describe('a library value class whose allowedCharacter names an unknown character set', () => {
    let schemas

    beforeAll(async () => {
      const path = 'tests/schemaData/HED_testminimal_2.1.0_unknown_char_set.xml'
      schemas = await buildSchemas(new SchemasSpec().addSchemaSpec(new SchemaSpec('', '2.1.0', 'testminimal', path)))
    })

    it('loads, and the class takes the textClass characters of its standard version (8.5.0: value-text)', () => {
      assert.deepEqual(schemas.baseSchema.entries.valueClasses.getEntry('miniClass').allowedNames, ['value-text'])
    })

    it('keeps checking values of the class', () => {
      assert.deepEqual(codes('Mini-value/abc', schemas), [])
      assert.deepEqual(codes('Mini-value/a b?', schemas), [])
    })
  })
})

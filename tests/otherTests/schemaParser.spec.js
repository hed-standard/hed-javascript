import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { HedSchema, HedSchemas, Schema, Schemas } from '../../src/schema/containers'
import { HedSchemaXMLCollection, SchemaXmlCollection } from '../../src/schema/xmlCollection'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { buildSchemas, buildSchemasFromVersion } from '../../src/schema/init'
import SchemaParser from '../../src/schema/parser/schemaParser'
import SchemaAttribute from '../../src/schema/entries/attribute'
import SchemaProperty from '../../src/schema/entries/property'
import SchemaUnitModifier from '../../src/schema/entries/unitModifier'
import parseSchemaXML from '../../src/utils/xml'
import { IssueError } from '../../src/issues/issues'

/**
 * A minimal standard schema: the given tags, plus the attribute definitions (rooted and every attribute the tags use).
 */
const minimalSchema = (nodes, attributeNames = ['rooted']) => `<?xml version="1.0" encoding="UTF-8"?>
<HED version="8.4.0">
  <schema>${nodes}</schema>
  <unitClassDefinitions/>
  <unitModifierDefinitions/>
  <valueClassDefinitions/>
  <schemaAttributeDefinitions>${attributeNames
    .map((name) => `<schemaAttributeDefinition><name>${name}</name></schemaAttributeDefinition>`)
    .join('')}</schemaAttributeDefinitions>
  <propertyDefinitions/>
</HED>`

/**
 * Parse an XML string as a one-schema merge group and return the thrown issue's code, or null.
 */
const parseError = (xml) => {
  try {
    new SchemaParser(new HedSchemaXMLCollection(parseSchemaXML(xml), '8.4.0')).parse()
    return null
  } catch (error) {
    assert.instanceOf(error, IssueError)
    return error.issue
  }
}

describe('Schema layer (realignment phase 3)', () => {
  describe('invalidSchema', () => {
    it('reports an attribute that the schema does not define', () => {
      const issue = parseError(minimalSchema('<node><name>Item</name><attribute><name>bogus</name></attribute></node>'))
      assert.strictEqual(issue.internalCode, 'invalidSchema')
      assert.strictEqual(issue.hedCode, 'SCHEMA_LOAD_FAILED')
      assert.include(issue.message, 'Schema attribute "bogus" is used but not defined')
    })

    it('reports a rooted attribute with several values', () => {
      const issue = parseError(
        minimalSchema(
          '<node><name>Item</name></node><node><name>Thing</name>' +
            '<attribute><name>rooted</name><value>Item</value><value>Other</value></attribute></node>',
        ),
      )
      assert.strictEqual(issue.internalCode, 'invalidSchema')
      assert.include(issue.message, 'Tag "Thing" has a rooted attribute with several values')
    })

    it('parses the same schema without the faults', () => {
      assert.isNull(parseError(minimalSchema('<node><name>Item</name><node><name>Thing</name></node></node>')))
    })
  })

  describe('malformed schema files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hed-schema-'))
    const cases = [
      ['a file without a HED root', 'not_hed.xml', '<?xml version="1.0"?>\n<foo><bar/></foo>\n'],
      ['a HED root without a schema element', 'no_schema.xml', '<?xml version="1.0"?>\n<HED version="8.4.0"/>\n'],
    ]
    it.each(cases)('reports %s as localSchemaLoadFailed', async (description, fileName, contents) => {
      const filePath = path.join(tmpDir, fileName)
      fs.writeFileSync(filePath, contents)
      const specs = new SchemasSpec().addSchemaSpec(new SchemaSpec('', '8.4.0', '', filePath))
      const error = await buildSchemas(specs).catch((caught) => caught)
      assert.instanceOf(error, IssueError)
      assert.strictEqual(error.issue.internalCode, 'localSchemaLoadFailed')
    })
  })

  describe('attribute model', () => {
    it('makes extensionAllowed recursive in 8.0.0 through the version rule', async () => {
      const schemas = await buildSchemasFromVersion('8.0.0')
      const attributes = schemas.baseSchema.entries.attributes
      assert.isTrue(attributes.getEntry('extensionAllowed').recursive)
      assert.isFalse(attributes.getEntry('requireChild').recursive)
    })

    it('registers every property the schema defines', async () => {
      const schemas = await buildSchemasFromVersion('8.4.0')
      const properties = schemas.baseSchema.entries.properties
      assert.isTrue(properties.hasEntry('annotationProperty'))
      assert.isTrue(properties.hasEntry('tagDomain'))
      assert.strictEqual(properties.length, 14)
    })

    it('compares attributes by property names, including names the schema does not define', () => {
      const known = new SchemaProperty('tagDomain', 'A domain.')
      const first = new SchemaAttribute('attr', 'An attribute.', new Set([known, new SchemaProperty('custom')]), true)
      const same = new SchemaAttribute('attr', 'An attribute.', new Set([new SchemaProperty('custom'), known]), true)
      const other = new SchemaAttribute('attr', 'An attribute.', new Set([known, new SchemaProperty('extra')]), true)
      assert.isTrue(first.equivalent(same))
      assert.isFalse(first.equivalent(other))
    })

    it('gives a single attribute value and throws when there are several', () => {
      const factor = new SchemaAttribute('conversionFactor', undefined, new Set(), false)
      const modifier = new SchemaUnitModifier('k', undefined, new Set(), new Map([[factor, ['1000']]]))
      assert.strictEqual(modifier.getSingleAttributeValue('conversionFactor'), '1000')
      assert.deepStrictEqual(modifier.getAttributeValues('conversionFactor'), ['1000'])
      assert.isUndefined(modifier.getSingleAttributeValue('SIUnitModifier'))
      const twice = new SchemaUnitModifier('m', undefined, new Set(), new Map([[factor, ['1', '2']]]))
      assert.throws(() => twice.getSingleAttributeValue('conversionFactor'), IssueError)
    })
  })

  describe('specifications', () => {
    it('gives the canonical form and compares specifications', () => {
      const standard = new SchemaSpec('', '8.4.0')
      const library = new SchemaSpec('sc', '2.1.0', 'score')
      assert.strictEqual(standard.toString(), '8.4.0')
      assert.strictEqual(library.toString(), 'score_2.1.0')
      assert.isTrue(library.equivalent(new SchemaSpec('sc', '2.1.0', 'score')))
      assert.isFalse(library.equivalent(new SchemaSpec('', '2.1.0', 'score')))
      assert.isTrue(new SchemaSpec('a', '1.0.0', '', 'x.xml').equivalent(new SchemaSpec('b', '2.0.0', '', 'x.xml')))
      assert.isFalse(standard.equivalent('8.4.0'))
    })

    it('rejects a version specification that is neither a string nor a list of strings', () => {
      for (const bad of [undefined, 8, ['8.4.0', 3]]) {
        assert.throws(() => SchemasSpec.parseVersionSpecs(bad), IssueError)
      }
    })

    it('returns a copy of its data', () => {
      const specs = SchemasSpec.parseVersionSpecs(['8.4.0'])
      specs.data.delete('')
      assert.isTrue(specs.data.has(''))
    })
  })

  describe('former class names', () => {
    it('are the renamed classes', async () => {
      assert.strictEqual(Schema, HedSchema)
      assert.strictEqual(Schemas, HedSchemas)
      assert.strictEqual(SchemaXmlCollection, HedSchemaXMLCollection)
      const schemas = await buildSchemasFromVersion('8.4.0')
      assert.instanceOf(schemas, Schemas)
      assert.instanceOf(schemas.baseSchema, Schema)
    })
  })
})

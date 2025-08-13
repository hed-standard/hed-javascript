/**
 * Browser-specific schema initialization.
 *
 * This file is a copy of the original `src/schema/init.js` with the import path for the schema loader modified
 * to point to the browser-specific version.
 */
import zip from 'lodash/zip'

import { loadSchema } from './loader'
import { setParent } from '../../../src/utils/xml'

import SchemaParser from '../../../src/schema/parser'
import PartneredSchemaMerger from '../../../src/schema/schemaMerger'
import { Schema, HedSchemas } from '../../../src/schema/containers'
import { IssueError } from '../../../src/issues/issues'
import { splitStringTrimAndRemoveBlanks } from '../../../src/utils/string'
import { SchemasSpec } from '../../../src/schema/specs'

/**
 * Build a single schema container object from an XML file.
 *
 * @param {Object} xmlData The schema's XML data
 * @returns {HedSchema} The HED schema object.
 */
const buildSchemaObject = function (xmlData) {
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  const schemaEntries = new SchemaParser(rootElement).parse()
  return new Schema(xmlData, schemaEntries)
}

/**
 * Build a single merged schema container object from one or more XML files.
 *
 * @param {Object[]} xmlData The schemas' XML data.
 * @returns {HedSchema} The HED schema object.
 */
const buildSchemaObjects = function (xmlData) {
  const schemas = xmlData.map((data) => buildSchemaObject(data))
  if (schemas.length === 1) {
    return schemas[0]
  }
  const partneredSchemaMerger = new PartneredSchemaMerger(schemas)
  return partneredSchemaMerger.mergeSchemas()
}

/**
 * Build a schema collection object from a schema specification.
 *
 * @param {SchemasSpec} schemaSpecs The description of which schemas to use.
 * @returns {Promise<HedSchemas>} The schema container object and any issues found.
 */
export async function buildSchemas(schemaSpecs) {
  const schemaPrefixes = Array.from(schemaSpecs.data.keys())
  /* Data format example:
   * [[xmlData, ...], [xmlData, xmlData, ...], ...] */
  const schemaXmlData = await Promise.all(
    schemaPrefixes.map((prefix) => {
      const specs = schemaSpecs.data.get(prefix)
      return Promise.all(specs.map((spec) => loadSchema(spec)))
    }),
  )
  const schemaObjects = schemaXmlData.map(buildSchemaObjects)
  const schemas = new Map(zip(schemaPrefixes, schemaObjects))
  return new HedSchemas(schemas)
}

/**
 * Build HED schemas from a version specification string.
 *
 * @param {string} hedVersionString The HED version specification string (can contain comma-separated versions).
 * @returns {Promise<HedSchemas>} A Promise that resolves to the built schemas.
 * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
 */
export async function buildSchemasFromVersion(hedVersionString) {
  hedVersionString ??= ''
  const hedVersionSpecStrings = splitStringTrimAndRemoveBlanks(hedVersionString, ',')
  const hedVersionSpecs = SchemasSpec.parseVersionSpecs(hedVersionSpecStrings)
  return buildSchemas(hedVersionSpecs)
}

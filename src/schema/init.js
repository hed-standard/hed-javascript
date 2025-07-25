import zip from 'lodash/zip'

import loadSchema from './loader'
import { setParent } from '../utils/xml2js'

import SchemaParser from './parser'
import PartneredSchemaMerger from './schemaMerger'
import { Schema, Schemas } from './containers'
import { IssueError } from '../issues/issues'
import { splitStringTrimAndRemoveBlanks } from '../utils/string'
import { SchemasSpec } from './specs'

/**
 * Build a single schema container object from an XML file.
 *
 * @param {Object} xmlData The schema's XML data
 * @returns {Schema} The HED schema object.
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
 * @returns {Schema} The HED schema object.
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
 * @returns {Promise<Schemas>} The schema container object and any issues found.
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
  return new Schemas(schemas)
}

/**
 * Build HED schemas from a version specification string.
 *
 * @param {string} hedVersionString The HED version specification string (can contain comma-separated versions).
 * @returns {Promise<Schemas>} A Promise that resolves to the built schemas.
 * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
 */
export async function buildSchemasFromVersion(hedVersionString) {
  hedVersionString ??= ''
  const hedVersionSpecStrings = splitStringTrimAndRemoveBlanks(hedVersionString, ',')
  const hedVersionSpecs = SchemasSpec.parseVersionSpecs(hedVersionSpecStrings)
  return buildSchemas(hedVersionSpecs)
}

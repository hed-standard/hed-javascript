import zip from 'lodash/zip'
import semver from 'semver'

import { SchemasSpec } from './specs'
import loadSchema from './loader'
import { setParent } from '../utils/xml2js'

import SchemaParser from './parser'
import PartneredSchemaMerger from './schemaMerger'
import { IssueError } from '../issues/issues'
import { Schema, Schemas } from './containers'

/**
 * Determine whether a HED schema is based on the HED 3 spec.
 *
 * @param {object} xmlData HED XML data.
 * @returns {boolean} Whether the schema is a HED 3 schema.
 */
const isHed3Schema = function (xmlData) {
  return xmlData.HED.$.library !== undefined || semver.gte(xmlData.HED.$.version, '8.0.0-alpha.3')
}

/**
 * Build a single schema container object from an XML file.
 *
 * @param {object} xmlData The schema's XML data
 * @returns {Schema} The HED schema object.
 */
const buildSchemaObject = function (xmlData) {
  if (!isHed3Schema(xmlData)) {
    IssueError.generateAndThrow('deprecatedStandardSchemaVersion', { version: xmlData.HED.$.version })
  }
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  const schemaEntries = new SchemaParser(rootElement).parse()
  return new Schema(xmlData, schemaEntries)
}

/**
 * Build a single merged schema container object from one or more XML files.
 *
 * @param {object[]} xmlData The schemas' XML data.
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
  const schemaKeys = Array.from(schemaSpecs.data.keys())
  /* Data format example:
   * [[xmlData, ...], [xmlData, xmlData, ...], ...] */
  const schemaXmlData = await Promise.all(
    schemaKeys.map((k) => {
      const specs = schemaSpecs.data.get(k)
      return Promise.all(specs.map((spec) => loadSchema(spec)))
    }),
  )
  const schemaObjects = schemaXmlData.map(buildSchemaObjects)
  const schemas = new Map(zip(schemaKeys, schemaObjects))
  return new Schemas(schemas)
}

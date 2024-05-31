import zip from 'lodash/zip'
import semver from 'semver'

import { Schema, Schemas, Hed2Schema, Hed3Schema, SchemasSpec, PartneredSchema } from '../../common/schema/types'
import loadSchema from '../../common/schema/loader'
import { buildMappingObject } from '../../converter/schema'
import { setParent } from '../../utils/xml2js'

import { Hed2SchemaParser } from '../hed2/schema/hed2SchemaParser'
import { HedV8SchemaParser, Hed3PartneredSchemaMerger } from './hed3'

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
 * Build a schema attributes object from schema XML data.
 *
 * @param {object} xmlData The schema XML data.
 * @returns {SchemaAttributes|SchemaEntries} The schema attributes object.
 */
export const buildSchemaAttributesObject = function (xmlData) {
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  if (isHed3Schema(xmlData)) {
    return new HedV8SchemaParser(rootElement).parse()
  } else {
    return new Hed2SchemaParser(rootElement).parse()
  }
}

/**
 * Build a single schema container object from an XML file.
 *
 * @param {object} xmlData The schema's XML data
 * @returns {Schema} The HED schema object.
 */
const buildSchemaObject = function (xmlData) {
  const schemaAttributes = buildSchemaAttributesObject(xmlData)
  if (isHed3Schema(xmlData)) {
    const mapping = buildMappingObject(schemaAttributes)
    return new Hed3Schema(xmlData, schemaAttributes, mapping)
  } else {
    return new Hed2Schema(xmlData, schemaAttributes)
  }
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
  const partneredSchema = new PartneredSchema(schemas[0])
  for (const additionalSchema of schemas.slice(1)) {
    new Hed3PartneredSchemaMerger(additionalSchema, partneredSchema).mergeData()
  }
  return partneredSchema
}

/**
 * Build a schema collection object from a schema specification.
 *
 * @param {SchemasSpec} schemaSpecs The description of which schemas to use.
 * @returns {Promise<Schemas>} The schema container object and any issues found.
 */
export const buildSchemas = function (schemaSpecs) {
  const schemaKeys = Array.from(schemaSpecs.data.keys())
  /* Data format example:
   * [[xmlData, ...], [xmlData, xmlData, ...], ...] */
  return Promise.all(
    schemaKeys.map((k) => {
      const specs = schemaSpecs.data.get(k)
      return Promise.all(specs.map((spec) => loadSchema(spec)))
    }),
  ).then((schemaXmlData) => {
    const schemaObjects = schemaXmlData.map(buildSchemaObjects)
    const schemas = new Map(zip(schemaKeys, schemaObjects))
    return new Schemas(schemas)
  })
}

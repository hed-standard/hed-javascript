const zip = require('lodash/zip')

const semver = require('semver')

const loadSchema = require('../../common/schema/loader')
const { Schemas, Hed2Schema, Hed3Schema, SchemasSpec } = require('../../common/schema/types')

const { buildMappingObject } = require('../../converter/schema')
const { setParent } = require('../../utils/xml2js')

const { Hed2SchemaParser } = require('./hed2')
const { HedV8SchemaParser } = require('./hed3')

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
 * @return {SchemaAttributes|SchemaEntries} The schema attributes object.
 */
const buildSchemaAttributesObject = function (xmlData) {
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  if (isHed3Schema(xmlData)) {
    return new HedV8SchemaParser(rootElement).parse()
  } else {
    return new Hed2SchemaParser(rootElement).parse()
  }
}

/**
 * Build a single schema container object from a base schema version or path description.
 *
 * @param {object} xmlData The schema's XML data
 * @returns {Schema} The HED schema object.
 */
const buildSchemaObject = function (xmlData) {
  const schemaAttributes = buildSchemaAttributesObject(xmlData)
  const mapping = buildMappingObject(xmlData)
  if (isHed3Schema(xmlData)) {
    return new Hed3Schema(xmlData, schemaAttributes, mapping)
  } else {
    return new Hed2Schema(xmlData, schemaAttributes, mapping)
  }
}

/**
 * Build a schema collection object from a schema specification.
 *
 * @param {{path: string?, version: string?, libraries: Object<string, {path: string?, version: string?, library: string?}>?}} schemaDef The description of which schemas to use.
 * @param {boolean} useFallback Whether to use a bundled fallback schema if the requested schema cannot be loaded.
 * @return {Promise<never>|Promise<Schemas>} The schema container object or an error.
 * @deprecated
 */
const buildSchema = function (schemaDef = {}, useFallback = true) {
  return loadSchema(schemaDef, useFallback).then(([xmlData, baseSchemaIssues]) => {
    const baseSchema = buildSchemaObject(xmlData)
    if (schemaDef.libraries === undefined) {
      return new Schemas(baseSchema)
    }
    const [libraryKeys, libraryDefs] = zip(...Object.entries(schemaDef.libraries))
    return Promise.all(
      libraryDefs.map((libraryDef) => {
        return loadSchema(libraryDef, false)
      }),
    ).then((libraryXmlDataAndIssues) => {
      const [libraryXmlData, libraryXmlIssues] = zip(...libraryXmlDataAndIssues)
      const librarySchemaObjects = libraryXmlData.map(buildSchemaObject)
      const schemas = new Map(zip(libraryKeys, librarySchemaObjects))
      schemas.set('', baseSchema)
      return new Schemas(schemas)
    })
  })
}

/**
 * Build a schema collection object from a schema specification.
 *
 * @param {Map<string, SchemaSpec>|SchemasSpec} schemaSpecs The description of which schemas to use.
 * @return {Promise<never>|Promise<[Schemas, Issue[]]>} The schema container object and any issues found.
 */
const buildSchemas = function (schemaSpecs) {
  if (schemaSpecs instanceof SchemasSpec) {
    schemaSpecs = schemaSpecs.data
  }
  const schemaKeys = Array.from(schemaSpecs.keys())
  return Promise.all(
    schemaKeys.map((k) => {
      const spec = schemaSpecs.get(k)
      return loadSchema(spec, false, false)
    }),
  ).then((schemaXmlDataAndIssues) => {
    const [schemaXmlData, schemaXmlIssues] = zip(...schemaXmlDataAndIssues)
    const schemaObjects = schemaXmlData.map(buildSchemaObject)
    const schemas = new Map(zip(schemaKeys, schemaObjects))
    return [new Schemas(schemas), schemaXmlIssues.flat()]
  })
}

module.exports = {
  buildSchema,
  buildSchemas,
  buildSchemaAttributesObject,
}

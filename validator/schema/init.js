import castArray from 'lodash/castArray'
import zip from 'lodash/zip'

import semver from 'semver'
import { Schema, Schemas, Hed2Schema, Hed3Schema, SchemasSpec } from '../../common/schema/types'
import { loadSchema } from '../../common/schema/loader'
import { buildMappingObject } from '../../converter/schema'
import { setParent } from '../../utils/xml2js'

import { Hed2SchemaParser } from '../hed2/schema/hed2SchemaParser'
import { HedV8SchemaParser } from './hed3'

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
 * Build a single schema container object from a base schema version or path description.
 *
 * @param {object} xmlData The schema's XML data
 * @returns {Schema} The HED schema object.
 */
const buildSchemaObject = function (xmlData) {
  const xmlDataArray = castArray(xmlData)
  const schemaAttributes = buildSchemaAttributesObject(xmlDataArray[0])
  if (isHed3Schema(xmlDataArray[0])) {
    const mapping = buildMappingObject(schemaAttributes)
    return new Hed3Schema(xmlDataArray[0], schemaAttributes, mapping)
  } else {
    return new Hed2Schema(xmlDataArray[0], schemaAttributes)
  }
}

/**
 * Build a schema collection object from a schema specification.
 *
 * @param {{path: string?, version: string?, libraries: Object<string, {path: string?, version: string?, library: string?}>?}} schemaDef The description of which schemas to use.
 * @param {boolean} useFallback Whether to use a bundled fallback schema if the requested schema cannot be loaded.
 * @returns {Promise<never>|Promise<Schemas>} The schema container object or an error.
 * @deprecated
 */
export const buildSchema = function (schemaDef = {}, useFallback = true) {
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
 * @returns {Promise<never>|Promise<[Schemas, Issue[]]>} The schema container object and any issues found.
 */
export const buildSchemas = function (schemaSpecs) {
  if (schemaSpecs instanceof SchemasSpec) {
    schemaSpecs = schemaSpecs.data
  }
  const schemaKeys = Array.from(schemaSpecs.keys())
  /* Data format example:
   * [[[xmlData, issues], ...], [[xmlData, issues], [xmlData, issues], ...]] */
  return Promise.all(
    schemaKeys.map((k) => {
      const specs = castArray(schemaSpecs.get(k))
      return Promise.all(specs.map((spec) => loadSchema(spec, false, false)))
    }),
  ).then((schemaXmlDataAndIssues) => {
    const [schemaXmlData, schemaXmlIssues] = zip(
      ...schemaXmlDataAndIssues.map((schemaKeyXmlDataAndIssues) => zip(...schemaKeyXmlDataAndIssues)),
    )
    const schemaObjects = schemaXmlData.map(buildSchemaObject)
    const schemas = new Map(zip(schemaKeys, schemaObjects))
    return [new Schemas(schemas), schemaXmlIssues.flat(2)]
  })
}

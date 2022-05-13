const semver = require('semver')

const loadSchema = require('../../common/schema/loader')
const { Schemas, Hed2Schema, Hed3Schema } = require('../../common/schema/types')

const { buildMappingObject } = require('../../converter/schema')
const { setParent } = require('../../utils/xml2js')

const { Hed2SchemaParser } = require('./hed2')
const { HedV8SchemaParser } = require('./hed3')

/**
 * Build a schema attributes object from schema XML data.
 *
 * @param {object} xmlData The schema XML data.
 * @return {SchemaAttributes|SchemaEntries} The schema attributes object.
 */
const buildSchemaAttributesObject = function (xmlData) {
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  if (semver.gte(rootElement.$.version, '8.0.0-alpha.3')) {
    return new HedV8SchemaParser(rootElement).parse()
  } else {
    return new Hed2SchemaParser(rootElement).parse()
  }
}

/**
 * Build a schema container object from a base schema version or path description.
 *
 * @param {{path: string?, version: string?}} schemaDef The description of which base schema to use.
 * @param {boolean} useFallback Whether to use a bundled fallback schema if the requested schema cannot be loaded.
 * @return {Promise<never>|Promise<Schemas>} The schema container object or an error.
 */
const buildSchema = function (schemaDef = {}, useFallback = true) {
  return loadSchema(schemaDef, useFallback).then((xmlData) => {
    const schemaAttributes = buildSchemaAttributesObject(xmlData)
    const mapping = buildMappingObject(xmlData)
    const rootElement = xmlData.HED
    let baseSchema
    if (semver.gte(rootElement.$.version, '8.0.0-alpha.3')) {
      baseSchema = new Hed3Schema(xmlData, schemaAttributes, mapping)
    } else {
      baseSchema = new Hed2Schema(xmlData, schemaAttributes, mapping)
    }
    return new Schemas(baseSchema)
  })
}

module.exports = {
  buildSchema: buildSchema,
  buildSchemaAttributesObject: buildSchemaAttributesObject,
}

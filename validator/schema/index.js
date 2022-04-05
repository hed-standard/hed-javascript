const semver = require('semver')

const schemaUtils = require('../../common/schema')

const { buildMappingObject } = require('../../converter/schema')
const { setParent } = require('../../utils/xml2js')

const { Hed2SchemaParser, HedV8SchemaParser } = require('./parser')
const { SchemaAttributes } = require('./types')

/**
 * Build a schema attributes object from schema XML data.
 *
 * @param {object} xmlData The schema XML data.
 * @return {SchemaAttributes} The schema attributes object.
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
  return schemaUtils.loadSchema(schemaDef, useFallback).then((xmlData) => {
    const schemaAttributes = buildSchemaAttributesObject(xmlData)
    const mapping = buildMappingObject(xmlData)
    const baseSchema = new schemaUtils.Schema(
      xmlData,
      schemaAttributes,
      mapping,
    )
    return new schemaUtils.Schemas(baseSchema)
  })
}

module.exports = {
  buildSchema: buildSchema,
  buildSchemaAttributesObject: buildSchemaAttributesObject,
  SchemaAttributes: SchemaAttributes,
}

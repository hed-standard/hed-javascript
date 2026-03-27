/** This module holds the classes for initializing and building schemas.
 * @module schema/init
 */
import zip from 'lodash/zip'

import loadSchema from './loader'
import { setParent } from '../utils/xml'

import SchemaParser from './parser'
import { UnmergedLibrarySchemaParser } from './parser'
import PartneredSchemaMerger from './schemaMerger'
import { UnmergedLibrarySchemaMerger } from './schemaMerger'
import { Schema, Schemas } from './containers'
import { IssueError } from '../issues/issues'
import { splitStringTrimAndRemoveBlanks } from '../utils/string'
import { SchemaSpec, SchemasSpec } from './specs'

/**
 * Determine whether an XML data object represents an unmerged library schema.
 *
 * A schema is considered unmerged if its root {@code <HED>} element carries both a
 * {@code library} attribute and {@code unmerged="True"}.
 *
 * @param {Object} xmlData The schema XML data.
 * @returns {boolean} Whether the schema is an unmerged library schema.
 */
function isUnmergedLibrary(xmlData) {
  const attrs = xmlData.HED?.$
  return !!(attrs?.library && attrs?.unmerged === 'True')
}

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
 * Build a schema object from unmerged library XML, using the standard partner schema's
 * entries to supply property, attribute, unit-class, unit-modifier, and value-class
 * definitions (all of which are empty in an unmerged library XML file).
 *
 * @param {Object} xmlData The unmerged library schema's XML data.
 * @param {Schema} standardSchema The already-built standard partner schema.
 * @returns {Schema} The HED schema object whose entries contain only the library tags.
 */
const buildUnmergedLibrarySchemaObject = function (xmlData, standardSchema) {
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  const schemaEntries = new UnmergedLibrarySchemaParser(rootElement, standardSchema.entries).parse()
  return new Schema(xmlData, schemaEntries)
}

/**
 * Build a single merged schema container object from one or more XML files.
 *
 * If any of the XML files represents an unmerged library schema the set is processed via
 * {@link UnmergedLibrarySchemaMerger}; otherwise the original {@link PartneredSchemaMerger}
 * is used so that existing merged-library behaviour is preserved.
 *
 * @param {Object[]} xmlData The schemas' XML data.
 * @returns {Schema} The HED schema object.
 */
const buildSchemaObjects = function (xmlData) {
  const hasUnmerged = xmlData.some(isUnmergedLibrary)

  if (!hasUnmerged) {
    // Original path: standard schema or merged library schemas only.
    const schemas = xmlData.map((data) => buildSchemaObject(data))
    if (schemas.length === 1) {
      return schemas[0]
    }
    const partneredSchemaMerger = new PartneredSchemaMerger(schemas)
    return partneredSchemaMerger.mergeSchemas()
  }

  // New path: at least one schema is an unmerged library.
  // Build schema objects sequentially so each unmerged library can reference the most
  // recently seen standard schema for attribute/property/unit-class context.
  const schemas = []
  let lastStandardSchema = null

  for (const data of xmlData) {
    if (isUnmergedLibrary(data)) {
      if (!lastStandardSchema) {
        IssueError.generateAndThrowInternalError(
          'An unmerged library schema was encountered before a standard schema was available.',
        )
      }
      schemas.push(buildUnmergedLibrarySchemaObject(data, lastStandardSchema))
    } else {
      const schema = buildSchemaObject(data)
      if (!data.HED?.$.library) {
        lastStandardSchema = schema
      }
      schemas.push(schema)
    }
  }

  if (schemas.length === 1) {
    return schemas[0]
  }
  return new UnmergedLibrarySchemaMerger(schemas).mergeSchemas()
}

/**
 * For a group of XML data objects loaded for one schema prefix, detect any unmerged library
 * schemas and automatically prepend their standard partner schema if it is not already present.
 *
 * This allows callers to specify only the library version (e.g. {@code lang_1.1.0}) without
 * also having to explicitly list the standard schema.
 *
 * @param {Object[]} xmlDataArray The XML data objects for a single prefix's schema specifications.
 * @returns {Promise<Object[]>} The resolved array, with standard partners inserted as needed.
 */
async function resolveUnmergedSchemas(xmlDataArray) {
  const result = []
  for (const xmlData of xmlDataArray) {
    if (isUnmergedLibrary(xmlData)) {
      const standardVersion = xmlData.HED.$.withStandard
      if (!standardVersion) {
        IssueError.generateAndThrow('invalidSchemaSpecification', {
          spec: `${xmlData.HED.$.library}_${xmlData.HED.$.version}`,
        })
      }
      // Only load the standard partner if it is not already in the result.
      const standardAlreadyPresent = result.some((d) => !d.HED?.$?.library && d.HED?.$?.version === standardVersion)
      if (!standardAlreadyPresent) {
        const standardSpec = new SchemaSpec('', standardVersion, '')
        const standardXmlData = await loadSchema(standardSpec)
        result.push(standardXmlData)
      }
    }
    result.push(xmlData)
  }
  return result
}

/**
 * Inspect the raw XML headers of a loaded schema group and throw early if library schemas
 * within the group declare different {@code withStandard} values, or if an explicit standard
 * schema is present but its version does not match the {@code withStandard} declared by the
 * library schemas.
 *
 * This check runs on the parsed-XML objects returned by {@link loadSchema} — before any
 * expensive {@link SchemaParser} work — so an incompatible group is rejected immediately
 * without wasting CPU on full tag/attribute parsing.
 *
 * @param {Object[]} xmlDataArray The loaded XML data objects for one schema prefix group.
 * @throws {IssueError} If the group contains conflicting {@code withStandard} values.
 */
function validateSchemaGroupCompatibility(xmlDataArray) {
  let expectedWithStandard = null

  for (const xmlData of xmlDataArray) {
    const attrs = xmlData.HED?.$
    const withStandard = attrs?.withStandard
    const isLibrary = !!attrs?.library

    if (isLibrary && withStandard) {
      if (expectedWithStandard === null) {
        expectedWithStandard = withStandard
      } else if (withStandard !== expectedWithStandard) {
        IssueError.generateAndThrow('differentWithStandard', {
          first: withStandard,
          second: expectedWithStandard,
        })
      }
    }
  }

  // If the group contains an explicit standard schema, its version must match withStandard.
  if (expectedWithStandard !== null) {
    for (const xmlData of xmlDataArray) {
      const attrs = xmlData.HED?.$
      if (!attrs?.library && attrs?.version && attrs.version !== expectedWithStandard) {
        IssueError.generateAndThrow('differentWithStandard', {
          first: attrs.version,
          second: expectedWithStandard,
        })
      }
    }
  }
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

  // Validate header-level compatibility before any expensive schema parsing.
  schemaXmlData.forEach(validateSchemaGroupCompatibility)

  // Insert standard-partner schemas for any unmerged library schemas.
  const resolvedXmlData = await Promise.all(schemaXmlData.map((xmlDataArray) => resolveUnmergedSchemas(xmlDataArray)))

  const schemaObjects = resolvedXmlData.map(buildSchemaObjects)
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

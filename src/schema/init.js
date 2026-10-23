/** This module holds the classes for initializing and building schemas.
 * @module schema/init
 */
import zip from 'lodash/zip'

import loadSchema from './loader'

import SchemaParser from './parser/schemaParser'
import { HedSchemaXMLCollection } from './xmlCollection'
import { HedSchema, HedSchemas } from './containers'
import { IssueError } from '../issues/issues'
import { splitStringTrimAndRemoveBlanks } from '../utils/string'
import { SchemaSpec, SchemasSpec } from './specs'

/**
 * Name a schema's XML data for messages.
 *
 * @param {Object} xmlData The schema XML data.
 * @returns {string} "library_version" or "version".
 */
const describe = function (xmlData) {
  const { library, version } = xmlData.HED.$
  return library ? `${library}_${version}` : version
}

/**
 * Check the merge group rules that concern the listed schemas themselves (specification 3.1.2.4).
 *
 * @param {string} prefix The prefix of the merge group.
 * @param {Object[]} xmlData The schemas' XML data.
 * @throws {IssueError} If a schema name appears more than once, or an unpartnered library is not alone.
 */
const checkGroup = function (prefix, xmlData) {
  // A schema name (a library name, or the standard schema) may appear only once in a merge group, whatever the
  // versions.
  const versionsByName = new Map()
  for (const data of xmlData) {
    const name = data.HED.$.library ?? ''
    versionsByName.set(name, [...(versionsByName.get(name) ?? []), data.HED.$.version])
  }
  const problems = []
  for (const [name, versions] of versionsByName) {
    if (versions.length > 1) {
      const what = name ? `library "${name}"` : 'the standard schema'
      problems.push(`${what} is listed ${versions.length} times [${versions.join(', ')}]`)
    }
  }
  if (problems.length > 0) {
    IssueError.generateAndThrow('schemaGroupInvalid', {
      versions: xmlData.map(describe).join(', '),
      problems: problems.join('; '),
    })
  }
  const isUnpartnered = (data) => data.HED.$.library !== undefined && data.HED.$.withStandard === undefined
  if (xmlData.length > 1 && xmlData.some(isUnpartnered)) {
    IssueError.generateAndThrow('nonPartneredSchemaWithAnotherSchema', { prefix })
  }
}

/**
 * Build a single merged schema container object from the XML data of one merge group.
 *
 * @param {string} prefix The prefix of the merge group.
 * @param {Object[]} xmlData The schemas' XML data.
 * @returns {Promise<HedSchema>} The HED schema object.
 * @throws {IssueError} If the group breaks a merge group rule or two of its schemas conflict.
 */
const buildSchemaObjects = async function (prefix, xmlData) {
  checkGroup(prefix, xmlData)

  const standardSchemas = xmlData.filter((data) => data.HED.$.library === undefined)
  const librarySchemas = xmlData.filter((data) => data.HED.$.library !== undefined)
  if (librarySchemas.length === 1 && librarySchemas[0].HED.$.withStandard === undefined) {
    const xmlCollection = new HedSchemaXMLCollection(librarySchemas[0])
    return new HedSchema(librarySchemas[0], new SchemaParser(xmlCollection).parse(), prefix)
  }
  const mergedLibrarySchemas = librarySchemas.filter((data) => data.HED.$.unmerged === undefined)
  const unmergedLibrarySchemas = librarySchemas.filter((data) => data.HED.$.unmerged !== undefined)

  // Every partnered library must have the same standard partner, and a listed standard schema must be that partner.
  const standardVersions = new Set([
    ...standardSchemas.map((data) => data.HED.$.version),
    ...librarySchemas.map((data) => data.HED.$.withStandard),
  ])
  if (standardVersions.size !== 1) {
    IssueError.generateAndThrow('differentWithStandard', {
      versions: [...standardVersions].sort((a, b) => a.localeCompare(b)).join(', '),
    })
  }
  const standardVersion = [...standardVersions][0]

  // The base is the listed standard schema, else the first merged library (a merged file contains its partner).
  let baseSchemaXml = standardSchemas[0] ?? mergedLibrarySchemas.shift()
  if (baseSchemaXml === undefined) {
    baseSchemaXml = await loadSchema(new SchemaSpec(prefix, standardVersion))
  }
  const xmlCollection = new HedSchemaXMLCollection(
    baseSchemaXml,
    standardVersion,
    mergedLibrarySchemas,
    unmergedLibrarySchemas,
  )
  // The group is named after the listed standard schema, else its first library, merged or unmerged: an unmerged
  // library is parsed into its loaded partner but keeps its own name and version, as its merged file would.
  const identitySchemaXml = standardSchemas[0] ?? librarySchemas[0]
  return new HedSchema(identitySchemaXml, new SchemaParser(xmlCollection).parse(), prefix)
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
  const schemaObjects = await Promise.all(
    schemaXmlData.map((xmlData, index) => buildSchemaObjects(schemaPrefixes[index], xmlData)),
  )
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

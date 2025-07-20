/**
 * This module contains functions for building HED schemas for BIDS datasets.
 * @module schema
 */
import castArray from 'lodash/castArray'
import semver from 'semver'

import { buildSchemas } from '../schema/init'
import { IssueError } from '../issues/issues'
import { SchemaSpec, SchemasSpec } from '../schema/specs'
import { BidsJsonFile } from './types/json'

const alphabeticRegExp = new RegExp('^[a-zA-Z]+$')

/**
 * Build a HED schema collection based on the defined BIDS schemas.
 *
 * @param {BidsJsonFile} datasetDescription The description of the BIDS dataset being validated.
 * @returns {Promise} A Promise with the schema collection, or null if the specification is missing.
 * @throws {IssueError} If the schema specification is invalid.
 */
export async function buildBidsSchemas(datasetDescription) {
  const schemasSpec = buildSchemasSpec(datasetDescription)
  if (schemasSpec === null) {
    return null
  }
  return buildSchemas(schemasSpec)
}

/**
 * Build a HED schema specification based on the defined BIDS schemas.
 *
 * @param {BidsJsonFile} datasetDescription The description of the BIDS dataset being validated.
 * @returns {SchemasSpec|null} The schema specification to be used to build the schemas, or null if the specification is missing.
 * @throws {IssueError} If the schema specification is invalid.
 */
export function buildSchemasSpec(datasetDescription) {
  if (datasetDescription.jsonData?.HEDVersion) {
    return parseSchemasSpec(datasetDescription.jsonData.HEDVersion)
  } else {
    return null
  }
}

/**
 * Parse a HED version specification into a schemas specification object.
 *
 * @param {string|string[]} hedVersion The HED version specification, can be a single version string or array of version strings.
 * @returns {SchemasSpec} A schemas specification object containing parsed schema specifications.
 * @throws {IssueError} If any schema specification is invalid.
 */
export function parseSchemasSpec(hedVersion) {
  const schemasSpec = new SchemasSpec()
  const processVersion = castArray(hedVersion)
  for (const schemaVersion of processVersion) {
    const schemaSpec = parseSchemaSpec(schemaVersion)
    schemasSpec.addSchemaSpec(schemaSpec)
  }
  return schemasSpec
}

/**
 * Parse a single schema specification string into a SchemaSpec object.
 *
 * @param {string} schemaVersion A schema version specification string (e.g., "nickname:library_version").
 * @returns {SchemaSpec} A schema specification object with parsed nickname, library, and version.
 * @throws {IssueError} If the schema specification format is invalid.
 */
export function parseSchemaSpec(schemaVersion) {
  const [nickname, schema] = splitPrefixAndSchema(schemaVersion)
  const [library, version] = splitLibraryAndVersion(schema, schemaVersion)
  return new SchemaSpec(nickname, version, library)
}

/**
 * Split a schema version string into prefix (nickname) and schema parts using colon delimiter.
 *
 * @param {string} schemaVersion The schema version string to split.
 * @returns {string[]} An array with [nickname, schema] where nickname may be empty string.
 * @throws {IssueError} If the schema specification format is invalid.
 */
function splitPrefixAndSchema(schemaVersion) {
  return splitVersionSegments(schemaVersion, schemaVersion, ':')
}

/**
 * Split a schema string into library and version parts using underscore delimiter.
 *
 * @param {string} schemaVersion The schema string to split (library_version format).
 * @param {string} originalVersion The original version string for error reporting.
 * @returns {string[]} An array with [library, version] where library may be empty string.
 * @throws {IssueError} If the schema specification format is invalid or version is not valid semver.
 */
function splitLibraryAndVersion(schemaVersion, originalVersion) {
  const [library, version] = splitVersionSegments(schemaVersion, originalVersion, '_')
  if (!semver.valid(version)) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
  }
  return [library, version]
}

/**
 * Split a version string into two segments using the specified delimiter.
 *
 * @param {string} schemaVersion The version string to split.
 * @param {string} originalVersion The original version string for error reporting.
 * @param {string} splitCharacter The character to use as delimiter (':' or '_').
 * @returns {string[]} An array with [firstSegment, secondSegment] where firstSegment may be empty string.
 * @throws {IssueError} If the schema specification format is invalid or contains non-alphabetic characters in first segment.
 */
function splitVersionSegments(schemaVersion, originalVersion, splitCharacter) {
  const versionSplit = schemaVersion.split(splitCharacter)
  const secondSegment = versionSplit.pop()
  const firstSegment = versionSplit.pop()
  if (versionSplit.length > 0) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
  }
  if (firstSegment !== undefined && !alphabeticRegExp.test(firstSegment)) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
  }
  return [firstSegment ?? '', secondSegment]
}

/**
 * Build HED schemas from a version specification string.
 *
 * @param {string} hedVersionString The HED version specification string (can contain comma-separated versions).
 * @returns {Promise<any>} A Promise that resolves to the built schemas.
 * @throws {Error} If the schema specification is invalid or schemas cannot be built.
 */
export async function buildSchemasFromVersion(hedVersionString) {
  let hedVersionValue = hedVersionString.trim()
  if (hedVersionValue.includes(',')) {
    hedVersionValue = hedVersionValue
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  const hedVersionSpec = new BidsJsonFile(
    'HED schema input',
    { path: 'HED schema version input' },
    { HEDVersion: hedVersionValue },
  )

  const hedSchemas = await buildBidsSchemas(hedVersionSpec)

  if (!hedSchemas) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: hedVersionString })
  }

  return hedSchemas
}

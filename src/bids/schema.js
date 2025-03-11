import castArray from 'lodash/castArray'
import semver from 'semver'

import { buildSchemas } from '../schema/init'
import { IssueError } from '../issues/issues'
import { SchemaSpec, SchemasSpec } from '../schema/specs'

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

export function parseSchemasSpec(hedVersion) {
  const schemasSpec = new SchemasSpec()
  const processVersion = castArray(hedVersion)
  for (const schemaVersion of processVersion) {
    const schemaSpec = parseSchemaSpec(schemaVersion)
    schemasSpec.addSchemaSpec(schemaSpec)
  }
  return schemasSpec
}

export function parseSchemaSpec(schemaVersion) {
  const [nickname, schema] = splitPrefixAndSchema(schemaVersion)
  const [library, version] = splitLibraryAndVersion(schema, schemaVersion)
  return new SchemaSpec(nickname, version, library)
}

function splitPrefixAndSchema(schemaVersion) {
  return splitVersionSegments(schemaVersion, schemaVersion, ':')
}

function splitLibraryAndVersion(schemaVersion, originalVersion) {
  const [library, version] = splitVersionSegments(schemaVersion, originalVersion, '_')
  if (!semver.valid(version)) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
  }
  return [library, version]
}

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

//export default buildBidsSchemas

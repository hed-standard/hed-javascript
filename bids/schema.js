import castArray from 'lodash/castArray'
import semver from 'semver'

import { buildSchemas } from '../validator/schema/init'
import { generateIssue, IssueError } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'

const alphabeticRegExp = new RegExp('^[a-zA-Z]+$')

/**
 * Build a HED schema collection based on the defined BIDS schemas.
 *
 * @param {BidsDataset} dataset The BIDS dataset being validated.
 * @param {SchemasSpec} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<Schemas>} A Promise with the schema collection and any issues found, or an issue list upon failure.
 * @throws {IssueError} If the schema specification is invalid or missing.
 */
export async function buildBidsSchemas(dataset, schemaDefinition) {
  let schemasSpec
  if (schemaDefinition) {
    schemasSpec = validateSchemasSpec(schemaDefinition)
  } else if (dataset.datasetDescription.jsonData?.HEDVersion) {
    schemasSpec = parseSchemasSpec(dataset.datasetDescription.jsonData.HEDVersion)
  } else {
    throw new IssueError(generateIssue('invalidSchemaSpecification', { spec: 'no schema available' }))
  }
  return buildSchemas(schemasSpec)
}

function validateSchemasSpec(schemasSpec) {
  if (schemasSpec instanceof SchemasSpec) {
    return schemasSpec
  } else {
    throw new IssueError(generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemasSpec) }))
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
  const [nickname, schema] = splitNicknameAndSchema(schemaVersion)
  const [library, version] = splitLibraryAndVersion(schema, schemaVersion)
  return new SchemaSpec(nickname, version, library)
}

function splitNicknameAndSchema(schemaVersion) {
  const nicknameSplit = schemaVersion.split(':')
  let nickname = ''
  let schema
  if (nicknameSplit.length > 2) {
    throw new IssueError(generateIssue('invalidSchemaSpecification', { spec: schemaVersion }))
  }
  if (nicknameSplit.length > 1) {
    ;[nickname, schema] = nicknameSplit
    if (!alphabeticRegExp.test(nickname)) {
      throw new IssueError(generateIssue('invalidSchemaNickname', { nickname: nickname, spec: schemaVersion }))
    }
  } else {
    schema = nicknameSplit[0]
  }
  return [nickname, schema]
}

function splitLibraryAndVersion(schemaVersion, originalVersion) {
  const versionSplit = schemaVersion.split('_')
  let library = ''
  let version
  if (versionSplit.length > 2) {
    throw new IssueError(generateIssue('invalidSchemaSpecification', { spec: originalVersion }))
  }
  if (versionSplit.length > 1) {
    ;[library, version] = versionSplit
    if (!alphabeticRegExp.test(library)) {
      throw new IssueError(generateIssue('invalidSchemaSpecification', { spec: originalVersion }))
    }
  } else {
    version = versionSplit[0]
  }
  if (!semver.valid(version)) {
    throw new IssueError(generateIssue('invalidSchemaSpecification', { spec: originalVersion }))
  }
  return [library, version]
}

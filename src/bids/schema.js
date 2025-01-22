import castArray from 'lodash/castArray'
import semver from 'semver'

import { buildSchemas } from '../schema/init'
import { IssueError } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../schema/specs'

const alphabeticRegExp = new RegExp('^[a-zA-Z]+$')

/**
 * Build a HED schema collection based on the defined BIDS schemas.
 *
 * @param {BidsJsonFile} datasetDescription The description of the BIDS dataset being validated.
 * @param {SchemasSpec} schemaDefinition The version spec override for the schema to be loaded.
 * @returns {Promise} A Promise with the schema collection, or null if the specification is missing.
 * @throws {IssueError} If the schema specification is invalid.
 */
export async function buildBidsSchemas(datasetDescription, schemaDefinition) {
  const schemasSpec = buildSchemasSpec(datasetDescription, schemaDefinition)
  if (schemasSpec === null) {
    return null
  }
  return buildSchemas(schemasSpec)
}

/**
 * Build a HED schema specification based on the defined BIDS schemas.
 *
 * @param {BidsJsonFile} datasetDescription The description of the BIDS dataset being validated.
 * @param {SchemasSpec} schemaDefinition The version spec override for the schema to be loaded.
 * @returns {SchemasSpec|null} The schema specification to be used to build the schemas, or null if the specification is missing.
 * @throws {IssueError} If the schema specification is invalid.
 */
export function buildSchemasSpec(datasetDescription, schemaDefinition) {
  if (schemaDefinition) {
    return validateSchemasSpec(schemaDefinition)
  } else if (datasetDescription.jsonData?.HEDVersion) {
    return parseSchemasSpec(datasetDescription.jsonData.HEDVersion)
  } else {
    return null
  }
}

function validateSchemasSpec(schemasSpec) {
  if (schemasSpec instanceof SchemasSpec) {
    return schemasSpec
  } else {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: JSON.stringify(schemasSpec) })
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
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: schemaVersion })
  }
  if (nicknameSplit.length > 1) {
    ;[nickname, schema] = nicknameSplit
    if (!alphabeticRegExp.test(nickname)) {
      IssueError.generateAndThrow('invalidSchemaNickname', { nickname: nickname, spec: schemaVersion })
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
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
  }
  if (versionSplit.length > 1) {
    ;[library, version] = versionSplit
    if (!alphabeticRegExp.test(library)) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
    }
  } else {
    version = versionSplit[0]
  }
  if (!semver.valid(version)) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
  }
  return [library, version]
}

//export default buildBidsSchemas

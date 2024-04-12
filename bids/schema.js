import castArray from 'lodash/castArray'
import semver from 'semver'

import { buildSchemas } from '../validator/schema/init'
import { generateIssue } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'

const alphanumericRegExp = new RegExp('^[a-zA-Z0-9]+$')

/**
 * Build a HED schema collection based on the defined BIDS schemas.
 *
 * @param {BidsDataset} dataset The BIDS dataset being validated.
 * @param {object} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<[Schemas,Issue[]]>|Promise<never>} A Promise with the schema collection and any issues found, or an issue list upon failure.
 */
export function buildBidsSchemas(dataset, schemaDefinition) {
  let schemasSpec
  let issues
  if (schemaDefinition) {
    ;[schemasSpec, issues] = validateSchemasSpec(schemaDefinition)
  } else if (dataset.datasetDescription.jsonData?.HEDVersion) {
    ;[schemasSpec, issues] = parseSchemasSpec(dataset.datasetDescription.jsonData.HEDVersion)
  } else {
    ;[schemasSpec, issues] = [null, [generateIssue('invalidSchemaSpecification', { spec: 'no schema available' })]]
  }
  if (issues.length > 0) {
    return Promise.reject(issues)
  } else {
    return buildSchemas(schemasSpec).then(([schemas]) => [schemas, issues])
  }
}

export function validateSchemasSpec(schemasSpec) {
  // TODO: implement
  if (schemasSpec instanceof SchemasSpec) {
    return [schemasSpec, []]
  } else if (schemasSpec instanceof Map) {
    const newSchemasSpec = new SchemasSpec()
    newSchemasSpec.data = schemasSpec
    return [newSchemasSpec, []]
  } else {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemasSpec) })]]
  }
}

export function parseSchemasSpec(hedVersion) {
  const schemasSpec = new SchemasSpec()
  const processVersion = castArray(hedVersion)
  const issues = []
  for (const schemaVersion of processVersion) {
    const [schemaSpec, verIssues] = parseSchemaSpec(schemaVersion)
    if (verIssues.length > 0) {
      issues.push(...verIssues)
    } else {
      schemasSpec.addSchemaSpec(schemaSpec)
    }
  }
  return [schemasSpec, issues]
}

export function parseSchemaSpec(schemaVersion) {
  const [[nickname, schema], nicknameIssues] = splitNicknameAndSchema(schemaVersion)
  if (nicknameIssues.length > 0) {
    return [null, nicknameIssues]
  }
  const [[library, version], libraryIssues] = splitLibraryAndVersion(schema, schemaVersion)
  if (libraryIssues.length > 0) {
    return [null, libraryIssues]
  }
  const schemaSpec = new SchemaSpec(nickname, version, library)
  return [schemaSpec, []]
}

function splitNicknameAndSchema(schemaVersion) {
  const nicknameSplit = schemaVersion.split(':')
  let nickname = ''
  let schema
  if (nicknameSplit.length > 2) {
    return [['', ''], [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
  }
  if (nicknameSplit.length > 1) {
    ;[nickname, schema] = nicknameSplit
    if (nickname === '' || !alphanumericRegExp.test(nickname)) {
      return [['', ''], [generateIssue('invalidSchemaNickname', { nickname: nickname, spec: schemaVersion })]]
    }
  } else {
    schema = nicknameSplit[0]
  }
  return [[nickname, schema], []]
}

function splitLibraryAndVersion(schemaVersion, originalVersion) {
  const versionSplit = schemaVersion.split('_')
  let library = ''
  let version
  if (versionSplit.length > 2) {
    return [['', ''], [generateIssue('invalidSchemaSpecification', { spec: originalVersion })]]
  }
  if (versionSplit.length > 1) {
    ;[library, version] = versionSplit
    if (library === '' || !alphanumericRegExp.test(library)) {
      return [['', ''], [generateIssue('invalidSchemaSpecification', { spec: originalVersion })]]
    }
  } else {
    version = versionSplit[0]
  }
  if (!semver.valid(version)) {
    return [['', ''], [generateIssue('invalidSchemaSpecification', { spec: originalVersion })]]
  }
  return [[library, version], []]
}

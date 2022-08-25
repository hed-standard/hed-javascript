const semver = require('semver')
const { buildSchemas } = require('../schema/init')
const { generateIssue } = require('../../common/issues/issues')
const { SchemaSpec, SchemasSpec } = require('../../common/schema/types')
const { BidsHedIssue } = require('./types')
const { asArray } = require('../../utils/array')

const alphanumericRegExp = new RegExp('^[a-zA-Z0-9]+$')

function buildBidsSchemas(dataset, schemaDefinition) {
  let schemasSpec
  let issues
  if (schemaDefinition) {
    ;[schemasSpec, issues] = validateSchemasSpec(schemaDefinition)
  } else if (dataset.datasetDescription.jsonData && dataset.datasetDescription.jsonData.HEDVersion) {
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

function validateSchemasSpec(schemasSpec) {
  // ToDO: implement
  if (schemasSpec instanceof SchemasSpec) {
    return [schemasSpec, []]
  } else if (schemasSpec instanceof Map) {
    const newSchemasSpec = new SchemasSpec()
    newSchemasSpec.data = schemasSpec
    return [newSchemasSpec, []]
  } else if ('version' in schemasSpec || 'path' in schemasSpec || 'libraries' in schemasSpec) {
    return [convertOldSpecToSchemasSpec(schemasSpec), []]
  } else {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemasSpec) })]]
  }
}

function convertOldSpecToSchemasSpec(oldSpec) {
  const newSpec = new SchemasSpec()
  // TODO:  implement
  return newSpec
}

function parseSchemasSpec(hedVersion) {
  const schemasSpec = new SchemasSpec()
  const processVersion = asArray(hedVersion)
  const issues = []
  for (const schemaVersion of processVersion) {
    const [schemaSpec, verIssues] = parseSchemaSpec(schemaVersion)
    if (verIssues.length > 0) {
      issues.push(...verIssues)
    } else if (schemasSpec.isDuplicate(schemaSpec)) {
      issues.push(generateIssue('invalidSchemaNickname', { spec: schemaVersion, nickname: schemaSpec.nickname }))
    } else {
      schemasSpec.addSchemaSpec(schemaSpec)
    }
  }
  return [schemasSpec, issues]
}

function parseSchemaSpec(schemaVersion) {
  const nicknameSplit = schemaVersion.split(':')
  let nickname = ''
  let schema
  if (nicknameSplit.length > 2) {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
  }
  if (nicknameSplit.length > 1) {
    ;[nickname, schema] = nicknameSplit
    if (nickname === '' || !alphanumericRegExp.test(nickname)) {
      return [null, [generateIssue('invalidSchemaNickname', { nickname: nickname, spec: schemaVersion })]]
    }
  } else {
    schema = nicknameSplit[0]
  }
  const versionSplit = schema.split('_')
  let library = ''
  let version
  if (versionSplit.length > 2) {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
  }
  if (versionSplit.length > 1) {
    ;[library, version] = versionSplit
    if (library === '' || !alphanumericRegExp.test(library)) {
      return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
    }
  } else {
    version = versionSplit[0]
  }
  if (!semver.valid(version)) {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
  }
  const schemaSpec = new SchemaSpec(nickname, version, library)
  return [schemaSpec, []]
}

function validateSchemaSpec(schemaSpec) {
  // ToDO: implement
  if (!(schemaSpec instanceof SchemaSpec)) {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemaSpec) })]]
  }
  return [schemaSpec, []]
}

module.exports = {
  buildBidsSchemas,
  validateSchemaSpec,
  validateSchemasSpec,
  parseSchemaSpec,
  parseSchemasSpec,
}

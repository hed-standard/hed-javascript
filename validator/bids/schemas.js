// const schemaUtils = require('../common/schema')
const { buildSchemas } = require('../schema/init')
const { generateIssue } = require('../../common/issues/issues')
const { SchemaSpec, SchemasSpec } = require('../../common/schema/types')
const semver = require('semver')

function buildBidsSchemas(dataset, schemaDefinition) {
  let schemasSpec
  let issues
  if (schemaDefinition) {
    ;[schemasSpec, issues] = validateSchemasSpec(schemaDefinition)
  } else if (dataset.datasetDescription.jsonData && dataset.datasetDescription.jsonData.HEDVersion) {
    ;[schemasSpec, issues] = getSchemasSpec(dataset.datasetDescription.jsonData.HEDVersion)
  } else {
    ;[schemasSpec, issues] = [null, [generateIssue('invalidSchemaSpecification', { spec: 'no schema available' })]]
  }
  if (issues.length > 0) {
    return Promise.resolve([null, issues])
  } else {
    return buildSchemas(schemasSpec).then(([schemas, issues]) => [schemas, issues])
  }
}

const getSchemaSpec = function (schemaVersion) {
  const nicknameSplit = schemaVersion.split(':', 2)
  let nickname = ''
  let schema
  if (nicknameSplit.length > 1) {
    ;[nickname, schema] = nicknameSplit
    if (nickname === '') {
      // ToDo:  put in regular expression check instead of this one
      return [null, [generateIssue('invalidSchemaNickname', { nickname: nickname, version: schemaVersion })]]
    }
  } else {
    schema = nicknameSplit[0]
  }
  if (schema.indexOf(':') > -1) {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
  }
  const versionSplit = schema.split('_')
  let library = ''
  let version
  if (versionSplit.length > 1) {
    ;[library, version] = versionSplit
  } else {
    version = versionSplit[0]
  }
  if (!semver.valid(version)) {
    return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
  }
  const x = SchemaSpec.createSchemaSpec(nickname, version, library, '')
  return [x, []]
}

function getSchemasSpec(hedVersion) {
  const schemasSpec = new SchemasSpec()
  let processVersion
  if (Array.isArray(hedVersion)) {
    processVersion = hedVersion
  } else {
    processVersion = [hedVersion]
  }
  const issues = []
  for (const schemaVersion of processVersion) {
    const [schemaSpec, verIssues] = getSchemaSpec(schemaVersion)
    if (verIssues.length > 0) {
      issues.concat(verIssues)
    } else if (schemasSpec.isDuplicate(schemaSpec)) {
      issues.push(generateIssue('invalidSchemaNickname', { spec: schemaVersion, nickname: schemaSpec.nickname }))
    } else {
      schemasSpec.addSchemaSpec(schemaSpec)
    }
  }
  return [schemasSpec, issues]
}

function validateSchemaSpec(spec) {
  // ToDO: implement
  if (!(spec instanceof SchemaSpec)) {
    return [null, generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(spec) })]
  }
  return [spec, []]
}

function validateSchemasSpec(specs) {
  // ToDO: implement
  if (!(specs instanceof SchemasSpec)) {
    return [null, generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(specs) })]
  }
  return [specs, []]
}

module.exports = {
  validateSchemaSpec,
  validateSchemasSpec,
  buildBidsSchemas,
  getSchemaSpec,
  getSchemasSpec,
}

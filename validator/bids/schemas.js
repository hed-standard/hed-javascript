const { validateHedDatasetWithContext } = require('../dataset')
const { validateHedString } = require('../event')
const { buildSchema, buildSchemas } = require('../schema/init')
const { sidecarValueHasHed } = require('../../utils/bids')
const { generateIssue } = require('../../common/issues/issues')
const { fallbackFilePath } = require('../../common/schema')
const { SchemaSpec, SchemasSpec } = require('../../common/schema/types')
const { BidsDataset, BidsHedIssue, BidsIssue } = require('./types')
const semver = require('semver')

function buildBidsSchema(dataset, schemaDefinition) {
  let schemaSpec
  let issues
  if (
    (schemaDefinition === undefined || schemaDefinition == null) &&
    dataset.datasetDescription.jsonData &&
    dataset.datasetDescription.jsonData.HEDVersion
  ) {
    // Build our own spec.

    ;[schemaSpec, issues] = buildSchemaSpec(dataset.datasetDescription.jsonData.HEDVersion)
    if (issues) {
      return Promise.resolve([
        ,
        [generateIssue('invalidSchemaSpec', { spec: dataset.datasetDescription.jsonData.HEDVersion })],
      ])
    }
  } else if (schemaDefinition === undefined || schemaDefinition == null) {
    return Promise.resolve([, [generateIssue('invalidSchemaSpec', { spec: 'unknown' })]])
  } else {
    schemaSpec = schemaDefinition // TODO: Write a checker and check here
  }
  return buildSchema(schemaSpec, true).then((schemas) => [schemas, []])
}

// function getSchemaSpecs(hedVersion) {
//   const schemasSpec = new SchemasSpec()
//   let processVersion
//   if (Array.isArray(datasetVersion)) {
//     processVersion = datasetVersion
//   } else {
//     processVersion = [datasetVersion]
//   }
//   for (const schemaVersion of processVersion) {
//     const schemaSpec = schemaSpec(schemaVersion)
//     const nicknameSplit = schemaVersion.split(':', 2)
//     let nickname = ''
//     let schema
//     if (nicknameSplit.length > 1) {
//       ;[nickname, schema] = nicknameSplit
//       if (nickname === '') {
//         return Promise.resolve([
//           ,
//           [generateIssue('invalidSchemaNickname', { nickname: nickname, version: schemaVersion })],
//         ])
//       }
//     } else {
//       schema = nicknameSplit[0]
//       nickname = ''
//     }
//     if (schema.indexOf(':') > -1) {
//       return [, [generateIssue('invalidSchemaSpec', { spec: datasetVersion })]]
//     }
//     const versionSplit = schema.split('_')
//     let library, version
//     if (versionSplit.length > 1) {
//       ;[library, version] = versionSplit
//       schemasSpec.addRemoteLibrarySchema(nickname, library, version)
//     } else {
//       version = versionSplit[0]
//       schemasSpec.addRemoteStandardSchema('', version)
//     }
//   }
//
//   // return Promise.resolve([schemaSpec, []])
// }

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
  if (semver.valid(version) === null) {
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

module.exports = {
  buildBidsSchema,
  getSchemaSpec,
  getSchemasSpec,
}

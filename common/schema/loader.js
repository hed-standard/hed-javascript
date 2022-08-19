/** HED schema loading functions. */

/* Imports */

const xml2js = require('xml2js')
const files = require('../../utils/files')
const { generateIssue } = require('../issues/issues')
const { fallbackFilePath } = require('./config')

/**
 * Load schema XML data from a schema version or path description.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @param {boolean} useFallback Whether to use a bundled fallback schema if the requested schema cannot be loaded.
 * @return {Promise<never>|Promise<[object, Issue[]]>} The schema XML data or an error.
 */
const loadSchema = function (schemaDef = null, useFallback = true) {
  const schemaPromise = loadPromise(schemaDef)
  if (schemaPromise === null) {
    return Promise.reject([generateIssue('invalidSchemaSpec', { spec: JSON.stringify(schemaDef) })])
  }
  return schemaPromise
    .then((xmlData) => [xmlData, []])
    .catch((issues) => {
      if (useFallback) {
        issues.push(generateIssue('requestedSchemaLoadFailedFallbackUsed', { spec: JSON.stringify(schemaDef) }))
        return loadLocalSchema(fallbackFilePath)
          .then((xmlData) => [xmlData, issues])
          .catch((fallbackIssues) => {
            fallbackIssues.push(generateIssue('fallbackSchemaLoadFailed', {}))
            return Promise.reject(issues.concat(fallbackIssues))
          })
      } else {
        issues.push(generateIssue('requestedSchemaLoadFailedNoFallbackUsed', { spec: JSON.stringify(schemaDef) }))
        return Promise.reject(issues)
      }
    })
}

/**
 * Choose the schema Promise from a schema version or path description.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @return {Promise<object>} The schema XML data or an error.
 */
const loadPromise = function (schemaDef) {
  if (schemaDef === null) {
    return loadRemoteStandardSchema('Latest')
  } else if (schemaDef.path) {
    return loadLocalSchema(schemaDef.path)
  } else if (schemaDef.library) {
    return loadRemoteLibrarySchema(schemaDef.library, schemaDef.version)
  } else if (schemaDef.version) {
    return loadRemoteStandardSchema(schemaDef.version)
  } else {
    return null
  }
}

/**
 * Load standard schema XML data from the HED specification GitHub repository.
 *
 * @param {string} version The standard schema version to load.
 * @return {Promise<object>} The schema XML data.
 */
const loadRemoteStandardSchema = function (version = 'Latest') {
  const url = `https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/HED${version}.xml`
  return loadSchemaFile(files.readHTTPSFile(url), 'remoteStandardSchemaLoadFailed', { version: version })
}

/**
 * Load library schema XML data from the HED specification GitHub repository.
 *
 * @param {string} library The library schema to load.
 * @param {string} version The schema version to load.
 * @return {Promise<object>} The library schema XML data.
 */
const loadRemoteLibrarySchema = function (library, version = 'Latest') {
  const url = `https://raw.githubusercontent.com/hed-standard/hed-schema-library/main/library_schemas/${library}/hedxml/HED_${library}_${version}.xml`
  return loadSchemaFile(files.readHTTPSFile(url), 'remoteLibrarySchemaLoadFailed', {
    library: library,
    version: version,
  })
}

/**
 * Load schema XML data from a local file.
 *
 * @param {string} path The path to the schema XML data.
 * @return {Promise<object>} The schema XML data.
 */
const loadLocalSchema = function (path) {
  return loadSchemaFile(files.readFile(path), 'localSchemaLoadFailed', { path: path })
}

/**
 * Actually load the schema XML file.
 *
 * @param {Promise<string>} xmlDataPromise The Promise containing the unparsed XML data.
 * @param {string} issueCode The issue code.
 * @param {Object<string, string>} issueArgs The issue arguments passed from the calling function.
 * @return {Promise<object>} The parsed schema XML data.
 */
const loadSchemaFile = function (xmlDataPromise, issueCode, issueArgs) {
  return xmlDataPromise.then(parseSchemaXML).catch((error) => {
    issueArgs.error = error.message
    return Promise.reject([generateIssue(issueCode, issueArgs)])
  })
}

/**
 * Parse the schema XML data.
 *
 * @param {string} data The XML data.
 * @return {Promise<object>} The schema XML data.
 */
const parseSchemaXML = function (data) {
  return xml2js.parseStringPromise(data, { explicitCharkey: true })
}

module.exports = {
  loadSchema,
}

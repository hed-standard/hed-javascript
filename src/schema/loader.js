/** HED schema loading functions. */

/* Imports */
import xml2js from 'xml2js'

import { fsp, readHTTPSFile, loadBundledFile } from '../utils/files'
import { IssueError } from '../issues/issues'

import { localSchemaNames } from './config' // Changed from localSchemaList

/**
 * Load schema XML data from a schema version or path description.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @returns {Promise<Object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
export default async function loadSchema(schemaDef = null) {
  const xmlData = await loadPromise(schemaDef)
  if (xmlData === null) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: JSON.stringify(schemaDef) })
  }
  return xmlData
}

/**
 * Choose the schema Promise from a schema version or path description.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @returns {Promise<Object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadPromise(schemaDef) {
  if (schemaDef === null) {
    return null
  } else if (schemaDef.localPath) {
    return loadLocalSchema(schemaDef.localPath)
  } else if (localSchemaNames.includes(schemaDef.localName)) {
    // Changed condition
    return loadBundledSchema(schemaDef)
  } else {
    return loadRemoteSchema(schemaDef)
  }
}

/**
 * Load schema XML data from the HED GitHub repository.
 *
 * @param {SchemaSpec} schemaDef The standard schema version to load.
 * @returns {Promise<object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
function loadRemoteSchema(schemaDef) {
  let url
  if (schemaDef.library) {
    url = `https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/library_schemas/${schemaDef.library}/hedxml/HED_${schemaDef.library}_${schemaDef.version}.xml`
  } else {
    url = `https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/standard_schema/hedxml/HED${schemaDef.version}.xml`
  }
  // Import readHTTPSFile separately since it doesn't have environment restrictions
  return loadSchemaFile(readHTTPSFile(url), 'remoteSchemaLoadFailed', { spec: JSON.stringify(schemaDef) })
}

/**
 * Load schema XML data from a local file.
 *
 * @param {string} path The path to the schema XML data.
 * @returns {Promise<object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
function loadLocalSchema(path) {
  // Use fsp.readFile directly to avoid browser environment checks
  return loadSchemaFile(fsp.readFile(path, 'utf8'), 'localSchemaLoadFailed', { path: path })
}

/**
 * Load schema XML data from a bundled file.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @returns {Promise<object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadBundledSchema(schemaDef) {
  try {
    const xmlData = await loadBundledFile(schemaDef.localName)
    return parseSchemaXML(xmlData)
  } catch (error) {
    const issueArgs = { spec: JSON.stringify(schemaDef), error: error.message }
    IssueError.generateAndThrow('bundledSchemaLoadFailed', issueArgs)
  }
}

/**
 * Actually load the schema XML file.
 *
 * @param {Promise<string>} xmlDataPromise The Promise containing the unparsed XML data.
 * @param {string} issueCode The issue code.
 * @param {Object<string, string>} issueArgs The issue arguments passed from the calling function.
 * @returns {Promise<object>} The parsed schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadSchemaFile(xmlDataPromise, issueCode, issueArgs) {
  try {
    const data = await xmlDataPromise
    return parseSchemaXML(data)
  } catch (error) {
    issueArgs.error = error.message
    IssueError.generateAndThrow(issueCode, issueArgs)
  }
}

/**
 * Parse the schema XML data.
 *
 * @param {string} data The XML data.
 * @returns {Promise<object>} The schema XML data.
 */
function parseSchemaXML(data) {
  return xml2js.parseStringPromise(data, { explicitCharkey: true })
}

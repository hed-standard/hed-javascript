/** HED schema loading functions. */

/* Imports */
import xml2js from 'xml2js'

import * as files from '../utils/files'
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
  return loadSchemaFile(files.readHTTPSFile(url), 'remoteSchemaLoadFailed', { spec: JSON.stringify(schemaDef) })
}

/**
 * Load schema XML data from a local file.
 *
 * @param {string} path The path to the schema XML data.
 * @returns {Promise<object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
function loadLocalSchema(path) {
  return loadSchemaFile(files.readFile(path), 'localSchemaLoadFailed', { path: path })
}

/**
 * Load schema XML data from a bundled file.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @returns {Promise<object>} The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadBundledSchema(schemaDef) {
  let xmlString
  const schemaFileName = `${schemaDef.localName}.xml`
  const relativeSchemaPath = `../data/schemas/${schemaFileName}`

  try {
    if (typeof __VITE_ENV__ !== 'undefined' && __VITE_ENV__) {
      // Vite/browser environment: Use import.meta.glob for dynamic, async imports
      // @ts-ignore - import.meta.glob is Vite-specific
      const viteSchemaLoaders = import.meta.glob('../data/schemas/*.xml', { query: '?raw', import: 'default' })
      const loadFn = viteSchemaLoaders[relativeSchemaPath]
      if (loadFn) {
        xmlString = await loadFn()
      } else {
        IssueError.generateAndThrow('bundledSchemaLoadFailed', {
          spec: JSON.stringify(schemaDef),
          error: `Schema file ${schemaFileName} not found by Vite loader. Expected path: ${relativeSchemaPath}`,
        })
      }
    } else {
      // Node.js/Jest environment: Use fs.promises.readFile
      const path = require('path')
      const fsp = require('fs').promises
      // __dirname in loader.js is i:\HEDJavascript\hed-javascript\src\schema
      const absoluteSchemaPath = path.resolve(__dirname, '../data/schemas', schemaFileName)
      xmlString = await fsp.readFile(absoluteSchemaPath, 'utf-8')
    }
    return parseSchemaXML(xmlString)
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

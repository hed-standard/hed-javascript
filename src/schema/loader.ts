/** HED schema loading functions.
 * @module schema/loader
 * */

/* Imports */
import * as files from '../utils/files'
import { IssueError } from '../issues/issues'
import parseSchemaXML from '../utils/xml'

import { localSchemaMap, localSchemaNames } from './config' // Changed from localSchemaList
import { SchemaSpec } from './specs'
import { HedSchemaXMLObject } from './xmlType'

/**
 * Load schema XML data from a schema version or path description.
 *
 * @param schemaDef The description of which schema to use.
 * @returns The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
export default async function loadSchema(schemaDef: SchemaSpec): Promise<HedSchemaXMLObject> {
  const xmlData = await loadPromise(schemaDef)
  if (xmlData === null) {
    IssueError.generateAndThrow('invalidSchemaSpecification', { spec: JSON.stringify(schemaDef) })
  }
  return xmlData
}

/**
 * Choose the schema Promise from a schema version or path description.
 *
 * @param schemaDef The description of which schema to use.
 * @returns The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadPromise(schemaDef: SchemaSpec): Promise<HedSchemaXMLObject> {
  if (schemaDef.localPath) {
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
 * @param schemaDef The standard schema version to load.
 * @returns The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadRemoteSchema(schemaDef: SchemaSpec): Promise<HedSchemaXMLObject> {
  let url: string
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
 * @param path The path to the schema XML data.
 * @returns The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadLocalSchema(path: string): Promise<HedSchemaXMLObject> {
  return loadSchemaFile(files.readFile(path), 'localSchemaLoadFailed', { path: path })
}

/**
 * Load schema XML data from a bundled file.
 *
 * @param schemaDef The description of which schema to use.
 * @returns The schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadBundledSchema(schemaDef: SchemaSpec): Promise<HedSchemaXMLObject> {
  try {
    return parseSchemaXML(localSchemaMap.get(schemaDef.localName))
  } catch (error) {
    const issueArgs = { spec: JSON.stringify(schemaDef), error: error.message }
    IssueError.generateAndThrow('bundledSchemaLoadFailed', issueArgs)
  }
}

/**
 * Actually load the schema XML file.
 *
 * @param xmlDataPromise The Promise containing the unparsed XML data.
 * @param issueCode The issue code.
 * @param issueArgs The issue arguments passed from the calling function.
 * @returns The parsed schema XML data.
 * @throws {IssueError} If the schema could not be loaded.
 */
async function loadSchemaFile(
  xmlDataPromise: Promise<string>,
  issueCode: string,
  issueArgs: Record<string, string>,
): Promise<HedSchemaXMLObject> {
  try {
    const data = await xmlDataPromise
    return parseSchemaXML(data)
  } catch (error) {
    issueArgs.error = error.message
    IssueError.generateAndThrow(issueCode, issueArgs)
  }
}

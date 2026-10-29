/**
 * This module holds the implementation for a non-browser schema loader.
 *
 * The ESM (browser) build replaces this module by {@link module:schema/browserLoader} through the "browser" field of
 * package.json.
 *
 * @module schema/loader
 */

import AbstractHedSchemaLoader from './abstractLoader'
import { getBundledSchema, localSchemaNames } from './config'
import { IssueError } from '../issues/issues'
import * as files from '../utils/files'

export default class HedSchemaLoader extends AbstractHedSchemaLoader {
  /**
   * Load schema XML data from a local file.
   *
   * @param {string} path The path to the schema XML data.
   * @returns {Promise<Object>} The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @protected
   * @override
   */
  async loadLocalSchema(path) {
    return this.loadSchemaFile(files.readFile(path), 'localSchemaLoadFailed', { path })
  }

  /**
   * Determine whether this validator bundles a particular schema.
   *
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {boolean} Whether this validator bundles a particular schema.
   * @protected
   * @override
   */
  hasBundledSchema(schemaDef) {
    return localSchemaNames.includes(schemaDef.localName)
  }

  /**
   * Retrieve the contents of a bundled schema.
   *
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {Promise<string>} The raw schema XML data.
   * @protected
   * @override
   */
  async getBundledSchema(schemaDef) {
    if (!localSchemaNames.includes(schemaDef.localName)) {
      IssueError.generateAndThrowInternalError('Bundled schema could not be found')
    }
    return getBundledSchema(schemaDef.localName)
  }
}

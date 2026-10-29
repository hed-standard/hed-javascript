/**
 * This module holds the implementation for a browser schema loader.
 *
 * It never reads a local file. The ESM (browser) build uses it in place of {@link module:schema/loader} through the
 * "browser" field of package.json, so it cannot import that module.
 *
 * @module schema/browserLoader
 */

import AbstractHedSchemaLoader from './abstractLoader'
import { getBundledSchema, localSchemaNames } from './config'
import { generateIssue, IssueError } from '../issues/issues'

export default class HedSchemaBrowserLoader extends AbstractHedSchemaLoader {
  /**
   * Load schema XML data from a local file (not supported in a browser).
   *
   * @param {string} path The path to the schema XML data.
   * @returns {Promise<Object>} Never resolves; always throws.
   * @throws {IssueError} Always, since local file reading is not supported in a browser.
   * @protected
   * @override
   */
  async loadLocalSchema(path) {
    const readError = new IssueError(
      generateIssue('fileReadError', {
        fileName: path,
        message: 'Local file reading is not supported in browser environment',
      }),
    )
    return this.loadSchemaFile(Promise.reject(readError), 'localSchemaLoadFailed', { path })
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

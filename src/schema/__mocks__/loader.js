import fs from 'node:fs'
import path from 'node:path'

import { jest } from '@jest/globals'

import * as files from '../../utils/files'

const loaderModule = jest.requireActual('../loader')

// The hed-tests test schemas. A schema with a file here is served from it, ahead of a bundled copy of the same
// name (hed-tests json_test_data/test_schemas/README.md).
const testSchemasDir = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'spec_tests',
  'hed-tests',
  'json_test_data',
  'test_schemas',
  'hedxml',
)

export default class MockHedSchemaLoader extends loaderModule.default {
  /**
   * The schema names found in testSchemasDir, read once.
   * @type {Set<string>|null}
   * @private
   */
  static _testSchemaNames = null

  /**
   * Determine whether a schema has a file among the hed-tests test schemas.
   *
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {boolean} Whether testSchemasDir holds a file for this schema.
   * @private
   */
  static _hasTestSchema(schemaDef) {
    MockHedSchemaLoader._testSchemaNames ??= new Set(
      fs.readdirSync(testSchemasDir).map((file) => path.basename(file, '.xml')),
    )
    return MockHedSchemaLoader._testSchemaNames.has(schemaDef.localName)
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
    return MockHedSchemaLoader._hasTestSchema(schemaDef) || super.hasBundledSchema(schemaDef)
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
    if (!MockHedSchemaLoader._hasTestSchema(schemaDef)) {
      return super.getBundledSchema(schemaDef)
    }
    return files.readFile(path.join(testSchemasDir, `${schemaDef.localName}.xml`))
  }
}

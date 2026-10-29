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

/**
 * Compute the path of a schema's file among the hed-tests test schemas.
 *
 * @param {SchemaSpec} schemaDef The description of which schema to use.
 * @returns {string} The path to the schema's XML file, which may not exist.
 */
const testSchemaPath = function (schemaDef) {
  return path.join(testSchemasDir, `${schemaDef.localName}.xml`)
}

export default class MockHedSchemaLoader extends loaderModule.default {
  /**
   * Determine whether this validator bundles a particular schema.
   *
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {boolean} Whether this validator bundles a particular schema.
   * @protected
   * @override
   */
  hasBundledSchema(schemaDef) {
    return fs.existsSync(testSchemaPath(schemaDef)) || super.hasBundledSchema(schemaDef)
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
    const filePath = testSchemaPath(schemaDef)
    if (fs.existsSync(filePath)) {
      return files.readFile(filePath)
    } else {
      return super.getBundledSchema(schemaDef)
    }
  }
}

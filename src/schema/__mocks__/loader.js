import path from 'node:path'
import { jest } from '@jest/globals'
import * as files from '../../utils/files'
const loaderModule = jest.requireActual('../loader')
const bundledStandard = new Set(['HED8.4.0', 'HED8.5.0'])
const specTestLibraries = new Set(['testaux', 'testclash', 'testconflict', 'testminimal'])
export default class MockHedSchemaLoader extends loaderModule.default {
  /**
   * Determine whether this validator bundles a particular schema.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns Whether this validator bundles a particular schema.
   */
  hasBundledSchema(schemaDef) {
    return (
      specTestLibraries.has(schemaDef.library) ||
      bundledStandard.has(schemaDef.localName) ||
      super.hasBundledSchema(schemaDef)
    )
  }
  /**
   * Retrieve the contents of a bundled schema.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The raw schema XML data.
   */
  async getBundledSchema(schemaDef) {
    if (specTestLibraries.has(schemaDef.library) || bundledStandard.has(schemaDef.localName)) {
      return files.readFile(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'spec_tests',
          'hed-tests',
          'json_test_data',
          'test_schemas',
          'hedxml',
          `${schemaDef.localName}.xml`,
        ),
      )
    } else {
      return super.getBundledSchema(schemaDef)
    }
  }
}

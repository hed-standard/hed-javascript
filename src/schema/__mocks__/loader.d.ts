import type { SchemaSpec } from '../specs'
declare const loaderModule: typeof import('../loader')
export default class MockHedSchemaLoader extends loaderModule.default {
  /**
   * Determine whether this validator bundles a particular schema.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns Whether this validator bundles a particular schema.
   */
  protected hasBundledSchema(schemaDef: SchemaSpec): boolean
  /**
   * Retrieve the contents of a bundled schema.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The raw schema XML data.
   */
  protected getBundledSchema(schemaDef: SchemaSpec): Promise<string>
}
export {}

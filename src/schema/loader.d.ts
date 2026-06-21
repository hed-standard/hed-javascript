/**
 * This module holds the implementation for a non-browser schema loader.
 * @module schema/loader
 */
import AbstractHedSchemaLoader from './abstractLoader'
import type { SchemaSpec } from './specs'
import type { HedSchemaXMLObject } from './xmlType'
export default class HedSchemaLoader extends AbstractHedSchemaLoader {
  /**
   * Load schema XML data from a local file.
   *
   * @param path - The path to the schema XML data.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  protected loadLocalSchema(path: string): Promise<HedSchemaXMLObject>
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

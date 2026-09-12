/**
 * This module holds the schema container classes.
 * @module schema/containers
 */
import type SchemaEntries from './entries/schemaEntries'
import { type HedSchemaXMLObject } from './xmlType'
export declare class Schema {
  /**
   * The collection of schema entries.
   */
  readonly entries: SchemaEntries
  /**
   * This schema's prefix in the active schema set.
   */
  readonly prefix: string
  /**
   * Constructor.
   *
   * @param xmlData - The schema XML data.
   * @param entries - A collection of schema entries.
   * @param prefix - This schema's prefix in the active schema set.
   */
  constructor(xmlData: HedSchemaXMLObject, entries: SchemaEntries, prefix: string)

  /**
   * This was formerly the schema version.
   * Now that a single schema may contain multiple XMLs merged together, this field is useless.
   *
   * @deprecated Will be removed in version 5.0.1.
   *
   * @returns An empty string.
   */
  get version(): string

  /**
   * This was formerly the schema's library.
   * Now that a single schema may contain multiple XMLs merged together, this field is useless.
   *
   * @deprecated Will be removed in version 5.0.1.
   *
   * @returns An empty string.
   */
  get library(): string

  /**
   * This was formerly the schema's partnered standard schema version.
   * Now that a single schema may contain multiple XMLs merged together, this field is useless.
   *
   * @deprecated Will be removed in version 5.0.1.
   *
   * @returns An empty string.
   */
  get withStandard(): string
}
/**
 * The collection of active HED schemas.
 */
export declare class Schemas {
  /**
   * The imported HED schemas.
   *
   * @remarks
   * The empty string key ("") corresponds to the schema with no prefix,
   * while other keys correspond to the respective prefixes.
   */
  readonly schemas: Map<string, Schema>
  /**
   * Constructor.
   *
   * @param schemas - The imported HED schemas.
   */
  constructor(schemas: Map<string, Schema> | Schema)
  /**
   * Return the schema with the given prefix.
   *
   * @param schemaName - A prefix in the schema set.
   * @returns The schema object corresponding to that prefix.
   */
  getSchema(schemaName: string): Schema | undefined
  /**
   * The base schema, i.e. the schema with no prefix, if one is defined.
   */
  get baseSchema(): Schema | undefined
}

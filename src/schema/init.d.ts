/**
 * This module holds the classes for initializing and building schemas.
 * @module schema/init
 */
import type { Schemas } from './containers'
import type { SchemasSpec } from './specs'
/**
 * Build a schema collection object from a schema specification.
 *
 * @deprecated In version 5.0.1. Use {@link HedSchemaLoader.buildSchemas}.
 *
 * @param schemaSpecs - The description of which schemas to use.
 * @returns The schema container object and any issues found.
 */
export declare function buildSchemas(schemaSpecs: SchemasSpec): Promise<Schemas>
/**
 * Build HED schemas from a version specification string.
 *
 * @deprecated In version 5.0.1. Use {@link HedSchemaLoader.buildSchemasFromVersion}.
 *
 * @param hedVersionString - The HED version specification string (can contain comma-separated versions).
 * @returns A Promise that resolves to the built schemas.
 * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
 */
export declare function buildSchemasFromVersion(hedVersionString?: string): Promise<Schemas>

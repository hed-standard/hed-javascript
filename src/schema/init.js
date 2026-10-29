/**
 * This module holds the classes for initializing and building schemas.
 * @module schema/init
 */

import HedSchemaLoader from './loader'

/**
 * Build a schema collection object from a schema specification.
 *
 * @param {SchemasSpec} schemaSpecs The description of which schemas to use.
 * @returns {Promise<HedSchemas>} The schema container object and any issues found.
 */
export async function buildSchemas(schemaSpecs) {
  return new HedSchemaLoader().buildSchemas(schemaSpecs)
}

/**
 * Build HED schemas from a version specification string.
 *
 * @param {string} [hedVersionString] The HED version specification string (can contain comma-separated versions).
 * @returns {Promise<HedSchemas>} A Promise that resolves to the built schemas.
 * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
 */
export async function buildSchemasFromVersion(hedVersionString) {
  return new HedSchemaLoader().buildSchemasFromVersion(hedVersionString)
}

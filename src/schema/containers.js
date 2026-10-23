/**
 * This module holds the schema container classes.
 * @module schema/containers
 */

import lt from 'semver/functions/lt'

import { IssueError } from '../issues/issues'

/**
 * An imported HED schema (a merge group under one prefix).
 */
export class HedSchema {
  /**
   * The collection of schema entries.
   * @type {SchemaEntries}
   */
  entries

  /**
   * This schema's prefix in the active schema set.
   * @type {string}
   */
  prefix

  /**
   * The HED schema version.
   * @type {string}
   */
  version

  /**
   * The HED library schema name.
   * @type {string}
   */
  library

  /**
   * The standard HED schema version this schema is linked to.
   * @type {string}
   */
  withStandard

  /**
   * Constructor.
   *
   * @param {Object} xmlData The schema XML data (of the schema that names the merge group).
   * @param {SchemaEntries} entries A collection of schema entries.
   * @param {string} [prefix] This schema's prefix in the active schema set.
   */
  constructor(xmlData, entries, prefix = '') {
    this.entries = entries
    this.prefix = prefix

    const rootElement = xmlData.HED
    this.version = rootElement?.$?.version
    this.library = rootElement?.$?.library ?? ''

    if (!this.library && this.version && lt(this.version, '8.0.0')) {
      IssueError.generateAndThrow('deprecatedStandardSchemaVersion', {
        version: this.version,
      })
    }

    if (!this.library) {
      this.withStandard = this.version
    } else {
      this.withStandard = rootElement?.$?.withStandard
    }
  }
}

/**
 * The collection of active HED schemas.
 */
export class HedSchemas {
  /**
   * The imported HED schemas.
   *
   * The empty string key ("") corresponds to the schema with no prefix,
   * while other keys correspond to the respective prefixes.
   *
   * @type {Map<string, HedSchema>}
   */
  schemas

  /**
   * Constructor.
   *
   * @param {Map<string, HedSchema>|HedSchema} schemas The imported HED schemas.
   * @throws {IssueError} If the argument is neither a map nor a schema.
   */
  constructor(schemas) {
    if (schemas instanceof Map) {
      this.schemas = schemas
    } else if (schemas instanceof HedSchema) {
      this.schemas = new Map([['', schemas]])
    } else {
      IssueError.generateAndThrowInternalError('Invalid type passed to HedSchemas constructor')
    }
  }

  /**
   * Return the schema with the given prefix.
   *
   * @param {string} schemaName A prefix in the schema set.
   * @returns {HedSchema|undefined} The schema object corresponding to that prefix.
   */
  getSchema(schemaName) {
    return this.schemas?.get(schemaName)
  }

  /**
   * The base schema, i.e. the schema with no prefix, if one is defined.
   *
   * @returns {HedSchema|undefined}
   */
  get baseSchema() {
    return this.getSchema('')
  }
}

/**
 * The former name of {@link HedSchema}.
 * @deprecated Use HedSchema. Kept through 4.x.
 */
export const Schema = HedSchema

/**
 * The former name of {@link HedSchemas}.
 * @deprecated Use HedSchemas. Kept through 4.x.
 */
export const Schemas = HedSchemas

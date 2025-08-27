/** This module holds the schema container classes.
 * @module schema/containers
 */
import lt from 'semver/functions/lt'

import { IssueError } from '../issues/issues'

/**
 * An imported HED 3 schema.
 */
export class Schema {
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
   * This schema's prefix in the active schema set.
   * @type {string}
   */
  prefix

  /**
   * The collection of schema entries.
   * @type {SchemaEntries}
   */
  entries

  /**
   * The standard HED schema version this schema is linked to.
   * @type {string}
   */
  withStandard

  /**
   * Constructor.
   *
   * @param {Object} xmlData The schema XML data.
   * @param {SchemaEntries} entries A collection of schema entries.
   */
  constructor(xmlData, entries) {
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
      this.withStandard = xmlData.HED?.$?.withStandard
    }
    this.entries = entries
  }
}

/**
 * An imported lazy partnered HED 3 schema.
 */
export class PartneredSchema extends Schema {
  /**
   * The actual HED 3 schemas underlying this partnered schema.
   * @type {Schema[]}
   */
  actualSchemas

  /**
   * Constructor.
   *
   * @param {Schema[]} actualSchemas The actual HED 3 schemas underlying this partnered schema.
   */
  constructor(actualSchemas) {
    if (actualSchemas.length === 0) {
      IssueError.generateAndThrowInternalError('A partnered schema set must contain at least one schema.')
    }
    super({}, actualSchemas[0].entries)
    this.actualSchemas = actualSchemas
    this.withStandard = actualSchemas[0].withStandard
    this.library = undefined
  }
}

/**
 * The collection of active HED schemas.
 */
export class Schemas {
  /**
   * The imported HED schemas.
   *
   * The empty string key ("") corresponds to the schema with no prefix,
   * while other keys correspond to the respective prefixes.
   *
   * @type {Map<string, Schema>}
   */
  schemas

  /**
   * Constructor.
   * @param {Schema|Map<string, Schema>} schemas The imported HED schemas.
   */
  constructor(schemas) {
    if (schemas instanceof Map) {
      this.schemas = schemas
    } else if (schemas instanceof Schema) {
      this.schemas = new Map([['', schemas]])
    } else {
      IssueError.generateAndThrowInternalError('Invalid type passed to Schemas constructor')
    }
    if (this.schemas) {
      this._addPrefixesToSchemas()
    }
  }

  _addPrefixesToSchemas() {
    for (const [prefix, schema] of this.schemas) {
      schema.prefix = prefix
    }
  }

  /**
   * Return the schema with the given prefix.
   *
   * @param {string} schemaName A prefix in the schema set.
   * @returns {Schema} The schema object corresponding to that prefix.
   */
  getSchema(schemaName) {
    return this.schemas?.get(schemaName)
  }

  /**
   * The base schema, i.e. the schema with no prefix, if one is defined.
   *
   * @returns {Schema}
   */
  get baseSchema() {
    return this.getSchema('')
  }
}

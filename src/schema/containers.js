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

  /**
   * Determine if a HED tag has a particular attribute in this schema.
   *
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @returns {boolean} Whether this tag has this attribute.
   */
  tagHasAttribute(tag, tagAttribute) {
    return this.entries.tagHasAttribute(tag, tagAttribute)
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
   * The empty string key ("") corresponds to the schema with no nickname,
   * while other keys correspond to the respective nicknames.
   *
   * This field is null for syntax-only validation.
   *
   * @type {Map<string, Schema>|null}
   */
  schemas

  /**
   * Constructor.
   * @param {Schema|Map<string, Schema>|null} schemas The imported HED schemas.
   */
  constructor(schemas) {
    if (schemas === null || schemas instanceof Map) {
      this.schemas = schemas
    } else if (schemas instanceof Schema) {
      this.schemas = new Map([['', schemas]])
    } else {
      IssueError.generateAndThrowInternalError('Invalid type passed to Schemas constructor')
    }
    if (this.schemas) {
      this._addNicknamesToSchemas()
    }
  }

  _addNicknamesToSchemas() {
    for (const [nickname, schema] of this.schemas) {
      schema.prefix = nickname
    }
  }

  /**
   * Return the schema with the given nickname.
   *
   * @param {string} schemaName A nickname in the schema set.
   * @returns {Schema} The schema object corresponding to that nickname.
   */
  getSchema(schemaName) {
    return this.schemas?.get(schemaName)
  }

  /**
   * The base schema, i.e. the schema with no nickname, if one is defined.
   *
   * @returns {Schema}
   */
  get baseSchema() {
    return this.getSchema('')
  }

  /**
   * The standard schema, i.e. primary schema implementing the HED standard, if one is defined.
   *
   * @returns {Schema}
   */
  get standardSchema() {
    if (this.schemas === null) {
      return undefined
    }
    for (const schema of this.schemas.values()) {
      if (schema.library === '') {
        return schema
      }
    }
    return undefined
  }

  /**
   * The library schemas, i.e. the schema with nicknames, if any are defined.
   *
   * @returns {Map<string, Schema>|null}
   */
  get librarySchemas() {
    if (this.schemas !== null) {
      const schemasCopy = new Map(this.schemas)
      schemasCopy.delete('')
      return schemasCopy
    } else {
      return null
    }
  }
}

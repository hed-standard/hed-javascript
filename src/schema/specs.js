/**
 * A schema version specification.
 */
export class SchemaSpec {
  /**
   * The prefix of this schema.
   * @type {string}
   */
  prefix

  /**
   * The version of this schema.
   * @type {string}
   */
  version

  /**
   * The library name of this schema.
   * @type {string}
   */
  library

  /**
   * The local path for this schema.
   * @type {string}
   */
  localPath

  /**
   * Constructor.
   *
   * @param {string} prefix The prefix of this schema.
   * @param {string} version The version of this schema.
   * @param {string?} library The library name of this schema.
   * @param {string?} localPath The local path for this schema.
   */
  constructor(prefix, version, library = '', localPath = '') {
    this.prefix = prefix
    this.version = version
    this.library = library
    this.localPath = localPath
  }

  /**
   * Compute the name for the bundled copy of this schema.
   *
   * @returns {string}
   */
  get localName() {
    if (!this.library) {
      return 'HED' + this.version
    } else {
      return 'HED_' + this.library + '_' + this.version
    }
  }
}

/**
 * A specification mapping schema prefixes to SchemaSpec objects.
 */
export class SchemasSpec {
  /**
   * The specification mapping data.
   * @type {Map<string, SchemaSpec[]>}
   */
  data

  /**
   * Constructor.
   */
  constructor() {
    this.data = new Map()
  }

  /**
   * Iterator over the specifications.
   *
   * @yields {Iterator} - [string, SchemaSpec[]]
   */
  *[Symbol.iterator]() {
    for (const [prefix, schemaSpecs] of this.data.entries()) {
      yield [prefix, schemaSpecs]
    }
  }

  /**
   * Add a schema to this specification.
   *
   * @param {SchemaSpec} schemaSpec A schema specification.
   * @returns {SchemasSpec| map} This object.
   */
  addSchemaSpec(schemaSpec) {
    if (this.data.has(schemaSpec.prefix)) {
      this.data.get(schemaSpec.prefix).push(schemaSpec)
    } else {
      this.data.set(schemaSpec.prefix, [schemaSpec])
    }
    return this
  }
}

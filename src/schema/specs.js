/**
 * A schema version specification.
 */
export class SchemaSpec {
  /**
   * The nickname of this schema.
   * @type {string}
   */
  nickname

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
   * @param {string} nickname The nickname of this schema.
   * @param {string} version The version of this schema.
   * @param {string?} library The library name of this schema.
   * @param {string?} localPath The local path for this schema.
   */
  constructor(nickname, version, library = '', localPath = '') {
    this.nickname = nickname
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
 * A specification mapping schema nicknames to SchemaSpec objects.
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
    for (const [key, value] of this.data.entries()) {
      yield [key, value]
    }
  }

  /**
   * Add a schema to this specification.
   *
   * @param {SchemaSpec} schemaSpec A schema specification.
   * @returns {SchemasSpec| map} This object.
   */
  addSchemaSpec(schemaSpec) {
    if (this.data.has(schemaSpec.nickname)) {
      this.data.get(schemaSpec.nickname).push(schemaSpec)
    } else {
      this.data.set(schemaSpec.nickname, [schemaSpec])
    }
    return this
  }
}

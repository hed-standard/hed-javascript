import castArray from 'lodash/castArray'
import semver from 'semver'

import { IssueError } from '../issues/issues'

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

  /**
   * Parse a single schema specification string into a SchemaSpec object.
   *
   * @param {string} versionSpec A schema version specification string (e.g., "nickname:library_version").
   * @returns {SchemaSpec} A schema specification object with parsed nickname, library, and version.
   * @throws {IssueError} If the schema specification format is invalid.
   * @public
   */
  static parseVersionSpec(versionSpec) {
    const [nickname, schema] = SchemaSpec._splitPrefixAndSchema(versionSpec)
    const [library, version] = SchemaSpec._splitLibraryAndVersion(schema, versionSpec)
    return new SchemaSpec(nickname, version, library)
  }

  /**
   * Split a schema version string into prefix (nickname) and schema parts using colon delimiter.
   *
   * @param {string} prefixSchemaSpec The schema version string to split.
   * @returns {string[]} An array with [nickname, schema] where nickname may be empty string.
   * @throws {IssueError} If the schema specification format is invalid.
   * @private
   */
  static _splitPrefixAndSchema(prefixSchemaSpec) {
    return SchemaSpec._splitVersionSegments(prefixSchemaSpec, prefixSchemaSpec, ':')
  }

  /**
   * Split a schema string into library and version parts using underscore delimiter.
   *
   * @param {string} libraryVersionSpec The schema string to split (library_version format).
   * @param {string} originalVersion The original version string for error reporting.
   * @returns {string[]} An array with [library, version] where library may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or version is not valid semver.
   * @private
   */
  static _splitLibraryAndVersion(libraryVersionSpec, originalVersion) {
    const [library, version] = SchemaSpec._splitVersionSegments(libraryVersionSpec, originalVersion, '_')
    if (!semver.valid(version)) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
    }
    return [library, version]
  }

  /**
   * Split a version string into two segments using the specified delimiter.
   *
   * @param {string} versionSpec The version string to split.
   * @param {string} originalVersion The original version string for error reporting.
   * @param {string} splitCharacter The character to use as delimiter (':' or '_').
   * @returns {string[]} An array with [firstSegment, secondSegment] where firstSegment may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or contains non-alphabetic characters in first segment.
   * @private
   */
  static _splitVersionSegments(versionSpec, originalVersion, splitCharacter) {
    const alphabeticRegExp = new RegExp('^[a-zA-Z]+$')
    const versionSplit = versionSpec.split(splitCharacter)
    const secondSegment = versionSplit.pop()
    const firstSegment = versionSplit.pop()
    if (versionSplit.length > 0) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
    }
    if (firstSegment !== undefined && !alphabeticRegExp.test(firstSegment)) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
    }
    return [firstSegment ?? '', secondSegment]
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

  /**
   * Parse a HED version specification into a schemas specification object.
   *
   * @param {string|string[]} versionSpecs The HED version specification, can be a single version string or array of version strings.
   * @returns {SchemasSpec} A schemas specification object containing parsed schema specifications.
   * @throws {IssueError} If any schema specification is invalid.
   * @public
   */
  static parseVersionSpecs(versionSpecs) {
    const schemasSpec = new SchemasSpec()
    const processVersion = castArray(versionSpecs)
    if (processVersion.length === 0) {
      IssueError.generateAndThrow('missingSchemaSpecification')
    }
    for (const schemaVersion of processVersion) {
      const schemaSpec = SchemaSpec.parseVersionSpec(schemaVersion)
      schemasSpec.addSchemaSpec(schemaSpec)
    }
    return schemasSpec
  }
}

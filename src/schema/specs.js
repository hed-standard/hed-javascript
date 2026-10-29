/**
 * This module holds the specification classes for HED schemas.
 * @module schema/specs
 */

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
   * @param {string} [library] The library name of this schema.
   * @param {string} [localPath] The local path for this schema.
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
   * Compute the canonical form of this specification.
   *
   * @returns {string} "library_version", or the version alone for a standard schema.
   */
  toString() {
    if (!this.library) {
      return this.version
    } else {
      return this.library + '_' + this.version
    }
  }

  /**
   * Determine if this schema specification is equivalent to another schema specification.
   *
   * Schema specifications are equivalent if either of the following is true:
   * - They have the same `localPath`
   * - They have the same `prefix`, `version`, and `library`.
   *
   * @param {*} other A schema specification to compare with this one.
   * @returns {boolean} Whether the other schema specification is equivalent to this one.
   */
  equivalent(other) {
    if (!(other instanceof SchemaSpec)) {
      return false
    }
    if (this.localPath && this.localPath === other.localPath) {
      return true
    }
    return this.prefix === other.prefix && this.version === other.version && this.library === other.library
  }

  /**
   * Parse a single schema specification string into a SchemaSpec object.
   *
   * @param {string} versionSpec A schema version specification string (e.g., "nickname:library_version").
   * @returns {SchemaSpec} A schema specification object with parsed nickname, library, and version.
   * @throws {IssueError} If the schema specification format is invalid.
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
   * @throws {IssueError} If the schema specification format is invalid or contains non-alphabetic characters in
   *     first segment.
   * @private
   */
  static _splitVersionSegments(versionSpec, originalVersion, splitCharacter) {
    const alphabeticRegExp = /^[a-zA-Z]+$/
    const versionSplit = versionSpec.split(splitCharacter)
    const secondSegment = versionSplit.pop()
    const firstSegment = versionSplit.pop()
    if (versionSplit.length > 0) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
    }
    if (secondSegment === undefined) {
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
  #data

  /**
   * Constructor.
   */
  constructor() {
    this.#data = new Map()
  }

  /**
   * The specification mapping data.
   *
   * @returns {Map<string, SchemaSpec[]>} A copy of the map from prefixes to the specifications listed under them.
   */
  get data() {
    return new Map(this.#data)
  }

  /**
   * Iterate over the schema specifications.
   *
   * @yields {[string, SchemaSpec[]]} Each prefix and its specifications.
   */
  *[Symbol.iterator]() {
    yield* this.#data.entries()
  }

  /**
   * Add a schema to this specification.
   *
   * A schema name (a library name, or the standard schema) may appear only once in a merge group, whatever the
   * versions (specification 3.1.2.4).
   *
   * @param {SchemaSpec} schemaSpec A schema specification.
   * @returns {SchemasSpec} This object.
   * @throws {IssueError} If the schema's name is already listed under its prefix.
   */
  addSchemaSpec(schemaSpec) {
    if (this.#data.has(schemaSpec.prefix)) {
      const existingPrefixSpecs = this.#data.get(schemaSpec.prefix)
      if (existingPrefixSpecs.some((spec) => schemaSpec.library === spec.library)) {
        const schema = schemaSpec.library ? `library "${schemaSpec.library}"` : 'the standard schema'
        IssueError.generateAndThrow('multipleVersionsOfSameLibrarySchema', { schema, prefix: schemaSpec.prefix })
      }
      existingPrefixSpecs.push(schemaSpec)
    } else {
      this.#data.set(schemaSpec.prefix, [schemaSpec])
    }
    return this
  }

  /**
   * Parse a HED version specification into a schemas specification object.
   *
   * @param {string|string[]} versionSpecs The HED version specification, can be a single version string or array of
   *     version strings.
   * @returns {SchemasSpec} A schemas specification object containing parsed schema specifications.
   * @throws {IssueError} If any schema specification is invalid.
   */
  static parseVersionSpecs(versionSpecs) {
    const schemasSpec = new SchemasSpec()
    let processedVersionSpecs
    if (typeof versionSpecs === 'string') {
      processedVersionSpecs = castArray(versionSpecs)
    } else if (!Array.isArray(versionSpecs) || !versionSpecs.every((spec) => typeof spec === 'string')) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: versionSpecs })
    } else {
      processedVersionSpecs = versionSpecs
    }
    if (processedVersionSpecs.length === 0) {
      IssueError.generateAndThrow('missingSchemaSpecification')
    }
    for (const schemaVersion of processedVersionSpecs) {
      const schemaSpec = SchemaSpec.parseVersionSpec(schemaVersion)
      schemasSpec.addSchemaSpec(schemaSpec)
    }
    return schemasSpec
  }
}

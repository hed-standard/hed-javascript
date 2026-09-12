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
   */
  prefix
  /**
   * The version of this schema.
   */
  version
  /**
   * The library name of this schema.
   */
  library
  /**
   * The local path for this schema.
   */
  localPath
  /**
   * Constructor.
   *
   * @param prefix - The prefix of this schema.
   * @param version - The version of this schema.
   * @param library - The library name of this schema.
   * @param localPath - The local path for this schema.
   */
  constructor(prefix, version, library = '', localPath = '') {
    this.prefix = prefix
    this.version = version
    this.library = library
    this.localPath = localPath
  }
  /**
   * Compute the name for the bundled copy of this schema.
   */
  get localName() {
    if (!this.library) {
      return 'HED' + this.version
    } else {
      return 'HED_' + this.library + '_' + this.version
    }
  }
  /**
   * Determine if this schema specification is equivalent to another schema specification.
   *
   * @remarks
   *
   * Schema specifications are deemed equivalent if either of the following is true:
   * - They have the same `localPath`
   * - They have the same `prefix`, `version`, and `library`.
   *
   * @param other - A schema specification to compare with this one.
   * @returns Whether the other schema specification is equivalent to this one.
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
   * @param versionSpec - A schema version specification string (e.g., "nickname:library_version").
   * @returns A schema specification object with parsed nickname, library, and version.
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
   * @param prefixSchemaSpec - The schema version string to split.
   * @returns An array with [nickname, schema] where nickname may be empty string.
   * @throws {IssueError} If the schema specification format is invalid.
   */
  static _splitPrefixAndSchema(prefixSchemaSpec) {
    return SchemaSpec._splitVersionSegments(prefixSchemaSpec, prefixSchemaSpec, ':')
  }
  /**
   * Split a schema string into library and version parts using underscore delimiter.
   *
   * @param libraryVersionSpec - The schema string to split (library_version format).
   * @param originalVersion - The original version string for error reporting.
   * @returns An array with [library, version] where library may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or version is not valid semver.
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
   * @param versionSpec - The version string to split.
   * @param originalVersion - The original version string for error reporting.
   * @param splitCharacter - The character to use as delimiter (':' or '_').
   * @returns An array with [firstSegment, secondSegment] where firstSegment may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or contains non-alphabetic characters in first segment.
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
   */
  get data() {
    return new Map(this.#data)
  }
  /**
   * Iterate over the schema specifications.
   */
  *[Symbol.iterator]() {
    yield* this.#data.entries()
  }
  /**
   * Add a schema to this specification.
   *
   * @param schemaSpec - A schema specification.
   * @returns This object.
   */
  addSchemaSpec(schemaSpec) {
    if (this.#data.has(schemaSpec.prefix)) {
      const existingPrefixSpecs = this.#data.get(schemaSpec.prefix)
      if (!existingPrefixSpecs.some((spec) => schemaSpec.equivalent(spec))) {
        this.#data.get(schemaSpec.prefix)?.push(schemaSpec)
      }
    } else {
      this.#data.set(schemaSpec.prefix, [schemaSpec])
    }
    return this
  }
  /**
   * Parse a HED version specification into a schemas specification object.
   *
   * @param versionSpecs - The HED version specification, can be a single version string or array of version strings.
   * @returns A schemas specification object containing parsed schema specifications.
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

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
  readonly prefix: string

  /**
   * The version of this schema.
   */
  readonly version: string

  /**
   * The library name of this schema.
   */
  readonly library: string

  /**
   * The local path for this schema.
   */
  readonly localPath: string

  /**
   * Constructor.
   *
   * @param prefix The prefix of this schema.
   * @param version The version of this schema.
   * @param library The library name of this schema.
   * @param localPath The local path for this schema.
   */
  constructor(prefix: string, version: string, library = '', localPath = '') {
    this.prefix = prefix
    this.version = version
    this.library = library
    this.localPath = localPath
  }

  /**
   * Compute the name for the bundled copy of this schema.
   */
  public get localName(): string {
    if (!this.library) {
      return 'HED' + this.version
    } else {
      return 'HED_' + this.library + '_' + this.version
    }
  }

  /**
   * Parse a single schema specification string into a SchemaSpec object.
   *
   * @param versionSpec A schema version specification string (e.g., "nickname:library_version").
   * @returns A schema specification object with parsed nickname, library, and version.
   * @throws {IssueError} If the schema specification format is invalid.
   */
  public static parseVersionSpec(versionSpec: string): SchemaSpec {
    const [nickname, schema] = SchemaSpec._splitPrefixAndSchema(versionSpec)
    const [library, version] = SchemaSpec._splitLibraryAndVersion(schema, versionSpec)
    return new SchemaSpec(nickname, version, library)
  }

  /**
   * Split a schema version string into prefix (nickname) and schema parts using colon delimiter.
   *
   * @param prefixSchemaSpec The schema version string to split.
   * @returns An array with [nickname, schema] where nickname may be empty string.
   * @throws {IssueError} If the schema specification format is invalid.
   */
  private static _splitPrefixAndSchema(prefixSchemaSpec: string): [string, string] {
    return SchemaSpec._splitVersionSegments(prefixSchemaSpec, prefixSchemaSpec, ':')
  }

  /**
   * Split a schema string into library and version parts using underscore delimiter.
   *
   * @param libraryVersionSpec The schema string to split (library_version format).
   * @param originalVersion The original version string for error reporting.
   * @returns An array with [library, version] where library may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or version is not valid semver.
   */
  private static _splitLibraryAndVersion(libraryVersionSpec: string, originalVersion: string): [string, string] {
    const [library, version] = SchemaSpec._splitVersionSegments(libraryVersionSpec, originalVersion, '_')
    if (!semver.valid(version)) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: originalVersion })
    }
    return [library, version]
  }

  /**
   * Split a version string into two segments using the specified delimiter.
   *
   * @param versionSpec The version string to split.
   * @param originalVersion The original version string for error reporting.
   * @param splitCharacter The character to use as delimiter (':' or '_').
   * @returns An array with [firstSegment, secondSegment] where firstSegment may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or contains non-alphabetic characters in first segment.
   */
  private static _splitVersionSegments(
    versionSpec: string,
    originalVersion: string,
    splitCharacter: string,
  ): [string, string] {
    const alphabeticRegExp = /^[a-zA-Z]+$/
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
   */
  #data: Map<string, SchemaSpec[]>

  /**
   * Constructor.
   */
  constructor() {
    this.#data = new Map<string, SchemaSpec[]>()
  }

  /**
   * The specification mapping data.
   */
  public get data(): Map<string, SchemaSpec[]> {
    return new Map(this.#data)
  }

  /**
   * Iterate over the schema specifications.
   */
  *[Symbol.iterator](): MapIterator<[string, SchemaSpec[]]> {
    yield* this.#data.entries()
  }

  /**
   * Add a schema to this specification.
   *
   * @param schemaSpec A schema specification.
   * @returns This object.
   */
  public addSchemaSpec(schemaSpec: SchemaSpec): this {
    if (this.#data.has(schemaSpec.prefix)) {
      this.#data.get(schemaSpec.prefix).push(schemaSpec)
    } else {
      this.#data.set(schemaSpec.prefix, [schemaSpec])
    }
    return this
  }

  /**
   * Parse a HED version specification into a schemas specification object.
   *
   * @param versionSpecs The HED version specification, can be a single version string or array of version strings.
   * @returns A schemas specification object containing parsed schema specifications.
   * @throws {IssueError} If any schema specification is invalid.
   */
  public static parseVersionSpecs(versionSpecs: string | string[]): SchemasSpec {
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

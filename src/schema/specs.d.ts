/**
 * This module holds the specification classes for HED schemas.
 * @module schema/specs
 */
/**
 * A schema version specification.
 */
export declare class SchemaSpec {
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
   * @param prefix - The prefix of this schema.
   * @param version - The version of this schema.
   * @param library - The library name of this schema.
   * @param localPath - The local path for this schema.
   */
  constructor(prefix: string, version: string, library?: string, localPath?: string)
  /**
   * Compute the name for the bundled copy of this schema.
   */
  get localName(): string
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
  equivalent(other: unknown): boolean
  /**
   * Parse a single schema specification string into a SchemaSpec object.
   *
   * @param versionSpec - A schema version specification string (e.g., "nickname:library_version").
   * @returns A schema specification object with parsed nickname, library, and version.
   * @throws {IssueError} If the schema specification format is invalid.
   */
  static parseVersionSpec(versionSpec: string): SchemaSpec
  /**
   * Split a schema version string into prefix (nickname) and schema parts using colon delimiter.
   *
   * @param prefixSchemaSpec - The schema version string to split.
   * @returns An array with [nickname, schema] where nickname may be empty string.
   * @throws {IssueError} If the schema specification format is invalid.
   */
  private static _splitPrefixAndSchema
  /**
   * Split a schema string into library and version parts using underscore delimiter.
   *
   * @param libraryVersionSpec - The schema string to split (library_version format).
   * @param originalVersion - The original version string for error reporting.
   * @returns An array with [library, version] where library may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or version is not valid semver.
   */
  private static _splitLibraryAndVersion
  /**
   * Split a version string into two segments using the specified delimiter.
   *
   * @param versionSpec - The version string to split.
   * @param originalVersion - The original version string for error reporting.
   * @param splitCharacter - The character to use as delimiter (':' or '_').
   * @returns An array with [firstSegment, secondSegment] where firstSegment may be empty string.
   * @throws {IssueError} If the schema specification format is invalid or contains non-alphabetic characters in first segment.
   */
  private static _splitVersionSegments
}
/**
 * A specification mapping schema prefixes to SchemaSpec objects.
 */
export declare class SchemasSpec {
  #private
  /**
   * Constructor.
   */
  constructor()
  /**
   * The specification mapping data.
   */
  get data(): Map<string, SchemaSpec[]>
  /**
   * Iterate over the schema specifications.
   */
  [Symbol.iterator](): MapIterator<[string, SchemaSpec[]]>
  /**
   * Add a schema to this specification.
   *
   * @param schemaSpec - A schema specification.
   * @returns This object.
   */
  addSchemaSpec(schemaSpec: SchemaSpec): this
  /**
   * Parse a HED version specification into a schemas specification object.
   *
   * @param versionSpecs - The HED version specification, can be a single version string or array of version strings.
   * @returns A schemas specification object containing parsed schema specifications.
   * @throws {IssueError} If any schema specification is invalid.
   */
  static parseVersionSpecs(versionSpecs: unknown): SchemasSpec
}

// Type definitions for hed-validator
// Project: https://github.com/hed-standard/hed-javascript
// Definitions by: GitHub Copilot

// BIDS exports
export class BidsDataset {
  /** Map of BIDS sidecar files that contain HED annotations */
  sidecarMap: Map<string, BidsSidecar>
  /** The dataset's root directory as an absolute path (Node.js context) */
  datasetRootDirectory: string | null
  /** The HED schemas used to validate this dataset */
  hedSchemas: Schemas
  /** The BIDS file accessor */
  accessor: BidsFileAccessor

  /** Factory method to create a BidsDataset */
  static create(datasetPath: string, accessor: typeof BidsFileAccessor): Promise<[BidsDataset | null, Issue[]]>

  /** Validate the dataset and return any issues */
  validate(): Promise<Issue[]>
}

export class BidsTsvFile {
  /** The file path */
  filePath: string
  /** The parsed TSV data */
  data: any[][]
  /** Column headers */
  headers: string[]

  constructor(filePath: string, data: any[][], headers: string[])
}

export class BidsJsonFile {
  /** The file path */
  filePath: string
  /** The parsed JSON data */
  data: Record<string, any>

  constructor(filePath: string, data: Record<string, any>)
}

export class BidsSidecar extends BidsJsonFile {
  /** HED-related metadata from the sidecar */
  hedData: Record<string, any>

  /** Get merged sidecar data for a specific file */
  getMergedData(filePath: string): Record<string, any>
}

export class BidsHedIssue extends Issue {
  /** The BIDS file associated with this issue */
  file: string

  constructor(code: string, message: string, file: string, parameters?: Record<string, any>)
}

export class BidsFileAccessor {
  /** The dataset root path */
  rootPath: string

  constructor(rootPath: string)

  /** Read a file's contents */
  readFile(filePath: string): Promise<string>

  /** List files in a directory */
  listFiles(dirPath: string): Promise<string[]>
}

export class BidsDirectoryAccessor extends BidsFileAccessor {
  /** Check if a path exists */
  pathExists(filePath: string): Promise<boolean>

  /** Get file stats */
  getStats(filePath: string): Promise<any>
}

export function buildBidsSchemas(datasetDescription: Record<string, any>): Promise<Schemas>

// Issues exports
export class IssueError extends Error {
  /** The associated HED issue */
  issue: Issue

  constructor(issue: Issue, ...params: any[])

  /** Generate a new Issue and immediately throw it as an IssueError */
  static generateAndThrow(internalCode: string, parameters?: Record<string, string | number[]>): never

  /** Generate and throw an internal error */
  static generateAndThrowInternalError(message?: string): never
}

export class Issue {
  /** The issue code */
  code: string
  /** The issue message */
  message: string
  /** Issue severity level */
  level: 'error' | 'warning'
  /** Additional parameters */
  parameters: Record<string, any>

  constructor(code: string, message: string, level?: 'error' | 'warning', parameters?: Record<string, any>)
}

// Parser exports
export class Definition {
  /** The name of the definition */
  name: string
  /** The parsed HED tag representing the definition */
  defTag: ParsedHedTag
  /** The parsed HED group representing the definition */
  defGroup: ParsedHedGroup
  /** The definition contents group */
  defContents: ParsedHedGroup
  /** Placeholder information */
  placeholder: any

  /** Evaluate the definition and return contents with any issues */
  evaluateDefinition(
    tag: ParsedHedTag,
    hedSchema: Schemas,
    placeholderAllowed: boolean,
  ): [string | null, Issue[], Issue[]]

  /** Check if this definition is equivalent to another */
  equivalent(other: Definition): boolean

  /** Factory method to create a Definition from a group */
  static createDefinitionFromGroup(definitionGroup: ParsedHedGroup): Definition
}

export class DefinitionManager {
  /** Map of definitions */
  definitions: Map<string, Definition>

  constructor()

  /** Add a definition */
  addDefinition(definition: Definition): void

  /** Get a definition by name */
  getDefinition(name: string): Definition | undefined

  /** Validate definitions */
  validateDefinitions(hedSchemas: Schemas): Issue[]
}

// Parsed HED types (used by Definition)
export interface ParsedHedTag {
  /** The tag value */
  _value: string
  /** Split value for two-level tags */
  _splitValue?: string
  /** The normalized tag */
  normalized: string
  /** The original tag string */
  originalTag: string
  /** The schema tag */
  schemaTag: any
}

export interface ParsedHedGroup {
  /** The normalized group string */
  normalized: string
  /** The original tag string */
  originalTag: string
  /** Child tags */
  tags: ParsedHedTag[]
}

export interface ParsedHedString {
  /** The normalized string */
  normalized: string
  /** Top-level groups */
  topLevelGroups: ParsedHedGroup[]
}

// Schema types
export interface Schemas {
  /** Get schema by name */
  getSchema(name?: string): any

  /** Validate a tag against the schemas */
  validateTag(tag: string): boolean
}

// Parser functions
export function parseStandaloneString(hedString: string): [ParsedHedString, Issue[]]

export function parseHedString(
  hedString: string,
  hedSchemas: Schemas,
  checkForWarnings?: boolean,
  expectValuePlaceholder?: boolean,
  expectDefinition?: boolean,
): [ParsedHedString, Issue[], Issue[]]

export function parseHedStrings(
  hedStrings: string[],
  hedSchemas: Schemas,
  checkForWarnings?: boolean,
): [ParsedHedString[], Issue[]]

// Schema exports
export function getLocalSchemaVersions(): Promise<string[]>

export function buildSchemasFromVersion(version: string): Promise<Schemas>

// Utility function to generate issues
export function generateIssue(code: string, parameters?: Record<string, any>): Issue

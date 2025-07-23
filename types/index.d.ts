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
  hedSchemas: Schemas | null
  /** The BIDS file accessor */
  fileAccessor: BidsFileAccessor

  /** Factory method to create a BidsDataset */
  static create(
    rootOrFiles: string | object,
    fileAccessorClass: typeof BidsFileAccessor,
  ): Promise<[BidsDataset | null, BidsHedIssue[]]>

  /** Load and set the HED schemas for this dataset */
  setHedSchemas(): Promise<BidsHedIssue[]>

  /** Find and parse all JSON sidecar files in the dataset */
  setSidecars(): Promise<BidsHedIssue[]>

  /** Validate the dataset and return any issues */
  validate(): Promise<BidsHedIssue[]>
}

export class BidsFile {
  /** The name of this file */
  name: string
  /** The Object representing this file data */
  file: any

  /** Constructor for BidsFile */
  constructor(name: string, file: any, validatorClass: any)

  /** Read a BIDS file from a relative path within a dataset */
  static readBidsFileFromDatasetPath(datasetRoot: string, relativePath: string): Promise<[string, any]>
}

export class BidsJsonFile extends BidsFile {
  /** This file's JSON data */
  jsonData: Record<string, any>

  /** Constructor for a BIDS JSON file */
  constructor(name: string, file: any, jsonData: Record<string, any>)

  /** Parse a BIDS JSON file from a BIDS dataset path */
  static createFromBidsDatasetPath(datasetRoot: string, relativePath: string): Promise<BidsJsonFile>
}

export class BidsSidecar extends BidsJsonFile {
  /** The extracted keys for this sidecar */
  sidecarKeys: Map<string, any>
  /** The extracted HED data for this sidecar */
  hedData: Map<string, any>
  /** The parsed HED data for this sidecar */
  parsedHedData: Map<string, any>
  /** The extracted HED value strings */
  hedValueStrings: string[]
  /** The extracted HED categorical strings */
  hedCategoricalStrings: string[]
  /** The mapping of column splice references */
  columnSpliceMapping: Map<string, Set<string>>

  /** Constructor for BidsSidecar */
  constructor(name: string, file: any, jsonData: Record<string, any>, defManager?: any)

  /** Whether this sidecar has any HED data */
  get hasHedData(): boolean
}

export class BidsTsvFile extends BidsFile {
  /** This file's parsed TSV data */
  parsedTsv: Map<string, string[]>
  /** HED strings in the "HED" column of the TSV data */
  hedColumnHedStrings: string[]
  /** The pseudo-sidecar object representing the merged sidecar data */
  mergedSidecar: BidsSidecar

  /** Constructor for BidsTsvFile */
  constructor(
    name: string,
    file: any,
    tsvData: string | Map<string, string[]> | Record<string, any>,
    mergedDictionary?: Record<string, any>,
    defManager?: any,
  )

  /** Determine whether this file has any HED data */
  get hasHedData(): boolean

  /** Whether this TSV file is a timeline file */
  get isTimelineFile(): boolean
}

export class BidsHedIssue extends Issue {
  /** The BIDS file associated with this issue */
  file: string

  constructor(
    internalCode: string,
    hedCode: string,
    level: 'error' | 'warning',
    parameters: Record<string, any>,
    file: string,
  )
}

export class BidsFileAccessor {
  /** The dataset root path */
  datasetRootDirectory: string
  /** Map of relative file paths to file representations */
  fileMap: Map<string, any>
  /** Organized paths */
  organizedPaths: Map<string, Map<string, string[]>>

  /** Factory method to create a BidsFileAccessor */
  static create(rootOrFiles: string | object): Promise<BidsFileAccessor>

  /** Get file content */
  getFileContent(filePath: string): Promise<string | null>
}

export class BidsDirectoryAccessor extends BidsFileAccessor {
  /** Constructor for BidsDirectoryAccessor */
  constructor(datasetRootDirectory?: string, fileMap?: Map<string, string>)

  /** Factory method to create a BidsDirectoryAccessor */
  static create(datasetRootDirectory: string): Promise<BidsDirectoryAccessor>

  /** Get file content from the filesystem */
  getFileContent(relativePath: string): Promise<string | null>
}

export function buildBidsSchemas(datasetDescription: { jsonData: Record<string, any> }): Promise<Schemas>

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
  /** The internal error code */
  internalCode: string
  /** The HED 3 error code */
  hedCode: string
  /** Issue severity level */
  level: 'error' | 'warning'
  /** The detailed error message */
  message: string
  /** Additional parameters */
  parameters: Record<string, any>

  constructor(internalCode: string, hedCode: string, level: 'error' | 'warning', parameters?: Record<string, any>)
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
export function getLocalSchemaVersions(): string[]

export function buildSchemasFromVersion(version: string): Promise<Schemas>

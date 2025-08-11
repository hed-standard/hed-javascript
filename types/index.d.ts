// Type definitions for hed-validator
// Project: https://github.com/hed-standard/hed-javascript
// Definitions by: GitHub Copilot

// BIDS exports
export class BidsDataset {
  /** Map of BIDS sidecar files that contain HED annotations */
  sidecarMap: Map<string, BidsSidecar>

  /** The HED schemas used to validate this dataset */
  hedSchemas: HedSchemas | null

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

export class BidsJsonFile {
  /** The name of this file */
  name: string
  /** The Object representing this file data */
  file: object | null
  /** This file's JSON data */
  jsonData: Record<string, any>

  /** Constructor for a BIDS JSON file */
  constructor(name: string, file: object | null, jsonData: Record<string, any>)

  /** Validate this file against HED schemas */
  validate(schemas: HedSchemas | undefined): BidsHedIssue[]

  /** Whether this file has any HED data */
  get hasHedData(): boolean

  /** The validator class used to validate this file */
  get validatorClass(): any
}

export class BidsSidecar extends BidsJsonFile {
  /** The extracted keys for this sidecar */
  sidecarKeys: Map<string, any>
  /** The extracted HED data for this sidecar */
  hedData: Map<string, any>
  /** The parsed HED data for this sidecar */
  parsedHedData: Map<string, any>
  /** The mapping of column splice references */
  columnSpliceMapping: Map<string, Set<string>>
  /** The set of column splice references */
  columnSpliceReferences: Set<string>
  /** The object that manages definitions */
  definitions: DefinitionManager

  /** Constructor for BidsSidecar */
  constructor(
    name: string,
    file: object | null,
    sidecarData?: Record<string, any>,
    defManager?: DefinitionManager | null,
  )

  /** Whether this file has any HED data */
  get hasHedData(): boolean

  /** Parse this sidecar's HED strings within the sidecar structure */
  parseSidecarKeys(hedSchemas: HedSchemas, fullValidation?: boolean): [Issue[], Issue[]]

  /** Validate this file against HED schemas */
  validate(schemas: HedSchemas | undefined): BidsHedIssue[]

  /** The validator class used to validate this file */
  get validatorClass(): any
}

export class BidsTsvFile {
  /** The name of this file */
  name: string
  /** The Object representing this file data */
  file: object | null
  /** This file's parsed TSV data */
  parsedTsv: Map<string, string[]>
  /** HED strings in the "HED" column of the TSV data */
  hedColumnHedStrings: string[]
  /** The pseudo-sidecar object representing the merged sidecar data */
  mergedSidecar: BidsSidecar

  /** Constructor for BidsTsvFile */
  constructor(
    name: string,
    file: object | null,
    tsvData: string | Map<string, string[]> | Record<string, any>,
    mergedDictionary?: Record<string, any>,
    defManager?: DefinitionManager | null,
  )

  /** Determine whether this file has any HED data */
  get hasHedData(): boolean

  /** Whether this TSV file is a timeline file */
  get isTimelineFile(): boolean

  /** Validate this file against HED schemas */
  validate(schemas: HedSchemas | undefined): BidsHedIssue[]

  /** The validator class used to validate this file */
  get validatorClass(): any
}

export class BidsHedIssue {
  /** The file object associated with this issue */
  file: object
  /** The underlying HED issue object */
  hedIssue: Issue
  /** The BIDS-compliant issue code */
  code: string
  /** The HED-specific issue code. */
  subCode: string
  /** The severity of the issue (e.g., 'error' or 'warning') */
  severity: 'error' | 'warning'
  /** The human-readable issue message */
  issueMessage: string
  /** The line number where the issue occurred */
  line: number | undefined
  /** The path to the file where the issue occurred */
  location: string | undefined

  constructor(hedIssue: Issue, file: object | null)

  /**
   * Converts one or more HED issues into BIDS-compatible issues.
   */
  static fromHedIssues(
    hedIssues: Error | Issue[],
    file: object | null,
    extraParameters?: Record<string, any>,
  ): BidsHedIssue[]
}

export class BidsFileAccessor {
  /** Map of relative file paths to file representations */
  fileMap: Map<string, object>

  /** Organized paths */
  organizedPaths: Map<string, Map<string, string[]>>

  /** Constructor for BidsDirectoryAccessor */
  constructor(datasetRootDirectory: string, fileMap: Map<string, string>)

  /** Factory method to create a BidsFileAccessor */
  static create(rootOrFiles: string | object): Promise<BidsFileAccessor>

  /** Get file content */
  getFileContent(filePath: string): Promise<string | null>
}

export class BidsDirectoryAccessor {
  /** Map of relative file paths to file representations */
  fileMap: Map<string, object>

  /** Organized paths */
  organizedPaths: Map<string, Map<string, string[]>>

  /** Constructor for BidsDirectoryAccessor */
  constructor(datasetRootDirectory: string, fileMap: Map<string, string>)

  /** Factory method to create a BidsDirectoryAccessor */
  static create(datasetRootDirectory: string): Promise<BidsDirectoryAccessor>

  /** Get file content from the filesystem */
  getFileContent(relativePath: string): Promise<string | null>
}

export function buildBidsSchemas(datasetDescription: BidsJsonFile): Promise<Schemas | null>

// Issues exports
export class IssueError extends Error {
  /** The associated HED issue */
  issue: Issue

  protected constructor(issue: Issue, ...params: any[])

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

  /** Override of Object.prototype.toString */
  toString(): string

  /** (Re-)generate the issue message */
  generateMessage(): void
}

/**
 * Generate a new issue object.
 *
 * @param internalCode The internal error code.
 * @param parameters The error string parameters.
 * @returns An object representing the issue.
 */
export function generateIssue(internalCode: string, parameters?: Record<string, any>): Issue

/**
 * Update the parameters of a list of issues.
 *
 * @param issues The list of issues (different types can be intermixed).
 * @param parameters The parameters to add.
 */
export function updateIssueParameters(issues: (IssueError | Issue)[], parameters: Record<string, string>): void

// Parser exports
export class Definition {
  /** The name of the definition */
  name: string
  /** The parsed HED tag representing the definition */
  defTag: ParsedHedTag
  /** The parsed HED group representing the definition */
  defGroup: ParsedHedGroup
  /** Placeholder information */
  placeholder: string

  /** Evaluate the definition and return contents with any issues */
  evaluateDefinition(
    tag: ParsedHedTag,
    hedSchema: HedSchemas,
    placeholderAllowed: boolean,
  ): [string | null, Issue[], Issue[]]

  /** Check if this definition is equivalent to another */
  equivalent(other: Definition): boolean

  /** Create a definition from a HED string */
  static createDefinition(hedString: string, hedSchemas: HedSchemas): [Definition | null, Issue[], Issue[]]

  /** Factory method to create a Definition from a group */
  static createDefinitionFromGroup(definitionGroup: ParsedHedGroup): [Definition | null, Issue[], Issue[]]
}

export class DefinitionManager {
  /** Map of definitions */
  definitions: Map<string, Definition>

  constructor()

  /** Add a list of definitions to this manager */
  addDefinitions(defs: Definition[]): Issue[]

  /** Add a single definition to this manager */
  addDefinition(definition: Definition): Issue[]

  /** Check Def tags in a HED string for missing or incorrectly used definitions */
  validateDefs(hedString: ParsedHedString, hedSchemas: HedSchemas, placeholderAllowed: boolean): Issue[]

  /** Check Def-expand tags in a HED string for missing or incorrectly used definitions */
  validateDefExpands(hedString: ParsedHedString, hedSchemas: HedSchemas, placeholderAllowed: boolean): Issue[]
}

// Parsed HED types (used by Definition)
export interface TagSpec {
  /** The tag this spec represents */
  tag: string
  /** The schema prefix for this tag, if any */
  library: string
  /** Start position in the original string */
  start: number
  /** End position in the original string */
  end: number
}

export interface ParsedHedSubstring {
  /** The original pre-parsed version of the HED tag */
  originalTag: string
  /** The bounds of the HED tag in the original HED string */
  originalBounds: number[]
  /** The normalized version of the object */
  normalized: string

  /** Format this substring nicely */
  format(long?: boolean): string
  /** Override of Object.prototype.toString */
  toString(): string
}

export interface ParsedHedColumnSplice extends ParsedHedSubstring {
  /** The original pre-parsed version of the column splice (from ParsedHedSubstring) */
  originalTag: string
  /** The normalized version of the column splice */
  normalized: string

  /** Format this column splice template nicely */
  format(long?: boolean): string
  /** Override of Object.prototype.toString */
  toString(): string
  /** Determine if this column splice is equivalent to another */
  equivalent(other: ParsedHedColumnSplice): boolean
}

export class ParsedHedTag {
  /** The original pre-parsed version of the HED tag (from ParsedHedSubstring) */
  originalTag: string
  /** The bounds of the HED tag in the original HED string (from ParsedHedSubstring) */
  originalBounds: number[]
  /** The formatted canonical version of the HED tag */
  formattedTag: string
  /** The canonical form of the HED tag */
  canonicalTag: string
  /** The HED schema this tag belongs to */
  schema: HedSchema
  /** The schema's representation of this tag */
  schemaTag: SchemaTag
  /** The tag value */
  _value: string
  /** Split value for two-level tags */
  _splitValue?: string
  /** The normalized tag */
  normalized: string
  /** The remaining part of the tag after the portion actually in the schema */
  _remainder: string
  /** The units if any */
  _units: string

  /** Constructor for ParsedHedTag */
  constructor(tagSpec: TagSpec, hedSchemas: HedSchemas, hedString: string)

  /** Format this tag nicely */
  format(long?: boolean): string
  /** Override of Object.prototype.toString */
  toString(): string

  /** Check if this tag has a specific attribute */
  hasAttribute(attribute: string): boolean

  /** Check if this tag is equivalent to another */
  equivalent(other: ParsedHedTag): boolean
}

export class ParsedHedGroup {
  /** The original pre-parsed version of the HED group (from ParsedHedSubstring) */
  originalTag: string
  /** The bounds of the HED group in the original HED string (from ParsedHedSubstring) */
  originalBounds: number[]
  /** The normalized group string */
  normalized: string
  /** The parsed HED tags, groups, or splices in the HED tag group at the top level */
  tags: (ParsedHedTag | ParsedHedGroup | ParsedHedColumnSplice)[]
  /** The top-level parsed HED tags in this string */
  topTags: ParsedHedTag[]
  /** The top-level parsed HED groups in this string */
  topGroups: ParsedHedGroup[]
  /** All the parsed HED tags in this string */
  allTags: ParsedHedTag[]
  /** Reserved HED group tags. This only covers top group tags in the group */
  reservedTags: Map<string, ParsedHedTag[]>
  /** The top-level child subgroups containing Def-expand tags */
  defExpandChildren: ParsedHedGroup[]
  /** The top-level Def tags */
  defTags: ParsedHedTag[]
  /** The top-level Def-expand tags */
  defExpandTags: ParsedHedTag[]
  /** The total number of top-level Def tags and top-level Def-expand groups */
  defCount: number
  /** The unique top-level tag requiring a Def or Def-expand group, if any */
  requiresDefTag: ParsedHedTag[] | null

  /** Constructor for ParsedHedGroup */
  constructor(parsedHedTags: any[], hedString: string, originalBounds: number[])

  /** Format this group nicely */
  format(long?: boolean): string
  /** Override of Object.prototype.toString */
  toString(): string
  /** Check if this group is equivalent to another */
  equivalent(other: ParsedHedGroup): boolean
  /** Generator that yields subgroups containing a specific tag name */
  subParsedGroupIterator(tagName: string): Generator<ParsedHedGroup>
  /** Generator that yields all column splices in this group and subgroups */
  columnSpliceIterator(): Generator<ParsedHedColumnSplice>
}

export class ParsedHedString {
  /** The original HED string */
  hedString: string
  /** The tag groups in the string (top-level) */
  tagGroups: ParsedHedGroup[]
  /** All the top-level tags in the string */
  topLevelTags: ParsedHedTag[]
  /** All the tags in the string at all levels */
  tags: ParsedHedTag[]
  /** All the column splices in the string at all levels */
  columnSplices: ParsedHedColumnSplice[]
  /** The tags in the top-level tag groups in the string, split into arrays */
  topLevelGroupTags: ParsedHedTag[]
  /** The top-level definition tag groups in the string */
  definitions: ParsedHedGroup[]
  /** The normalized string */
  normalized: string

  /** Constructor for ParsedHedString */
  constructor(hedString: string, parsedTags: (ParsedHedTag | ParsedHedGroup | ParsedHedColumnSplice)[])

  /** Format this HED string nicely */
  format(long?: boolean): string
  /** Override of Object.prototype.toString */
  toString(): string
}

// Schema types
export class HedSchema {
  /** This schema's prefix in the active schema set */
  prefix: string
  /** The collection of schema entries */
  entries: SchemaEntries
  /** The standard HED schema version this schema is linked to */
  withStandard: string

  constructor(xmlData: object, entries: SchemaEntries)
}

export class SchemaEntries {
  /** The schema's properties */
  properties: SchemaEntryManager<SchemaProperty>
  /** The schema's attributes */
  attributes: SchemaEntryManager<SchemaAttribute>
  /** The schema's value classes */
  valueClasses: SchemaEntryManager<SchemaValueClass>
  /** The schema's unit classes */
  unitClasses: SchemaEntryManager<SchemaUnitClass>
  /** The schema's unit modifiers */
  unitModifiers: SchemaEntryManager<SchemaUnitModifier>
  /** The schema's tags */
  tags: SchemaEntryManager<SchemaTag>

  constructor(schemaParser: object)
}

export class SchemaEntryManager<T extends SchemaEntry> {
  /** The definitions managed by this entry manager */
  protected _definitions: Map<string, T>

  constructor(definitions: Map<string, T>)

  [Symbol.iterator](): IterableIterator<[string, T]>
  keys(): IterableIterator<string>
  values(): IterableIterator<T>
  hasEntry(name: string): boolean
  getEntry(name: string): T
  getEntriesWithBooleanAttribute(booleanAttributeName: string): Map<string, T>
  filter(fn: (entry: [string, T]) => boolean): Map<string, T>
  get length(): number
}

export class SchemaEntry {
  /** The name of this schema entry */
  name: string

  constructor(name: string)

  hasBooleanAttribute(attributeName: string): boolean
}

export class SchemaProperty extends SchemaEntry {
  /** The type of the property */
  protected _propertyType: string

  constructor(name: string, propertyType: string)

  /** Whether this property describes a schema category */
  get isCategoryProperty(): boolean
  /** Whether this property describes a data type */
  get isTypeProperty(): boolean
  /** Whether this property describes a role */
  get isRoleProperty(): boolean
}

export class SchemaAttribute extends SchemaEntry {
  /** The categories of elements this schema attribute applies to */
  protected _categoryProperties: Set<SchemaProperty>
  /** The data type of this schema attribute */
  protected _typeProperty: SchemaProperty
  /** The set of role properties for this schema attribute */
  protected _roleProperties: Set<SchemaProperty>

  constructor(name: string, properties: SchemaProperty[])

  /** The categories of elements this schema attribute applies to */
  get categoryProperty(): Set<SchemaProperty> | SchemaProperty | undefined
  /** The data type property of this schema attribute */
  get typeProperty(): SchemaProperty
  /** The set of role properties for this schema attribute */
  get roleProperties(): Set<SchemaProperty>
}

export class SchemaEntryWithAttributes extends SchemaEntry {
  /** The set of boolean attributes this schema entry has */
  booleanAttributes: Set<SchemaAttribute>
  /** The collection of value attributes this schema entry has */
  valueAttributes: Map<SchemaAttribute, any>
  /** The set of boolean attribute names this schema entry has */
  booleanAttributeNames: Set<string>
  /** The collection of value attribute names this schema entry has */
  valueAttributeNames: Map<string, any>

  constructor(name: string, booleanAttributes: Set<SchemaAttribute>, valueAttributes: Map<SchemaAttribute, any>)

  hasAttribute(attributeName: string): boolean
  hasBooleanAttribute(attributeName: string): boolean
  getValue(attributeName: string): any
}

export class SchemaUnit extends SchemaEntryWithAttributes {
  /** The type of this unit */
  unitType: SchemaUnitClass
  /** The SI unit this unit is based on */
  siUnit: string
  /** The default SI unit for this unit's type */
  defaultSiUnit: string
  /** The unit symbol */
  unitSymbol: string

  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, any>,
    unitType: SchemaUnitClass,
  )
}

export class SchemaUnitClass extends SchemaEntryWithAttributes {
  /** The units in this class */
  units: SchemaUnit[]

  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, any>,
    units: SchemaUnit[],
  )
}

export class SchemaUnitModifier extends SchemaEntryWithAttributes {
  /** The SI prefix for this unit modifier */
  siPrefix: string
  /** The factor this unit modifier represents */
  factor: number

  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, any>,
    siPrefix: string,
    factor: number,
  )
}

export class SchemaValueClass extends SchemaEntryWithAttributes {}

export class SchemaTag extends SchemaEntryWithAttributes {
  /** The parent tag of this tag */
  parent: SchemaTag

  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, any>,
    parent: SchemaTag,
  )

  get shortTagName(): string
  get longTagName(): string
  isUnitClass(): boolean
  isTakesValueClass(): boolean
  parentHasAttribute(attributeName: string): boolean
}

export class HedSchemas {
  /** The imported HED schemas */
  schemas: Map<string, HedSchema>

  constructor(schemas: HedSchema | Map<string, HedSchema>)

  /** Get schema by name */
  getSchema(name?: string): HedSchema | undefined

  /** The base schema, i.e. the schema with no prefix, if one is defined. */
  get baseSchema(): HedSchema | undefined
}

// Schema exports
export function getLocalSchemaVersions(): string[]

export function buildSchemasFromVersion(version: string): Promise<Schemas>

// Parser exports
/**
 * Parse a HED string.
 *
 * @param hedString A (possibly already parsed) HED string.
 * @param hedSchemas The collection of HED schemas.
 * @param definitionsAllowed True if definitions are allowed.
 * @param placeholdersAllowed True if placeholders are allowed.
 * @param fullValidation True if full validation is required.
 * @returns The parsed HED string and any issues found.
 */
export function parseHedString(
  hedString: string | ParsedHedString,
  hedSchemas: HedSchemas,
  definitionsAllowed: boolean,
  placeholdersAllowed: boolean,
  fullValidation: boolean,
): [ParsedHedString, Issue[], Issue[]]

/**
 * Parse a HED string in a standalone context.
 *
 * @param hedString A (possibly already parsed) HED string.
 * @param hedSchemas The collection of HED schemas.
 * @param defManager The definition manager to use for parsing definitions.
 * @returns The parsed HED string and any issues found.
 */
export function parseStandaloneString(
  hedString: string | ParsedHedString,
  hedSchemas: HedSchemas,
  defManager?: DefinitionManager | null,
): [ParsedHedString, Issue[], Issue[]]

/**
 * Parse a list of HED strings.
 *
 * @param hedStrings A list of HED strings.
 * @param hedSchemas The collection of HED schemas.
 * @param definitionsAllowed True if definitions are allowed
 * @param placeholdersAllowed True if placeholders are allowed
 * @param fullValidation True if full validation is required.
 * @returns The parsed HED strings and any issues found.
 */
export function parseHedStrings(
  hedStrings: (string | ParsedHedString)[],
  hedSchemas: HedSchemas,
  definitionsAllowed: boolean,
  placeholdersAllowed: boolean,
  fullValidation: boolean,
): [ParsedHedString[], Issue[], Issue[]]

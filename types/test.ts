import {
  // BIDS
  BidsDataset,
  BidsJsonFile,
  BidsSidecar,
  BidsTsvFile,
  BidsHedIssue,
  BidsFileAccessor,
  BidsDirectoryAccessor,
  BidsWebAccessor,
  buildBidsSchemas,

  // Issues
  IssueError,
  Issue,

  // Parser
  Definition,
  DefinitionManager,

  // Parsed HED types
  ParsedHedTag,
  ParsedHedGroup,
  ParsedHedString,
  TagSpec,
  ParsedHedColumnSplice,

  // Schema
  HedSchema,
  HedSchemas,
  Schema,
  SchemaEntries,
  SchemaEntryManager,
  SchemaEntry,
  SchemaProperty,
  SchemaAttribute,
  SchemaEntryWithAttributes,
  SchemaUnit,
  SchemaUnitClass,
  SchemaUnitModifier,
  SchemaValueClass,
  SchemaTag,
  Schemas,

  // Parser functions
  parseStandaloneString,
  parseHedString,
  parseHedStrings,

  // Schema functions
  getLocalSchemaVersions,
  buildSchemasFromVersion,
} from 'hed-validator'

// This is a type-only test file.
// It is not intended to be run, but to be type-checked.
// This is why many functions are async and not awaited.

// Mock data and objects
const fakePath = '/fake/path'
const fakeFile: object = { name: 'fake.json', path: fakePath }
const fakeHedString = 'Event'

async function testBids(schemas: HedSchemas) {
  // BidsDataset
  const [dataset, bidsIssues] = await BidsDataset.create(fakePath, BidsDirectoryAccessor)
  if (dataset) {
    dataset.setHedSchemas()
    dataset.setSidecars()
    dataset.validate()
    const sidecar: BidsSidecar | undefined = dataset.sidecarMap.get('sidecar.json')
    if (sidecar) {
      console.log(sidecar.hasHedData)
    }
  }
  console.log(bidsIssues)

  // BidsJsonFile
  const bidsJsonFile = new BidsJsonFile('test.json', fakeFile, {})
  console.log(bidsJsonFile.name, bidsJsonFile.file, bidsJsonFile.jsonData, bidsJsonFile.hasHedData)
  bidsJsonFile.validate(schemas)

  // BidsSidecar
  const defManager = new DefinitionManager()
  const bidsSidecar = new BidsSidecar('sidecar.json', fakeFile, {}, defManager)
  console.log(
    bidsSidecar.sidecarKeys,
    bidsSidecar.hedData,
    bidsSidecar.parsedHedData,
    bidsSidecar.columnSpliceMapping,
    bidsSidecar.columnSpliceReferences,
    bidsSidecar.definitions,
    bidsSidecar.hasHedData,
  )
  bidsSidecar.parseSidecarKeys(schemas, true)
  bidsSidecar.validate(schemas)

  // BidsTsvFile
  const bidsTsvFile = new BidsTsvFile('events.tsv', fakeFile, 'data', {}, defManager)
  console.log(
    bidsTsvFile.name,
    bidsTsvFile.file,
    bidsTsvFile.parsedTsv,
    bidsTsvFile.hedColumnHedStrings,
    bidsTsvFile.mergedSidecar,
    bidsTsvFile.hasHedData,
    bidsTsvFile.isTimelineFile,
  )
  bidsTsvFile.validate(schemas)

  // BidsHedIssue
  const issue = new Issue('genericError', 'INTERNAL_ERROR', 'error', { hedCode: 'code' })
  const bidsHedIssue = new BidsHedIssue(issue, fakeFile)
  console.log(
    bidsHedIssue.file,
    bidsHedIssue.hedIssue,
    bidsHedIssue.code,
    bidsHedIssue.subCode,
    bidsHedIssue.severity,
    bidsHedIssue.issueMessage,
    bidsHedIssue.line,
    bidsHedIssue.location,
  )
  const bidsHedIssueMessage: string = bidsHedIssue.toString()
  BidsHedIssue.addIssueParameters([bidsHedIssue], { tsvLine: 2 })
  console.log(bidsHedIssueMessage)

  // BidsFileAccessor
  const fileAccessor = await BidsFileAccessor.create(fakePath)
  console.log(fileAccessor.fileMap, fileAccessor.organizedPaths)
  fileAccessor.getFileContent('file.txt')
  const suffixCount: number = BidsFileAccessor.SUFFIXES.length + BidsFileAccessor.SPECIAL_DIRS.length
  console.log(suffixCount)

  // BidsDirectoryAccessor
  const directoryAccessor = await BidsDirectoryAccessor.create(fakePath)
  console.log(directoryAccessor.fileMap, directoryAccessor.organizedPaths)
  directoryAccessor.getFileContent('file.txt')

  // BidsWebAccessor
  const fakeFileList: File[] = []
  const webAccessor = await BidsWebAccessor.create(fakeFileList)
  console.log(webAccessor.fileMap, webAccessor.organizedPaths)
  webAccessor.getFileContent('file.txt')

  // buildBidsSchemas
  await buildBidsSchemas(bidsJsonFile)
}

function testIssues() {
  // Issue
  const issue = new Issue('genericError', 'INTERNAL_ERROR', 'error', { a: 1 })
  console.log(issue.internalCode, issue.hedCode, issue.level, issue.message, issue.parameters)
  issue.generateMessage()
  console.log(issue.toString())
  issue.addParameters({ tsvLine: 2 })
  issue.addParameter('sidecarKey', 'event_code')
  const hasLine: boolean = issue.hasParameter('tsvLine')
  console.log(hasLine, issue.bounds)

  // IssueError
  try {
    IssueError.generateAndThrow('internalCode', { param: [1, 2] })
  } catch (e: unknown) {
    if (e instanceof IssueError) {
      console.log((e as IssueError).issue)
    }
  }
  try {
    IssueError.generateAndThrowInternalError('internal error message')
  } catch (e: unknown) {
    if (e instanceof IssueError) {
      console.log((e as IssueError).issue)
    }
  }
  try {
    IssueError.generateAndRethrow(new Error('cause'), (error) => ['internalError', { message: error.message }])
  } catch (e: unknown) {
    if (e instanceof IssueError) {
      console.log((e as IssueError).issue)
    }
  }
}

function testParser(
  schemas: HedSchemas,
  parsedString: ParsedHedString,
  parsedTag: ParsedHedTag,
  parsedGroup: ParsedHedGroup,
) {
  // Definition
  const [definition, defIssues, defIssues2] = Definition.createDefinition(fakeHedString, schemas)
  if (definition) {
    console.log(definition.name, definition.defTag, definition.defGroup, definition.placeholder)
    definition.evaluateDefinition(parsedTag, schemas, true)
    const [definitionFromGroup, defGroupIssues, defGroupIssues2] = Definition.createDefinitionFromGroup(parsedGroup)
    if (definitionFromGroup) {
      definition.equivalent(definitionFromGroup)
    }
    console.log(defGroupIssues, defGroupIssues2)
  }
  console.log(defIssues, defIssues2)

  // DefinitionManager
  const defManager = new DefinitionManager()
  if (definition) {
    defManager.addDefinition(definition)
    defManager.addDefinitions([definition])
  }
  defManager.validateDefs(parsedString, schemas, true)
  defManager.validateDefExpands(parsedString, schemas, true)

  // ParsedHedTag
  const tagSpec: TagSpec = { tag: 'tag', library: 'lib', start: 0, end: 3 }
  const parsedHedTag = new ParsedHedTag(tagSpec, schemas)
  const schema: Schema = parsedHedTag.schema
  const schemaTag: SchemaTag = parsedHedTag.schemaTag
  console.log(
    parsedHedTag.originalTag,
    parsedHedTag.originalBounds,
    parsedHedTag.formattedTag,
    parsedHedTag.canonicalTag,
    schema,
    schemaTag,
  )
  parsedHedTag.format(true)
  parsedHedTag.toString()
  parsedHedTag.hasAttribute('attribute')
  parsedHedTag.equivalent(parsedTag)
  const valueInDefaultUnits: number | null = parsedHedTag.valueAsDefaultUnit()
  console.log(valueInDefaultUnits)
  const tagValue: string = parsedHedTag.value
  const tagSplitValue: string | null = parsedHedTag.splitValue
  const tagRemainder: string = parsedHedTag.remainder
  const tagTakesValue: boolean = parsedHedTag.takesValue
  const tagHasUnitClass: boolean = parsedHedTag.hasUnitClass
  const tagUnitClasses: SchemaUnitClass[] = parsedHedTag.unitClasses
  console.log(tagValue, tagSplitValue, tagRemainder, tagTakesValue, tagHasUnitClass, tagUnitClasses)

  // ParsedHedGroup
  const parsedHedGroup = new ParsedHedGroup([parsedTag, parsedGroup], fakeHedString, [0, 1])
  const tags: (ParsedHedTag | ParsedHedGroup | ParsedHedColumnSplice)[] = parsedHedGroup.tags
  console.log(
    parsedHedGroup.originalTag,
    parsedHedGroup.originalBounds,
    tags,
    parsedHedGroup.topTags,
    parsedHedGroup.topGroups,
    parsedHedGroup.allTags,
    parsedHedGroup.defExpandChildren,
    parsedHedGroup.defTags,
    parsedHedGroup.defExpandTags,
    parsedHedGroup.defCount,
    parsedHedGroup.requiresDefTag,
  )
  parsedHedGroup.format(true)
  parsedHedGroup.toString()
  parsedHedGroup.equivalent(parsedGroup)
  const subGroupIterator = parsedHedGroup.subParsedGroupIterator('tag')
  console.log(subGroupIterator.next().value)
  const spliceIterator = parsedHedGroup.columnSpliceIterator()
  const splice: ParsedHedColumnSplice = spliceIterator.next().value
  console.log(splice)

  // ParsedHedString
  const parsedHedString = new ParsedHedString(fakeHedString, [parsedTag, parsedGroup, splice])
  console.log(
    parsedHedString.hedString,
    parsedHedString.tagGroups,
    parsedHedString.topLevelTags,
    parsedHedString.tags,
    parsedHedString.columnSplices,
    parsedHedString.topLevelGroupTags,
    parsedHedString.definitions,
    parsedHedString.normalized,
  )
  parsedHedString.format(true)
  parsedHedString.toString()
}

function testSchemaTypes(schemas: HedSchemas) {
  // HedSchema
  const schema: HedSchema = schemas.getSchema('')
  if (!schema) {
    return
  }
  console.log(schema.version, schema.library, schema.prefix, schema.entries, schema.withStandard)

  // The former names (deprecated aliases)
  const formerSchemas: Schemas = schemas
  const formerSchema: Schema = formerSchemas.baseSchema
  console.log(formerSchema instanceof Schema, formerSchemas instanceof Schemas)

  // SchemaEntries
  const entries: SchemaEntries = schema.entries
  console.log(
    entries.properties,
    entries.attributes,
    entries.valueClasses,
    entries.unitClasses,
    entries.unitModifiers,
    entries.tags,
  )

  // SchemaEntryManager
  const manager: SchemaEntryManager<SchemaTag> = entries.tags
  for (const [key, value] of manager) {
    console.log(key, value)
  }
  console.log(manager.keys().next().value)
  console.log(manager.values().next().value)
  console.log(manager.hasEntry('entry'))
  console.log(manager.getEntry('entry'))
  console.log(manager.getEntriesWithBooleanAttribute('attribute'))
  console.log(manager.filter(([, v]) => v.hasBooleanAttribute('attribute')))
  console.log(manager.length)

  // SchemaEntry
  const entry: SchemaEntry = manager.getEntry('entry')
  if (entry) {
    console.log(entry.name, entry.description, SchemaEntry.sortByName(entry, entry))
    entry.hasBooleanAttribute('attribute')
  }

  // SchemaProperty
  const property: SchemaProperty = entries.properties.values().next().value
  if (property) {
    console.log(property.name, property.description)
  }

  // SchemaAttribute
  const attribute: SchemaAttribute = entries.attributes.values().next().value
  if (attribute) {
    const properties: Set<SchemaProperty> = attribute.properties
    const recursive: boolean = attribute.recursive
    console.log(properties, recursive)
  }

  // SchemaEntryWithAttributes
  const entryWithAttrs: SchemaEntryWithAttributes = entries.tags.values().next().value
  if (entryWithAttrs) {
    console.log(
      entryWithAttrs.booleanAttributes,
      entryWithAttrs.valueAttributes,
      entryWithAttrs.booleanAttributeNames,
      entryWithAttrs.valueAttributeNames,
    )
    entryWithAttrs.hasAttribute('attribute')
    entryWithAttrs.hasBooleanAttribute('attribute')
    entryWithAttrs.getSingleAttributeValue('attribute')
    entryWithAttrs.getAttributeValues('attribute')
  }

  // SchemaUnit
  const unitClass: SchemaUnitClass = entries.unitClasses.values().next().value
  if (unitClass) {
    const unit: SchemaUnit | undefined = unitClass.units.values().next().value
    if (unit) {
      console.log(unit.isPrefixUnit, unit.isSIUnit, unit.isUnitSymbol, [...unit.derivativeUnits()])
      const isUnit: boolean = unit.validateUnit('ms')
      const factor: number | null = unit.conversionFactor('ms')
      const description: string | undefined = unit.description
      const same: boolean = unit.equivalent(unit)
      console.log(isUnit, factor, description, same)
    }
  }

  // SchemaUnitClass
  if (unitClass) {
    const units: Map<string, SchemaUnit> = unitClass.units
    const defaultUnit: SchemaUnit | undefined = unitClass.defaultUnit
    const [extractedUnit, unitString, valueString] = unitClass.extractUnit('3 ms')
    console.log(units, defaultUnit, extractedUnit, unitString, valueString, unitClass.hasConversionFactors)
  }

  // SchemaUnitModifier
  const unitModifier: SchemaUnitModifier = entries.unitModifiers.values().next().value
  if (unitModifier) {
    console.log(unitModifier.name, unitModifier.getSingleAttributeValue('conversionFactor'))
  }

  // SchemaValueClass
  const valueClass: SchemaValueClass = entries.valueClasses.values().next().value
  console.log(valueClass.name, valueClass.allowedNames, valueClass.validateValue('x'), valueClass.valueProblem('x'))

  // SchemaTag
  const tag: SchemaTag = entries.tags.values().next().value
  if (tag) {
    console.log(tag.parent, tag.ancestors, tag.longName, tag.valueTag, tag.unitClasses, tag.valueClasses)
    console.log(tag.hasUnitClasses, tag.extend('x'), tag.longExtend('x'))
  }
}

async function testSchemaFunctions() {
  // getLocalSchemaVersions
  const versions = getLocalSchemaVersions()
  console.log(versions)

  // buildSchemasFromVersion
  if (versions.length > 0) {
    const schemas = await buildSchemasFromVersion(versions[0])
    if (schemas) {
      // Schemas
      console.log(schemas.schemas, schemas.baseSchema)
      schemas.getSchema('')

      // parseStandaloneString
      const [parsedString, issues, issues5] = parseStandaloneString(fakeHedString, schemas)
      console.log(parsedString, issues, issues5)

      // parseHedString
      const [parsedHedString, issues2, issues3] = parseHedString(fakeHedString, schemas, true, true, true)
      console.log(parsedHedString, issues2, issues3)

      // parseHedStrings
      const [parsedHedStrings, issues4, issues6] = parseHedStrings([fakeHedString], schemas, true, true, true)
      console.log(parsedHedStrings, issues4, issues6)

      // Run other tests that require schemas
      await testBids(schemas)
      if (parsedHedString && parsedHedString.tags.length > 0 && parsedHedString.tagGroups.length > 0) {
        const parsedTag = parsedHedString.tags[0] as ParsedHedTag
        const parsedGroup = parsedHedString.tagGroups[0]
        testParser(schemas, parsedHedString, parsedTag, parsedGroup)
      }
      testSchemaTypes(schemas)
    }
  }
}

async function main() {
  testIssues()
  await testSchemaFunctions()
}

main().catch(console.error)

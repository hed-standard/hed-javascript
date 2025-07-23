import {
  BidsDataset,
  BidsFile,
  BidsJsonFile,
  BidsSidecar,
  BidsTsvFile,
  BidsHedIssue,
  BidsFileAccessor,
  BidsDirectoryAccessor,
  buildBidsSchemas,
  IssueError,
  Issue,
  DefinitionManager,
  Schemas,
  parseStandaloneString,
  parseHedString,
  parseHedStrings,
  getLocalSchemaVersions,
  buildSchemasFromVersion,
  ParsedHedTag,
} from 'hed-validator'

async function testBids() {
  // This is a type-only test, so we don't need a real dataset.
  const fakeDatasetPath = '/path/to/dataset'

  try {
    const [dataset, issues] = await BidsDataset.create(fakeDatasetPath, BidsDirectoryAccessor)
    if (dataset) {
      await dataset.setHedSchemas()
      await dataset.setSidecars()
      await dataset.validate()
      const sidecar: BidsSidecar | undefined = dataset.sidecarMap.get('sidecar.json')
      if (sidecar) {
        console.log(sidecar.hasHedData)
      }
    }
    console.log(issues)

    const bidsFile = new BidsFile('test.txt', {}, {})
    console.log(bidsFile.name)

    const bidsJsonFile = new BidsJsonFile('test.json', {}, {})
    console.log(bidsJsonFile.jsonData)

    const bidsSidecar = new BidsSidecar('test.json', {}, {})
    console.log(bidsSidecar.hasHedData)

    const bidsTsvFile = new BidsTsvFile('test.tsv', {}, 'data')
    console.log(bidsTsvFile.hasHedData)
    console.log(bidsTsvFile.isTimelineFile)

    const bidsHedIssue = new BidsHedIssue('code', 'hedCode', 'error', {}, 'file.txt')
    console.log(bidsHedIssue.file)

    const fileAccessor = await BidsFileAccessor.create(fakeDatasetPath)
    await fileAccessor.getFileContent('file.txt')

    const directoryAccessor = await BidsDirectoryAccessor.create(fakeDatasetPath)
    await directoryAccessor.getFileContent('file.txt')

    const schemas = await buildBidsSchemas({ jsonData: {} })
    console.log(schemas)
  } catch (e) {
    // We expect errors since we're not using a real dataset, but this is a type-check, not a runtime test.
  }
}

function testIssues() {
  const issue = new Issue('internalCode', 'hedCode', 'warning')
  const issueError = new IssueError(issue)
  console.log(issueError.issue)
  try {
    IssueError.generateAndThrow('internalCode', { param: [1, 2] })
  } catch (e: unknown) {
    if (e instanceof IssueError) {
      console.log(e.issue)
    }
  }
}

function testParser(schemas: Schemas) {
  const defManager = new DefinitionManager()
  const definition = defManager.getDefinition('defName')
  if (definition) {
    defManager.addDefinition(definition)
    const [evaluated, issues1, issues2] = definition.evaluateDefinition({} as ParsedHedTag, schemas, false)
    console.log(evaluated, issues1, issues2)
  }
  defManager.validateDefinitions(schemas)

  const [parsedString, issues] = parseStandaloneString('12345')
  console.log(parsedString, issues)

  const [parsedHedString, issues2, issues3] = parseHedString('Event', schemas)
  console.log(parsedHedString, issues2, issues3)

  const [parsedHedStrings, issues4] = parseHedStrings(['Event'], schemas)
  console.log(parsedHedStrings, issues4)
}

async function testSchema() {
  const versions = getLocalSchemaVersions()
  console.log(versions)
  if (versions.length > 0) {
    const schemas = await buildSchemasFromVersion(versions[0])
    if (schemas) {
      testParser(schemas)
    }
  }
}

async function main() {
  await testBids()
  testIssues()
  await testSchema()
}

main().catch(console.error)

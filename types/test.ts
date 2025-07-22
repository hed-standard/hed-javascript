// Test file to verify TypeScript definitions work correctly
import {
  BidsDataset,
  BidsDirectoryAccessor,
  parseHedString,
  BidsHedIssue,
  IssueError,
  Issue,
  buildSchemasFromVersion,
} from '../index.js'

// This file tests that the TypeScript definitions are correct
// It should compile without errors when the types are properly defined

async function testTypes() {
  // Test BIDS functionality
  const [dataset, issues] = await BidsDataset.create('tests/bidsDemoData', BidsDirectoryAccessor)

  if (dataset) {
    const validationIssues: BidsHedIssue[] = await dataset.validate()
    console.log(`Found ${validationIssues.length} validation issues`)
  }

  // Test parser functionality
  const schemas = await buildSchemasFromVersion('8.3.0')
  const [parsed, errors, warnings] = parseHedString('Event/Something', schemas, false, false, true)

  console.log(`Parsed: ${parsed.normalized}`)
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`)
}

// // This function demonstrates the type safety
// function processIssues(issues: Issue[]) {
//   issues.forEach(issue => {
//     console.log(`${issue.level}: ${issue.message} (${issue.code})`);
//   });
// }

// export { testTypes, processIssues };

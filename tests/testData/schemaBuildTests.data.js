import { BidsHedIssue } from '../../bids'
import { generateIssue, IssueError } from '../../common/issues/issues'

export const schemaSpecTestData = [
  {
    name: 'valid-schemaSpecs',
    description: 'Test of valid schema tests',
    tests: [
      {
        testname: 'simple-version-string',
        explanation: 'HED standard version "8.3.0" as a string',
        schemaVersion: { Name: 'SimpleStandardVersion', HEDVersion: '8.3.0' },
        schemaError: null,
      },
      {
        testname: 'simple-version-list',
        explanation: 'HED standard version ["8.3.0"] s a list',
        schemaVersion: { Name: 'SimpleVersionList', HEDVersion: ['8.3.0'] },
        schemaError: null,
      },
    ],
  },
  {
    name: 'invalid-schemaSpecs',
    description: 'Invalid schema specs in various forms',
    tests: [
      {
        testname: 'bad-standard-version-string',
        explanation: 'Bad standard version "8.3.0.4"',
        schemaVersion: { Name: 'BadSemanticVersion', HEDVersion: '8.3.0.4' },
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: '8.3.0.4' })),
      },
    ],
  },
]

import { generateIssue, IssueError } from '../../common/issues/issues'

export const schemaSpecTestData = [
  {
    name: 'valid-schemaSpecs',
    description: 'Test of valid schema tests',
    tests: [
      {
        testname: 'simple-version-string',
        explanation: 'Version "8.3.0" is a string',
        schemaVersion: { Name: 'SimpleStandardVersion', HEDVersion: '8.3.0' },
        schemaError: null,
      },
      {
        testname: 'simple-version-list',
        explanation: 'Version ["8.3.0"] is a list',
        schemaVersion: { Name: 'SimpleVersionList', HEDVersion: ['8.3.0'] },
        schemaError: null,
      },
      {
        testname: 'unpartnered-library-as-base',
        explanation: 'Version  ["score_1.0.0" ] is unpartnered',
        schemaVersion: { Name: 'OnlyScoreAsBase', HEDVersion: ['score_1.0.0'] },
        schemaError: null,
      },
      {
        testname: 'unpartnered-library-as-test',
        explanation: 'Version  ["sc:score_1.0.0" ] is unpartnered',
        schemaVersion: { Name: 'OnlyScoreAsTest', HEDVersion: ['sc:score_1.0.0'] },
        schemaError: null,
      },
      {
        testname: 'base-and-two-libraries',
        explanation: 'Version  ["8.3.0", "ts:testlib_1.0.2", "bg:testlib_1.0.2"] has a base and two libraries',
        schemaVersion: { Name: 'BaseAndTwoTests', HEDVersion: ['8.3.0', 'ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
        schemaError: null,
      },
      {
        testname: 'no-base-and-two-libraries',
        explanation: 'Version  ["ts:testlib_1.0.2", "bg:testlib_1.0.2"] has a base and two libraries',
        schemaVersion: { Name: 'TwoTests', HEDVersion: ['ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
        schemaError: null,
      },
      {
        testname: 'good-lazy-partnered-libraries',
        explanation: 'Version  ["testlib_2.0.0", "testlib_3.0.0"] is lazy partnered',
        schemaVersion: { Name: 'GoodLazyPartnered', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0'] },
        schemaError: null,
      },
      {
        testname: 'good-lazy-partnered-libraries',
        explanation: 'Version  ["testlib_2.0.0", "testlib_3.0.0"] is lazy partnered',
        schemaVersion: { Name: 'GoodLazyPartnered', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0'] },
        schemaError: null,
      },
      {
        testname: 'lazy-partnered-libraries-with-conflicting-tags',
        explanation: 'Version  ["testlib_2.0.0", "testlib_2.1.0"] have conflicting tags but error not in SchemaSpec',
        schemaVersion: { Name: 'Lazy', HEDVersion: ['testlib_2.0.0', 'testlib_2.1.0'] },
        schemaError: null,
      },
      {
        testname: 'lazy-partnered-libraries-with-wrong-standard',
        explanation:
          'Version  ["testlib_2.0.0", "testlib_3.0.0", "8.3.0"] have conflicting standard schema but error not in SchemaSpec',
        schemaVersion: { Name: 'Lazy', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0', '8.3.0'] },
        schemaError: null,
      },
    ],
  },
  {
    name: 'invalid-schemaSpecs',
    description: 'Invalid schema specs in various forms',
    tests: [
      {
        testname: 'bad-standard-semantic-version-string',
        explanation: 'Bad standard version "8.3.0.4"',
        schemaVersion: { Name: 'BadSemanticVersion', HEDVersion: '8.3.0.4' },
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: '8.3.0.4' })),
      },
      {
        testname: 'bad-library-semantic-version-string',
        explanation: 'Bad library version "testlib_8.3.0.4"',
        schemaVersion: { Name: 'BadLibrartSemanticVersion', HEDVersion: 'testlib_8.3.0.4' },
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: 'testlib_8.3.0.4' })),
      },
      {
        testname: 'empty-nickname',
        explanation: 'Empty nickname in schema version [":testlib_1.0.2", "8.3.0"]',
        schemaVersion: { Name: 'LeadingColon', BIDSVersion: '1.10.0', HEDVersion: [':testlib_1.0.2', '8.3.0'] },
        schemaError: new IssueError(generateIssue('invalidSchemaNickname', { nickname: '', spec: ':testlib_1.0.2' })),
      },
      {
        testname: 'non-alphabetic-version-nickname',
        explanation: 'Nickname contains non-alphabetic characters in ["8.3.0", "t-s:testlib_1.0.2"]',
        schemaVersion: { Name: 'BadNickName', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 't-s:testlib_1.0.2'] },
        schemaError: new IssueError(
          generateIssue('invalidSchemaNickname', { nickname: 't-s', spec: 't-s:testlib_1.0.2' }),
        ),
      },
      {
        testname: 'multiple-colon-nickname',
        explanation: 'Nickname multiple columnsn ["8.3.0", "ts::testlib_1.0.2"]',
        schemaVersion: {
          Name: 'MultipleColonsTogether',
          BIDSVersion: '1.10.0',
          HEDVersion: ['8.3.0', 'ts::testlib_1.0.2'],
        },
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: 'ts::testlib_1.0.2' })),
      },
    ],
  },
]

export const schemaBuildTestData = [
  {
    name: 'valid-schema-build',
    description: 'Valid schema specs in various forms',
    tests: [
      {
        testname: 'simple-standard-schema-build',
        explanation: '"8.3.0" simple standard version string',
        schemaVersion: { Name: 'GoodStandardVersion', HEDVersion: '8.3.0' },
        schemaError: null,
      },
      {
        testname: 'base-and-two-libraries-build',
        explanation: '["8.3.0", "ts:testlib_1.0.2", "bg:testlib_1.0.2"] has a base and two libraries',
        schemaVersion: { Name: 'BaseAndTwoTests', HEDVersion: ['8.3.0', 'ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
        schemaError: null,
      },
      {
        testname: 'no-base-and-two-libraries-build',
        explanation: '["ts:testlib_1.0.2", "bg:testlib_1.0.2"] has a base and two libraries',
        schemaVersion: { Name: 'TwoTests', HEDVersion: ['ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
        schemaError: null,
      },
      {
        testname: 'good-lazy-partnered-remote-schema-build',
        explanation: '["testlib_2.0.0", "testlib_3.0.0"] is lazy partnered and testlib_3.0.0 is remote',
        schemaVersion: { Name: 'GoodLazyPartnered', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0'] },
        schemaError: null,
      },
    ],
  },
  {
    name: 'invalid-schema-build',
    description: 'Invalid schema specs in various forms',
    tests: [
      {
        testname: 'bad-standard-semantic-version-string-build',
        explanation: '"8.3.0.5" is a bad standard semantic version',
        schemaVersion: { Name: 'BadSemanticVersion', HEDVersion: '8.3.0.5' },
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: '8.3.0.5' })),
      },
      {
        testname: 'lazy-partnered-with wrong-standard-build',
        explanation: '["testlib_2.0.0", "8.3.0"] has wrong standard schema',
        schemaVersion: { Name: 'BadLazyPartnered', HEDVersion: ['testlib_2.0.0', '8.3.0'] },
        schemaError: new IssueError(generateIssue('differentWithStandard', { first: '8.3.0', second: '8.2.0' })),
      },
      {
        testname: 'lazy-partnered-with conflicting-tags-build',
        explanation: '["testlib_2.1.0", "testlib_3.0.0"] have conflicting tags',
        schemaVersion: { Name: 'BadLazyPartnered', HEDVersion: ['testlib_2.1.0', 'testlib_3.0.0'] },
        schemaError: new IssueError(generateIssue('lazyPartneredSchemasShareTag', { tag: 'Piano-sound' })),
      },
    ],
  },
]

import { generateIssue, IssueError } from '../../src/issues/issues'

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
    ],
  },
  {
    name: 'invalid-schemaSpecs',
    description: 'Invalid schema specs in various forms',
    tests: [
      {
        testname: 'two-versions-of-one-library',
        explanation: 'Version  ["testlib_2.0.0", "testlib_3.0.0"] lists one library twice in a merge group',
        schemaVersion: { Name: 'TwoVersions', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "testlib"', prefix: '' }),
        ),
      },
      {
        testname: 'two-versions-of-one-library-with-conflicting-tags',
        explanation: 'Version  ["testlib_2.0.0", "testlib_2.1.0"] lists one library twice in a merge group',
        schemaVersion: { Name: 'Lazy', HEDVersion: ['testlib_2.0.0', 'testlib_2.1.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "testlib"', prefix: '' }),
        ),
      },
      {
        testname: 'two-versions-of-one-library-with-standard',
        explanation: 'Version  ["testlib_2.0.0", "testlib_3.0.0", "8.3.0"] lists one library twice in a merge group',
        schemaVersion: { Name: 'Lazy', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0', '8.3.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "testlib"', prefix: '' }),
        ),
      },
      {
        testname: 'same-library-version-twice',
        explanation: 'Version  ["testlib_2.0.0", "testlib_2.0.0"] lists the same library schema twice',
        schemaVersion: { Name: 'ExactDuplicate', HEDVersion: ['testlib_2.0.0', 'testlib_2.0.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "testlib"', prefix: '' }),
        ),
      },
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
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: ':testlib_1.0.2' })),
      },
      {
        testname: 'non-alphabetic-version-nickname',
        explanation: 'Nickname contains non-alphabetic characters in ["8.3.0", "t-s:testlib_1.0.2"]',
        schemaVersion: { Name: 'BadNickName', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 't-s:testlib_1.0.2'] },
        schemaError: new IssueError(generateIssue('invalidSchemaSpecification', { spec: 't-s:testlib_1.0.2' })),
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
        testname: 'standard-partner-listed-with-library-build',
        explanation: '["8.4.0", "lang_1.1.0"] lists the partner standard schema, which adds nothing',
        schemaVersion: { Name: 'PartnerListed', HEDVersion: ['8.4.0', 'lang_1.1.0'] },
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
        explanation: '["lang_1.1.0", "8.3.0"] has wrong standard schema',
        schemaVersion: { Name: 'BadLazyPartnered', HEDVersion: ['lang_1.1.0', '8.3.0'] },
        schemaError: new IssueError(generateIssue('differentWithStandard', { versions: '8.3.0, 8.4.0' })),
      },
      {
        testname: 'two-versions-of-one-library-build',
        explanation: '["score_2.0.0", "score_2.1.0"] are two versions of the same library',
        schemaVersion: { Name: 'TwoVersions', HEDVersion: ['score_2.0.0', 'score_2.1.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "score"', prefix: '' }),
        ),
      },
      {
        testname: 'same-library-version-twice-build',
        explanation: '["score_2.1.0", "score_2.1.0"] lists the same library schema twice',
        schemaVersion: { Name: 'ExactDuplicate', HEDVersion: ['score_2.1.0', 'score_2.1.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "score"', prefix: '' }),
        ),
      },
      {
        testname: 'standard-schema-twice-build',
        explanation: '["8.4.0", "8.4.0"] lists the standard schema twice',
        schemaVersion: { Name: 'StandardTwice', HEDVersion: ['8.4.0', '8.4.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'the standard schema', prefix: '' }),
        ),
      },
      {
        testname: 'prefixed-standard-schemas-build',
        explanation: '["sc:8.3.0", "sc:8.4.0"] lists two standard versions under one prefix',
        schemaVersion: { Name: 'PrefixedStandardTwice', HEDVersion: ['sc:8.3.0', 'sc:8.4.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'the standard schema', prefix: 'sc' }),
        ),
      },
      {
        testname: 'two-versions-of-one-library-different-partners-build',
        explanation: '["lang_1.0.0", "lang_1.1.0"] are two versions of the same library with different partners',
        schemaVersion: { Name: 'TwoVersions', HEDVersion: ['lang_1.0.0', 'lang_1.1.0'] },
        schemaError: new IssueError(
          generateIssue('multipleVersionsOfSameLibrarySchema', { schema: 'library "lang"', prefix: '' }),
        ),
      },
    ],
  },
]

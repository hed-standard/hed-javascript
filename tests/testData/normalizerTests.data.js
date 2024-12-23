import { generateIssue } from '../../common/issues/issues'

export const normalizerTestData = [
  {
    name: 'simple-tags',
    description: 'Simple tags requirements',
    tests: [
      {
        testname: 'single-tag',
        explanation: '"" is a single level tag"',
        schemaVersion: '8.3.0',
        string: 'Item',
        stringNormalized: 'Item',
        errors: [],
      },
      {
        testname: 'empty-string',
        explanation: '"" is an empty string"',
        schemaVersion: '8.3.0',
        string: '',
        stringNormalized: '',
        errors: [],
      },
      {
        testname: 'non-duplicate-tags',
        explanation: '"Red,  Blue, Green" is a simple list of non-duplicate tags',
        schemaVersion: '8.3.0',
        string: 'Red,  Blue, Green',
        stringNormalized: 'Blue,Green,Red',
        errors: [],
      },
      {
        testname: 'duplicate-tags',
        explanation: '"Red,  Blue, Red" has duplicate tags',
        schemaVersion: '8.3.0',
        string: 'Red,  Blue, Red',
        stringNormalized: null,
        errors: [generateIssue('duplicateTag', { tags: '[Red]', string: 'Red,  Blue, Red' })],
      },
    ],
  },
]

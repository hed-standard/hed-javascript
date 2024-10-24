import { BidsHedIssue } from '../bids'
import { generateIssue } from '../common/issues/issues'

export const bidsTestData = [
  {
    name: 'valid-bids-datasets-with-limited-hed',
    description: 'HED or data is missing in various places',
    tests: [
      {
        name: 'no-hed-at-all-but-both-tsv-json-non-empty',
        explanation: 'Neither the sidecar or tsv has HED but neither non-empty',
        schemaVersion: '8.3.0',
        sidecar: {
          duration: {
            description: 'Duration of the event in seconds.',
          },
        },
        eventsString: 'onset\tduration\n' + '7\t4',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
      {
        name: 'only-header-in-tsv-with-return',
        explanation: 'TSV only has header and trailing return and white space',
        schemaVersion: '8.3.0',
        sidecar: {
          duration: {
            description: 'Duration of the event in seconds.',
          },
        },
        eventsString: 'onset\tduration\n  ',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
      {
        name: 'empty-json-empty-tsv',
        explanation: 'Both sidecar and tsv are empty except for white space',
        schemaVersion: '8.3.0',
        sidecar: {},
        eventsString: '\n  \n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
    ],
  },
  {
    name: 'valid-json-invalid-tsv',
    description: 'JSON is valid but tsv is invalid',
    tests: [
      {
        name: 'valid-sidecar-bad-tag-tsv',
        explanation: 'Unrelated sidecar is valid but HED column tag is invalid',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
            },
          },
        },
        eventsString: 'onset\tduration\tHED\n' + '7\t4\tBaloney',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTag', { tag: 'Baloney' }),
            { relativePath: 'valid-sidecar-bad-tag-tsv.tsv' },
            { tsvLine: 2 },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTag', { tag: 'Baloney' }),
            { path: 'valid-sidecar-bad-tag-tsv.tsv', relativePath: 'valid-sidecar-bad-tag-tsv.tsv' },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        name: 'valid-sidecar-tsv-curly-brace',
        explanation: 'The sidecar is valid, but tsv HED column has braces}',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tHED\n' + '7\t4\tface\tRed,{blue}',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{blue}' }),
            { relativePath: 'valid-sidecar-tsv-curly-brace.tsv' },
            { tsvLine: 2 },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{blue}' }),
            { path: 'valid-sidecar-tsv-curly-brace.tsv', relativePath: 'valid-sidecar-tsv-curly-brace.tsv' },
            { tsvLine: 2 },
          ),
        ],
      },
    ],
  },
]

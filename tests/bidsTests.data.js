import { BidsHedIssue } from '../bids'
import { generateIssue } from '../common/issues/issues'

export const bidsTestData = [
  /*  {
    name: 'valid-bids-datasets-with-limited-hed',
    description: 'HED or data is missing in various places',
    tests: [
      {
        testname: 'no-hed-at-all-but-both-tsv-json-non-empty',
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
        testname: 'only-header-in-tsv-with-return',
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
        testname: 'empty-json-empty-tsv',
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
        testname: 'valid-sidecar-bad-tag-tsv',
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
        testname: 'valid-sidecar-tsv-curly-brace',
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
  {
      name: 'duplicate-tag-test',
      description: 'Duplicate tags can appear in isolation or in combiantion',
      tests: [
        {
          testname: 'first-level-duplicate-json-tsv',
          explanation: 'Each is okay but when combined, duplicate tag',
          schemaVersion: '8.3.0',
          sidecar: {
            vehicle: {
              HED: {
                car: 'Car',
                train: 'Train',
                boat: 'Boat',
              },
            },
            speed: {
              HED: 'Speed/# mph',
            },
            transport: {
              HED: {
                car: 'Car',
                train: 'Train',
                boat: 'Boat',
                maglev: 'Vehicle',
              },
            }
          },
          eventsString: 'onset\tduration\tvehicle\ttransport\tspeed\n' + '19\t6\tboat\tboat\t5\n',
          sidecarOnlyErrors: [],
          eventsOnlyErrors: [],
          comboErrors: [
            BidsHedIssue.fromHedIssue(
              generateIssue('duplicateTag', { tag: 'Boat' }),
              { path: 'first-level-duplicate-json-tsv.tsv', relativePath: 'first-level-duplicate-json-tsv.tsv' },
              { tsvLine: 2 },
            ),
          ],
        },
      ],
    },*/

  {
    name: 'curly-brace-tests',
    description: 'Curly braces tested in various places',
    tests: [
      {
        testname: 'valid-curly-brace-in-sidecar-with-simple-splice',
        explanation: 'Valid curly brace in sidecar and valid value is spliced in',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: '{ball_type}, Black',
            },
          },
          ball_type: {
            Description: 'Has description with HED',
            HED: 'Label/#',
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\n' + '19\t6\tball\tbig-one\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-curly-brace-in-sidecar-with-n/a-splice',
        explanation: 'Valid curly brace in sidecar and but tsv splice entry is n/a',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: '{ball_type}, Black',
            },
          },
          ball_type: {
            Description: 'Has description with HED',
            HED: 'Label/#',
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\n' + '19\t6\tball\tn/a\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-curly-brace-in-sidecar-with-HED-column-splice',
        explanation: 'Valid curly brace in sidecar with HED column splice',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: '{ball_type}, Black, ({HED})',
            },
          },
          ball_type: {
            Description: 'Has description with HED',
            HED: 'Label/#',
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\tHED\n' + '19\t6\tball\tn/a\tPurple\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
      {
        testname: 'invalid-curly-brace-column-slice-has-no hed',
        explanation: 'A column name is used in a splice but does not have HED',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: '{ball_type}, Black',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\n' + '19\t6\tball\tn/a\tPurple\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [],
      },
    ],
  },
]

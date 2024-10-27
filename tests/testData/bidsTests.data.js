import { BidsHedIssue } from '../../bids'
import { generateIssue } from '../../common/issues/issues'

export const bidsTestData = [
  {
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
    name: 'duplicate-tag-tests',
    description: 'Duplicate tags can appear in isolation or in combination',
    tests: [
      {
        testname: 'invalid-first-level-duplicate-json-tsv',
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
          },
        },
        eventsString: 'onset\tduration\tvehicle\ttransport\tspeed\n' + '19\t6\tboat\tboat\t5\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Boat' }),
            {
              path: 'invalid-first-level-duplicate-json-tsv.tsv',
              relativePath: 'invalid-first-level-duplicate-json-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Boat' }),
            {
              path: 'invalid-first-level-duplicate-json-tsv.tsv',
              relativePath: 'invalid-first-level-duplicate-json-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-duplicate-groups-first-level-tsv',
        explanation: 'The HED string has first level duplicate groups',
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
          },
        },
        eventsString: 'onset\tduration\tvehicle\tHED\n' + '19\t6\tboat\t(Green, Blue),(Green, Blue)\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, Blue)' }),
            { relativePath: 'invalid-duplicate-groups-first-level-tsv.tsv' },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, Blue)' }),
            { relativePath: 'invalid-duplicate-groups-first-level-tsv.tsv' },
            { tsvLine: 2 },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, Blue)' }),
            {
              path: 'invalid-duplicate-groups-first-level-tsv.tsv',
              relativePath: 'invalid-duplicate-groups-first-level-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, Blue)' }),
            {
              path: 'invalid-duplicate-groups-first-level-tsv.tsv',
              relativePath: 'invalid-duplicate-groups-first-level-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
    ],
  },
  {
    name: 'curly-brace-tests',
    description: 'Curly braces tested in various places',
    tests: [
      {
        testname: 'valid-curly-brace-in-sidecar-with-value-splice',
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
        testname: 'valid-curly-brace-in-sidecar-with-category-splice',
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
            HED: {
              beginner: 'Small',
              advanced: 'Large',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\n' + '19\t6\tball\tadvanced\n',
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
        testname: 'valid-HED-column-splice',
        explanation: 'Valid curly brace in sidecar with valid HED column splice',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: 'Black, {HED}',
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
        testname: 'valid-HED-column-splice-with-n/a',
        explanation: 'Valid curly brace in sidecar with HED column entry n/a',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              ball: '{HED}',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\tHED\n' + '19\t6\tball\tn/a\tn/a\n',
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
        sidecarOnlyErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('undefinedCurlyBraces', { column: 'ball_type' }), {
            path: 'invalid-curly-brace-column-slice-has-no hed.json',
            relativePath: 'invalid-curly-brace-column-slice-has-no hed.json',
          }),
        ],
        eventsOnlyErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('undefinedCurlyBraces', { column: 'ball_type' }), {
            path: 'invalid-curly-brace-column-slice-has-no hed.tsv',
            relativePath: 'invalid-curly-brace-column-slice-has-no hed.tsv',
          }),
        ],
      },
      {
        testname: 'invalid-HED-curly-brace-but-tsv-has-no-HED-column',
        explanation: 'A {HED} column splice is used in a sidecar but the tsv has no HED column',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: '{HED}, Black',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\n' + '19\t6\tball\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('undefinedCurlyBraces', { column: 'HED' }),
            {
              path: 'invalid-HED-curly-brace-but-tsv-has-no-HED-column.tsv',
              relativePath: 'invalid-HED-curly-brace-but-tsv-has-no-HED-column.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-curly-brace-in-HED-tsv-column',
        explanation: 'Curly braces are used in the HED column of a tsv.',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: 'Black',
            },
          },
        },
        eventsString: 'onset\tduration\tHED\n' + '19\t6\t{event_code}\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{event_code}' }),
            {
              relativePath: 'invalid-curly-brace-in-HED-tsv-column.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{event_code}' }),
            {
              path: 'invalid-curly-brace-in-HED-tsv-column.tsv',
              relativePath: 'invalid-curly-brace-in-HED-tsv-column.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-curly-brace-in-HED-tsv-column',
        explanation: 'Curly braces are used in the HED column of a tsv.',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: 'Black',
            },
          },
        },
        eventsString: 'onset\tduration\tHED\n' + '19\t6\t{event_code}\n',
        sidecarOnlyErrors: [],
        eventsOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{event_code}' }),
            {
              relativePath: 'invalid-curly-brace-in-HED-tsv-column.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{event_code}' }),
            {
              path: 'invalid-curly-brace-in-HED-tsv-column.tsv',
              relativePath: 'invalid-curly-brace-in-HED-tsv-column.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-recursive-curly-braces',
        explanation: 'Mutually recursive curly braces in sidecar.',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: 'Black, {type}',
            },
          },
          type: {
            HED: {
              familiar: '{event_code}',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\n' + '19\t6\tball\n',
        sidecarOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'type', referrer: 'event_code' }),
            {
              path: 'invalid-recursive-curly-braces.json',
              relativePath: 'invalid-recursive-curly-braces.json',
            },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'event_code', referrer: 'type' }),
            {
              path: 'invalid-recursive-curly-braces.json',
              relativePath: 'invalid-recursive-curly-braces.json',
            },
          ),
        ],
        eventsOnlyErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'type', referrer: 'event_code' }),
            {
              path: 'invalid-recursive-curly-braces.tsv',
              relativePath: 'invalid-recursive-curly-braces.tsv',
            },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'event_code', referrer: 'type' }),
            {
              path: 'invalid-recursive-curly-braces.tsv',
              relativePath: 'invalid-recursive-curly-braces.tsv',
            },
          ),
        ],
      },
      {
        testname: 'invalid-self-recursive-curly-braces',
        explanation: 'Mutually recursive curly braces in sidecar.',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
              ball: 'Black, {event_code}',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\n' + '19\t6\tball\n',
        sidecarOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'event_code', referrer: 'event_code' }),
            {
              path: 'invalid-self-recursive-curly-braces.json',
              relativePath: 'invalid-self-recursive-curly-braces.json',
            },
          ),
        ],
        eventsOnlyErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'event_code', referrer: 'event_code' }),
            {
              path: 'invalid-self-recursive-curly-braces.tsv',
              relativePath: 'invalid-self-recursive-curly-braces.tsv',
            },
          ),
        ],
      },
      {
        testname: 'invalid-recursive-curly-brace-chain',
        explanation: 'Curly braces column A -> column B -> Column C.',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              ball: 'Black, {ball_type}',
            },
          },
          ball_type: {
            HED: {
              advanced: 'Large, {ball_size}',
            },
          },
          ball_size: {
            HED: 'Radius/# cm',
          },
        },
        eventsString: 'onset\tduration\tevent_code\tball_type\tball_size\n' + '19\t6\tball\tadvanced\t10\n',
        sidecarOnlyErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'ball_type', referrer: 'event_code' }),
            {
              path: 'invalid-recursive-curly-brace-chain.json',
              relativePath: 'invalid-recursive-curly-brace-chain.json',
            },
          ),
        ],
        eventsOnlyErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'ball_type', referrer: 'event_code' }),
            {
              path: 'invalid-recursive-curly-brace-chain.tsv',
              relativePath: 'invalid-recursive-curly-brace-chain.tsv',
            },
          ),
        ],
      },
    ],
  },
]

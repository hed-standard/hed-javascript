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
        sidecarErrors: [],
        tsvErrors: [],
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
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'empty-json-empty-tsv',
        explanation: 'Both sidecar and tsv are empty except for white space',
        schemaVersion: '8.3.0',
        sidecar: {},
        eventsString: '\n  \n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
    ],
  },
  {
    name: 'invalid-tag-tests',
    description: 'JSON is valid but tsv is invalid',
    tests: [
      {
        testname: 'invalid-bad-tag-in-tsv',
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
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('invalidTag', { tag: 'Baloney', tsvLine: 2 }), {
            path: 'invalid-bad-tag-in-tsv.tsv',
            relativePath: 'invalid-bad-tag-in-tsv.tsv',
          }),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTag', { tag: 'Baloney' }),
            { path: 'invalid-bad-tag-in-tsv.tsv', relativePath: 'invalid-bad-tag-in-tsv.tsv' },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-bad-tag-in-JSON',
        explanation: 'Sidecar has a bad tag but tsv HED column tag is valid',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), Baloney',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tHED\n' + '7\t4\tface\tGreen',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('invalidTag', { tag: 'Baloney' }), {
            path: 'invalid-bad-tag-in-JSON.json',
            relativePath: 'invalid-bad-tag-in-JSON.json',
          }),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('invalidTag', { tag: 'Baloney' }), {
            path: 'invalid-bad-tag-in-JSON.tsv',
            relativePath: 'invalid-bad-tag-in-JSON.tsv',
          }),
        ],
      },
      {
        testname: 'invalid-bad-tag-in-JSON',
        explanation: 'Bad tag in JSON',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow)), Baloney',
            },
          },
        },
        eventsString: 'onset\tduration\tHED\n' + '7\t4\tGreen',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('invalidTag', { tag: 'Baloney' }), {
            path: 'invalid-bad-tag-in-JSON.json',
            relativePath: 'invalid-bad-tag-in-JSON.json',
          }),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('invalidTag', { tag: 'Baloney' }), {
            path: 'invalid-bad-tag-in-JSON.tsv',
            relativePath: 'invalid-bad-tag-in-JSON.tsv',
          }),
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
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('curlyBracesInHedColumn', { column: '{blue}', tsvLine: 2 }), {
            path: 'valid-sidecar-tsv-curly-brace.tsv',
            relativePath: 'valid-sidecar-tsv-curly-brace.tsv',
          }),
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
        sidecarErrors: [],
        tsvErrors: [],
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
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: '(Green, Blue)', tsvLine: 2 }), {
            path: 'invalid-duplicate-groups-first-level-tsv.tsv',
            relativePath: 'invalid-duplicate-groups-first-level-tsv.tsv',
          }),
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: '(Green, Blue)', tsvLine: 2 }), {
            path: 'invalid-duplicate-groups-first-level-tsv.tsv',
            relativePath: 'invalid-duplicate-groups-first-level-tsv.tsv',
          }),
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
        sidecarErrors: [],
        tsvErrors: [],
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
        sidecarErrors: [],
        tsvErrors: [],
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
        sidecarErrors: [],
        tsvErrors: [],
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
        sidecarErrors: [],
        tsvErrors: [],
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
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-HED-curly-brace-but-tsv-has-no-HED-column',
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
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'invalid-curly-brace-column-slice-has-no hed',
        explanation: 'A column name is used in a splice but does not have a HED key',
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
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('undefinedCurlyBraces', { column: 'ball_type' }), {
            path: 'invalid-curly-brace-column-slice-has-no hed.json',
            relativePath: 'invalid-curly-brace-column-slice-has-no hed.json',
          }),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('undefinedCurlyBraces', { column: 'ball_type' }), {
            path: 'invalid-curly-brace-column-slice-has-no hed.tsv',
            relativePath: 'invalid-curly-brace-column-slice-has-no hed.tsv',
          }),
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
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('curlyBracesInHedColumn', { column: '{event_code}', tsvLine: 2 }), {
            path: 'invalid-curly-brace-in-HED-tsv-column.tsv',
            relativePath: 'invalid-curly-brace-in-HED-tsv-column.tsv',
          }),
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
        sidecarErrors: [
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
        tsvErrors: [],
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
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'event_code', referrer: 'event_code' }),
            {
              path: 'invalid-self-recursive-curly-braces.json',
              relativePath: 'invalid-self-recursive-curly-braces.json',
            },
          ),
        ],
        tsvErrors: [],
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
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', { column: 'ball_type', referrer: 'event_code' }),
            {
              path: 'invalid-recursive-curly-brace-chain.json',
              relativePath: 'invalid-recursive-curly-brace-chain.json',
            },
          ),
        ],
        tsvErrors: [],
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
  {
    name: 'placeholder-tests',
    description: 'Various placeholder tests',
    tests: [
      {
        testname: 'valid-placeholder-used-in-tsv',
        explanation: 'The sidecar has a placeholder that is used in the tsv',
        schemaVersion: '8.3.0',
        sidecar: {
          vehicle: {
            HED: {
              car: 'Car',
              train: 'Train',
            },
          },
          speed: {
            HED: 'Speed/# mph',
          },
        },
        eventsString: 'onset\tduration\tvehicle\tspeed\n' + '19\t6\tcar\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-placeholder-not-used',
        explanation: 'The sidecar has a placeholder that is not used in the tsv',
        schemaVersion: '8.3.0',
        sidecar: {
          vehicle: {
            HED: {
              car: 'Car',
              train: 'Train',
            },
          },
          speed: {
            HED: 'Speed/# mph',
          },
        },
        eventsString: 'onset\tduration\tvehicle\n' + '19\t6\tcar\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },

      {
        testname: 'invalid-no-placeholder-value-column',
        explanation: 'The sidecar has a value column with no placeholder tag',
        schemaVersion: '8.3.0',
        sidecar: {
          vehicle: {
            HED: {
              car: 'Car',
              train: 'Train',
            },
          },
          speed: {
            HED: 'Blue,Speed',
          },
        },
        eventsString: 'onset\tduration\tvehicle\tspeed\n' + '19\t6\ttrain\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('missingPlaceholder', { string: 'Blue,Speed', sidecarKey: 'speed' }),
            {
              path: 'invalid-no-placeholder-value-column.json',
              relativePath: 'invalid-no-placeholder-value-column.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [],
      },
    ],
  },
]

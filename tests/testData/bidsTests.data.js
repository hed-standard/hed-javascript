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
    name: 'invalid-syntax',
    description: 'Syntax errors in various places',
    tests: [
      {
        testname: 'mismatched-parentheses-in-tsv',
        explanation: 'HED column has mismatched parentheses',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              face: '(Red, Blue), (Green, (Yellow))',
            },
          },
        },
        eventsString: 'onset\tduration\tHED\n' + '7\t4\t(Red, Def/MyColor',
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('unclosedParenthesis', { index: '0', string: '(Red, Def/MyColor', tsvLine: 2 }),
            {
              path: 'mismatched-parentheses-in-tsv.tsv',
              relativePath: 'mismatched-parentheses-in-tsv.tsv',
            },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('unclosedParenthesis', { index: '0', string: '(Red, Def/MyColor', tsvLine: 2 }),
            { path: 'mismatched-parentheses-in-tsv.tsv', relativePath: 'mismatched-parentheses-in-tsv.tsv' },
            { tsvLine: 2 },
          ),
        ],
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
        testname: 'valid-no-duplicate-tsv',
        explanation: 'No duplicates in tsv, no groups, no JSON',
        schemaVersion: '8.3.0',
        sidecar: {},
        eventsString: 'onset\tduration\tHED\n' + '19\t6\tEvent/Sensory-event,Item/Object, Purple\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-duplicate-tsv',
        explanation: 'Duplicate at different level in tsv',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              ball: '(Item/Object, Sensory-event)',
            },
          },
        },
        eventsString:
          'onset\tduration\tevent_code\tHED\n' +
          '19\t6\tball\tEvent/Sensory-event,Item/Object, Purple, (Item/Object, Purple)\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-repeats-different-nesting-tsv',
        explanation: 'Duplicate groups not at same level in tsv',
        schemaVersion: '8.3.0',
        sidecar: {},
        eventsString: 'onset\tduration\tHED\n' + '19\t6\t(Red, Blue, (Green)), (Red, Blue, ((Green)))\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
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
      {
        testname: 'invalid-different-forms-same-tag-tsv',
        explanation: 'Duplicate tags in different forms',
        schemaVersion: '8.3.0',
        sidecar: {},
        eventsString: 'onset\tduration\tHED\n' + '19\t6\tTrain,Vehicle/Train\n',
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: 'Train', tsvLine: 2 }), {
            path: 'invalid-different-forms-same-tag-tsv.tsv',
            relativePath: 'invalid-different-forms-same-tag-tsv.tsv',
          }),
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: 'Vehicle/Train', tsvLine: 2 }), {
            path: 'invalid-different-forms-same-tag-tsv.tsv',
            relativePath: 'invalid-different-forms-same-tag-tsv.tsv',
          }),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Train' }),
            {
              path: 'invalid-different-forms-same-tag-tsv.tsv',
              relativePath: 'invalid-different-forms-same-tag-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Vehicle/Train' }),
            {
              path: 'invalid-different-forms-same-tag-tsv.tsv',
              relativePath: 'invalid-different-forms-same-tag-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-repeated-nested-groups-tsv',
        explanation: 'The HED string has first level repeated nested groups',
        schemaVersion: '8.3.0',
        sidecar: {
          vehicle: {
            HED: {
              car: 'Car',
              train: 'Train',
              boat: 'Boat',
            },
          },
        },
        eventsString:
          'onset\tduration\tvehicle\tHED\n' +
          '19\t6\tboat\t(Red, (Blue, Green, (Yellow)), Red, (Blue, Green, (Yellow)))\n',
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: 'Red', tsvLine: 2 }), {
            path: 'invalid-repeated-nested-groups-tsv.tsv',
            relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
          }),
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: 'Red', tsvLine: 2 }), {
            path: 'invalid-repeated-nested-groups-tsv.tsv',
            relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
          }),
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: '(Blue, Green, (Yellow))', tsvLine: 2 }), {
            path: 'invalid-repeated-nested-groups-tsv.tsv',
            relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
          }),
          BidsHedIssue.fromHedIssue(generateIssue('duplicateTag', { tag: '(Blue, Green, (Yellow))', tsvLine: 2 }), {
            path: 'invalid-repeated-nested-groups-tsv.tsv',
            relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
          }),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Red' }),
            {
              path: 'invalid-repeated-nested-groups-tsv.tsv',
              relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Red' }),
            {
              path: 'invalid-repeated-nested-groups-tsv.tsv',
              relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Blue, Green, (Yellow))' }),
            {
              path: 'invalid-repeated-nested-groups-tsv.tsv',
              relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Blue, Green, (Yellow))' }),
            {
              path: 'invalid-repeated-nested-groups-tsv.tsv',
              relativePath: 'invalid-repeated-nested-groups-tsv.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-first-level-duplicate-combo',
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
              path: 'invalid-first-level-duplicate-combo.tsv',
              relativePath: 'invalid-first-level-duplicate-combo.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: 'Boat' }),
            {
              path: 'invalid-first-level-duplicate-combo.tsv',
              relativePath: 'invalid-first-level-duplicate-combo.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-first-level-duplicate-combo-reordered',
        explanation: 'Each is okay but when combined, duplicate group in different order',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              ball: '(Green, Purple), Blue, Orange',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tHED\n' + '19\t6\tball\tWhite,(Purple, Green), (Orange)\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, Purple)' }),
            {
              path: 'invalid-first-level-duplicate-combo-reordered.tsv',
              relativePath: 'invalid-first-level-duplicate-combo-reordered.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Purple, Green)' }),
            {
              path: 'invalid-first-level-duplicate-combo-reordered.tsv',
              relativePath: 'invalid-first-level-duplicate-combo-reordered.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-nested-duplicate-json-reordered',
        explanation: 'Deeply nested duplicates in JSON entry reordered',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              ball: '(Green, ((Blue, Orange, (Black, Purple))), White), Blue, Orange, (White, (((Purple, Black), Blue, Orange)),  Green)',
            },
          },
        },
        eventsString: 'onset\tduration\tevent_code\tHED\n' + '19\t6\tball\tSensory-event\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              sidecarKey: 'event_code',
              tag: '(Green, ((Blue, Orange, (Black, Purple))), White)',
            }),
            {
              path: 'invalid-nested-duplicate-json-reordered.json',
              relativePath: 'invalid-nested-duplicate-json-reordered.json',
            },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              sidecarKey: 'event_code',
              tag: '(White, (((Purple, Black), Blue, Orange)),  Green)',
            }),
            {
              path: 'invalid-nested-duplicate-json-reordered.json',
              relativePath: 'invalid-nested-duplicate-json-reordered.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, ((Blue, Orange, (Black, Purple))), White)' }),
            {
              path: 'invalid-nested-duplicate-json-reordered.tsv',
              relativePath: 'invalid-nested-duplicate-json-reordered.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(White, (((Purple, Black), Blue, Orange)),  Green)' }),
            {
              path: 'invalid-nested-duplicate-json-reordered.tsv',
              relativePath: 'invalid-nested-duplicate-json-reordered.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-nested-duplicate-combo-reordered',
        explanation: 'Deeply nested duplicates reordered',
        schemaVersion: '8.3.0',
        sidecar: {
          event_code: {
            HED: {
              ball: '(Green, ((Blue, Orange, (Black, Purple))), White), Blue, Orange',
            },
          },
        },
        eventsString:
          'onset\tduration\tevent_code\tHED\n' + '19\t6\tball\t(White, (((Purple, Black), Blue, Orange)),  Green)\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(Green, ((Blue, Orange, (Black, Purple))), White)' }),
            {
              path: 'invalid-nested-duplicate-combo-reordered.tsv',
              relativePath: 'invalid-nested-duplicate-combo-reordered.tsv',
            },
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', { tag: '(White, (((Purple, Black), Blue, Orange)),  Green)' }),
            {
              path: 'invalid-nested-duplicate-combo-reordered.tsv',
              relativePath: 'invalid-nested-duplicate-combo-reordered.tsv',
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
      {
        testname: 'invalid-multiple-placeholders-in-value-column',
        explanation: 'The sidecar has a value column with no placeholder tag',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Label/#, Speed/# mph',
          },
        },
        eventsString: 'onset\tduration\tvehicle\tspeed\n' + '19\t6\ttrain\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('invalidPlaceholder', { sidecarKey: 'speed', tag: 'Label/#' }), {
            path: 'invalid-multiple-placeholders-in-value-column.json',
            relativePath: 'invalid-multiple-placeholders-in-value-column.json',
          }),
          BidsHedIssue.fromHedIssue(generateIssue('invalidPlaceholder', { sidecarKey: 'speed', tag: 'Speed/# mph' }), {
            path: 'invalid-multiple-placeholders-in-value-column.json',
            relativePath: 'invalid-multiple-placeholders-in-value-column.json',
          }),
        ],
        tsvErrors: [],
        comboErrors: [],
      },
    ],
  },
  {
    name: 'unit-tests',
    description: 'Various unit tests (limited for now)',
    tests: [
      {
        testname: 'valid-units-on-a-placeholder',
        explanation: 'The sidecar has invalid units on a placeholder',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph',
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'wrong-units-on-a-placeholder',
        explanation: 'The sidecar has wrong units on a placeholder',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# Hz',
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('unitClassInvalidUnit', {
              tag: 'Speed/# Hz',
            }),
            {
              path: 'wrong-units-on-a-placeholder.json',
              relativePath: 'wrong-units-on-a-placeholder.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(generateIssue('unitClassInvalidUnit', { tag: 'Speed/# Hz' }), {
            path: 'wrong-units-on-a-placeholder.tsv',
            relativePath: 'wrong-units-on-a-placeholder.tsv',
          }),
        ],
      },
    ],
  },
  {
    name: 'definition-tests',
    description: 'Various definition tests (limited for now)',
    tests: [
      {
        testname: 'valid-definition-no-placeholder',
        explanation: 'Simple definition in sidecar',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/TrainDef',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/TrainDef, (Train))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-definition-with-placeholder',
        explanation: 'Definition in sidecar has a placeholder',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/GreenDef/0.5',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/GreenDef/#, (RGB-green/#, Triangle))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-definition-with-nested-placeholder',
        explanation: 'Definition in sidecar has nested placeholder',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/GreenDef/0.5',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/GreenDef/#, (Red,(RGB-green/#, Triangle)))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'valid-definition-no-group',
        explanation: 'The sidecar with definition that has no internal group.',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/BlueDef',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/BlueDef)',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'invalid-missing-definition-for-def',
        explanation: 'The sidecar uses a def with no definition',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/MissingDef',
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('missingDefinition', { definition: 'MissingDef' }),
            {
              path: 'invalid-missing-definition-for-def.tsv',
              relativePath: 'invalid-missing-definition-for-def.tsv',
            },
            { tsvLine: 2 },
          ),
        ],
      },
      {
        testname: 'invalid-nested-definition',
        explanation: 'The sidecar has a definition inside a definition',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/NestedDef',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/NestedDef, (Definition/Junk, (Blue)))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Definition/Junk',
              string: '(Definition/NestedDef, (Definition/Junk, (Blue)))',
            }),
            {
              path: 'invalid-nested-definition.json',
              relativePath: 'invalid-nested-definition.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTopLevelTagGroupTag', {
              tag: 'Definition/Junk',
              string: '(Definition/NestedDef, (Definition/Junk, (Blue)))',
            }),
            {
              path: 'invalid-nested-definition.tsv',
              relativePath: 'invalid-nested-definition.tsv',
            },
          ),
        ],
      },
      {
        testname: 'invalid-multiple-definition-tags',
        explanation: 'The sidecar has multiple definition tags in same definition',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/Apple',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/Apple, Definition/Banana, (Blue))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTagGroup', {
              tags: 'Definition/Apple, Definition/Banana',
              string: '(Definition/Apple, Definition/Banana, (Blue))',
            }),
            {
              path: 'invalid-multiple-definition-tags.json',
              relativePath: 'invalid-multiple-definition-tags.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTagGroup', {
              tags: 'Definition/Apple, Definition/Banana',
              string: '(Definition/Apple, Definition/Banana, (Blue))',
            }),
            {
              path: 'invalid-multiple-definition-tags.tsv',
              relativePath: 'invalid-multiple-definition-tags.tsv',
            },
          ),
        ],
      },
      {
        testname: 'invalid-definition-with-extra-groups',
        explanation: 'The sidecar has a definition with extra internal group',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/ExtraGroupDef',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/ExtraGroupDef, (Red), (Blue))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTagGroup', {
              tags: 'Definition/ExtraGroupDef',
              string: '(Definition/ExtraGroupDef, (Red), (Blue))',
            }),
            {
              path: 'invalid-definition-with-extra-groups.json',
              relativePath: 'invalid-definition-with-extra-groups.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTagGroup', {
              tags: 'Definition/ExtraGroupDef',
              string: '(Definition/ExtraGroupDef, (Red), (Blue))',
            }),
            {
              path: 'invalid-definition-with-extra-groups.tsv',
              relativePath: 'invalid-definition-with-extra-groups.tsv',
            },
          ),
        ],
      },
      {
        testname: 'invalid-definition-with-extra-sibling',
        explanation: 'The sidecar has a definition with an extra internal sibling',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph, Def/ExtraSiblingDef',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/ExtraSiblingDef, Red, (Blue))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTagGroup', {
              string: '(Definition/ExtraSiblingDef, Red, (Blue))',
              tags: 'Definition/ExtraSiblingDef, Red',
            }),
            {
              path: 'invalid-definition-with-extra-sibling.json',
              relativePath: 'invalid-definition-with-extra-sibling.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTagGroup', {
              string: '(Definition/ExtraSiblingDef, Red, (Blue))',
              tags: 'Definition/ExtraSiblingDef, Red',
            }),
            {
              path: 'invalid-definition-with-extra-sibling.tsv',
              relativePath: 'invalid-definition-with-extra-sibling.tsv',
            },
          ),
        ],
      },
      {
        testname: 'invalid-definition-in-HED-column',
        explanation: 'The tsv has a definition in HED column',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Speed/# mph',
          },
        },
        eventsString: 'onset\tduration\tspeed\tHED\n' + '19\t6\t5\t(Definition/TsvDef)\n',
        sidecarErrors: [],
        tsvErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionContext', { string: '(Definition/TsvDef)', tsvLine: '2' }),
            { path: 'invalid-definition-in-HED-column.tsv', relativePath: 'invalid-definition-in-HED-column.tsv' },
          ),
        ],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionContext', { string: '(Definition/TsvDef)', tsvLine: '2' }),
            { path: 'invalid-definition-in-HED-column.tsv', relativePath: 'invalid-definition-in-HED-column.tsv' },
          ),
        ],
      },
      {
        testname: 'invalid-definition-with-missing-placeholder',
        explanation: 'Definition in sidecar has missing placeholder',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Def/MySpeed/#',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/MySpeed/#, (Speed, Red))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholderInDefinition', { definition: 'MySpeed', sidecarKey: 'mydefs' }),
            {
              path: 'invalid-definition-with-missing-placeholder.json',
              relativePath: 'invalid-definition-with-missing-placeholder.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'invalid-definition-with-fixed-placeholder',
        explanation: 'Definition in sidecar has a fixed value instead of placeholder',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Def/GreenDef/Test',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/GreenDef/Test, (Red, Triangle))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('missingPlaceholder', { sidecarKey: 'speed', string: 'Def/GreenDef/Test' }),
            {
              path: 'invalid-definition-with-fixed-placeholder.json',
              relativePath: 'invalid-definition-with-fixed-placeholder.json',
            },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholderInDefinition', { definition: 'GreenDef', sidecarKey: 'mydefs' }),
            {
              path: 'invalid-definition-with-fixed-placeholder.json',
              relativePath: 'invalid-definition-with-fixed-placeholder.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'invalid-definition-has-multiple-placeholders',
        explanation: 'Definition in sidecar has multiple placeholders',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Def/SpeedDef/#',
          },
          mydefs: {
            HED: {
              deflist: '(Definition/SpeedDef/#, (Speed/# mph, (Label/#, Red, Triangle)))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholderInDefinition', { definition: 'SpeedDef', sidecarKey: 'mydefs' }),
            {
              path: 'invalid-definition-has-multiple-placeholders.json',
              relativePath: 'invalid-definition-has-multiple-placeholders.json',
            },
          ),
        ],
        tsvErrors: [],
        comboErrors: [],
      },
      {
        testname: 'invalid-definition-not-isolated',
        explanation: 'Definition in sidecar appears with other tags',
        schemaVersion: '8.3.0',
        sidecar: {
          speed: {
            HED: 'Def/SpeedDef/#',
          },
          mydefs: {
            HED: {
              deflist: 'Red, (Definition/SpeedDef/#, (Speed/# mph))',
            },
          },
        },
        eventsString: 'onset\tduration\tspeed\n' + '19\t6\t5\n',
        sidecarErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalInExclusiveContext', {
              tag: 'Definition/SpeedDef/#',
              string: 'Red, (Definition/SpeedDef/#, (Speed/# mph))',
            }),
            { path: 'invalid-definition-not-isolated.json', relativePath: 'invalid-definition-not-isolated.json' },
          ),
        ],
        tsvErrors: [],
        comboErrors: [
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalInExclusiveContext', {
              tag: 'Definition/SpeedDef/#',
              string: 'Red, (Definition/SpeedDef/#, (Speed/# mph))',
            }),
            { path: 'invalid-definition-not-isolated.tsv', relativePath: 'invalid-definition-not-isolated.tsv' },
          ),
        ],
      },
    ],
  },
]

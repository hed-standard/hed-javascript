import { BidsHedIssue } from '../bids'
import { generateIssue } from '../common/issues/issues'

export const bidsTestData = [
  // {
  //   name: 'valid-bids-datasets',
  //   description: 'Who knows',
  //   tests: [
  //     {
  //       name: 'no-hed-at-all',
  //       explanation: 'Neither the sidecar or tsv has HED',
  //       schemaVersion: '8.3.0',
  //       sidecar: {
  //         duration: {
  //           description: 'Duration of the event in seconds.',
  //         },
  //       },
  //       eventsString: 'onset\tduration\n' + '7\t4',
  //       sidecarOnlyErrors: [],
  //       eventsOnlyErrors: [],
  //       comboErrors: []
  //     },
  //     {
  //       name: 'only-header-in-tsv',
  //       explanation: 'TSV only has header and some extra white space',
  //       schemaVersion: '8.3.0',
  //       sidecar: {
  //         duration: {
  //           description: 'Duration of the event in seconds.',
  //         },
  //       },
  //       eventsString: 'onset\tduration\n',
  //       sidecarOnlyErrors: [],
  //       eventsOnlyErrors: [],
  //       comboErrors: []
  //     },
  //   ]
  // },
  {
    name: 'invalid-bids-datasets',
    description: 'Who knows this',
    tests: [
      {
        name: 'valid-sidecar-bad-tag-tsv',
        explanation: 'Valid-sidecar, but invalid tsv',
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
            { relativePath: 'valid-sidecar-bad-tag-tsv.tsv' },
            { tsvLine: 2 },
          ),
        ],
      },
    ],
  },
]

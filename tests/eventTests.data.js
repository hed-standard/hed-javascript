import { BidsHedIssue } from '../bids'
import { generateIssue } from '../common/issues/issues'

export const eventTestData = [
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
    ],
  },
]

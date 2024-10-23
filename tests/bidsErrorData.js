import { BidsHedIssue } from '../bids'
import { generateIssue } from '../common/issues/issues'

export const errorBidsTests = [
  {
    name: 'invalid-bids-datasets',
    description: 'Who knows',
    warning: false,
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
        sidecarValid: true,
        sidecarErrors: [],
        eventsString: 'onset\tduration\tHED\n' + '7\t4\tBaloney',
        eventsValid: false,
        eventsErrors: [BidsHedIssue.fromHedIssue(generateIssue('invalidTag', {}), 'valid-sidecar-invalid-tsv.tsv')],
        comboValid: false,
      },
    ],
  },
]

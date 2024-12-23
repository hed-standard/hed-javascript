import { generateIssue } from '../../common/issues/issues'

export const splitterTestData = [
  {
    name: 'valid-strings',
    description: '',
    tests: [
      {
        testname: 'no-groups',
        explanation: '"Event, Item" has no groups',
        schemaVersion: '8.3.0',
        stringIn: 'Event, Item',
        allGroupTagCount: 0,
        allSubgroupCount: [],
        fullCheck: true,
        errors: [],
        warnings: [],
      },
      {
        testname: 'multiple-nested-groups',
        explanation: '"Event, (Item, Red, (Blue, (Green))), (Item, Blue)" is a single level tag',
        schemaVersion: '8.3.0',
        stringIn: 'Event, (Item, Red, (Blue, (Green))), (Item, Blue)',
        allGroupTagCount: [4, 2],
        allSubgroupCount: 2,
      },
      {
        testname: 'single-multiple-nested-groups',
        explanation: '"(((Event, (Item, Red, (Blue, (Green))), (Item, Blue))))" is a single multiple nested group',
        schemaVersion: '8.3.0',
        stringIn: '(((Event, (Item, Red, (Blue, (Green))), (Item, Blue))))',
        allGroupTagCount: [7],
        allSubgroupCount: 1,
      },
    ],
  },
]

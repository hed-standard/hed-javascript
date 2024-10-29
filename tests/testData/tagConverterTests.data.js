import { BidsHedIssue } from '../../bids'
import { generateIssue } from '../../common/issues/issues'
import { ColumnSpliceSpec, TagSpec } from '../../parser/tokenizer'
import { SchemaTag } from '../../validator/schema/types.js'

export const tagConverterTestData = [
  // Tests conversion of TagSpec to schema tag
  {
    name: 'simple-tag-spec',
    description: 'Simple tag specifications',
    tests: [
      {
        testname: 'simple-tag',
        explanation: 'Neither the sidecar or tsv has HED but neither non-empty',
        schemaVersion: '8.3.0',
        string: 'Event',
        tagSpec: new TagSpec('Event', 0, 5, ''),
        longName: 'Event',
        parentTag: null,
        remainder: '',
        errors: [],
      },
    ],
  },
]

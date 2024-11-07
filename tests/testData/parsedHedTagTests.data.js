import { generateIssue } from '../../common/issues/issues'
import { ColumnSpliceSpec, GroupSpec, TagSpec } from '../../parser/tokenizer'

export const parsedHedTagTests = [
  {
    name: 'valid-tags',
    description: 'Valid placeholders in various places',
    warning: false,
    tests: [
      {
        testname: 'valid-tag-one-level',
        explanation: '"Item" is a top-level-tag.',
        schemaVersion: '8.3.0',
        fullString: 'Item',
        tagSpec: new TagSpec('Item', 0, 5, ''),
        tagLong: 'Item',
        tagShort: 'Item',
        formattedTag: 'item',
        errors: [],
      },
      {
        testname: 'valid-tag-with-blanks',
        explanation: '" Item " has surrounding blanks.',
        schemaVersion: '8.3.0',
        fullString: ' Item ',
        tagSpec: new TagSpec('Item', 1, 6, ''),
        tagLong: 'Item',
        tagShort: 'Item',
        formattedTag: 'item',
        errors: [],
      },
      {
        testname: 'valid-tag-with-blanks',
        explanation: '" Item " has surrounding blanks.',
        schemaVersion: '8.3.0',
        fullString: ' Item ',
        tagSpec: new TagSpec('Item', 1, 6, ''),
        tagLong: 'Item',
        tagShort: 'Item',
        formattedTag: 'item',
        errors: [],
      },
    ],
  },
]

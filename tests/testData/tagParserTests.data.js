import { generateIssue } from '../../common/issues/issues'
import { ColumnSpliceSpec, GroupSpec, TagSpec } from '../../parser/tokenizer'

export const parsedHedTagTests = [
  {
    name: 'valid-tags',
    description: 'Valid tags with extensions',
    warning: false,
    tests: [
      {
        testname: 'valid-tag-one-level',
        explanation: '"Item" is a top-level-tag.',
        schemaVersion: '8.3.0',
        fullString: 'Item',
        tagSpec: new TagSpec('Item', 0, 4, ''),
        tagLong: 'Item',
        tagShort: 'Item',
        formattedTag: 'item',
        canonicalTag: 'Item',
        takesValue: false,
        error: null,
      },
      {
        testname: 'valid-tag-with-blanks',
        explanation: '" Item " has surrounding blanks.',
        schemaVersion: '8.3.0',
        fullString: ' Item ',
        tagSpec: new TagSpec('Item', 1, 5, ''),
        tagLong: 'Item',
        tagShort: 'Item',
        formattedTag: 'item',
        canonicalTag: 'Item',
        takesValue: false,
        error: null,
      },
      {
        testname: 'valid-Two-level-tag',
        explanation: '" Item/object " is two-level and mixed case.',
        schemaVersion: '8.3.0',
        fullString: ' Item/object ',
        tagSpec: new TagSpec('Item/object', 1, 12, ''),
        tagLong: 'Item/Object',
        tagShort: 'Object',
        formattedTag: 'item/object',
        canonicalTag: 'Item/Object',
        takesValue: false,
        error: null,
      },
      {
        testname: 'valid-tag-with-extension',
        explanation: '" Object/blech " is two-level and mixed case.',
        schemaVersion: '8.3.0',
        fullString: ' Object/blech ',
        tagSpec: new TagSpec('object/Blech', 1, 13, ''),
        tagLong: 'Item/Object/Blech',
        tagShort: 'Object/Blech',
        formattedTag: 'item/object/blech',
        canonicalTag: 'Item/Object/Blech',
        takesValue: false,
        error: null,
      },
      {
        testname: 'valid-tag-with-value-no-units',
        explanation: '" Age/5 " has a value but no units.',
        schemaVersion: '8.3.0',
        fullString: ' Age/5 ',
        tagSpec: new TagSpec(' Age/5 ', 1, 6, ''),
        tagLong: 'Property/Agent-property/Agent-trait/Age/5',
        tagShort: 'Age/5',
        formattedTag: 'property/agent-property/agent-trait/age/5',
        canonicalTag: 'Property/Agent-property/Agent-trait/Age/5',
        takesValue: true,
        error: null,
      },
      {
        testname: 'valid-tag-with-value-and-units',
        explanation: '" Length/3 m " has a value and valid units.',
        schemaVersion: '8.3.0',
        fullString: ' Length/3 m ',
        tagSpec: new TagSpec(' Length/3 m ', 1, 11, ''),
        tagLong: 'Property/Data-property/Data-value/Spatiotemporal-value/Spatial-value/Size/Length/3 m',
        tagShort: 'Length/3 m',
        formattedTag: 'property/data-property/data-value/spatiotemporal-value/spatial-value/size/length/3 m',
        canonicalTag: 'Property/Data-property/Data-value/Spatiotemporal-value/Spatial-value/Size/Length/3 m',
        takesValue: true,
        error: null,
      },
      {
        testname: 'valid-value-tag-with-placeholder',
        explanation: '" Label/# " is a valid tag with placeholder.',
        schemaVersion: '8.3.0',
        fullString: ' Label/# ',
        tagSpec: new TagSpec(' Label/# ', 1, 8, ''),
        tagLong: 'Property/Informational-property/Label/#',
        tagShort: 'Label/#',
        formattedTag: 'property/informational-property/label/#',
        canonicalTag: 'Property/Informational-property/Label/#',
        takesValue: true,
        error: null,
      },
    ],
  },
  {
    name: 'invalid-tags',
    description: 'Various invalid tags',
    warning: false,
    tests: [
      {
        testname: 'invalid-top-level-tag',
        explanation: '"Blech" is not a valid tag.',
        schemaVersion: '8.3.0',
        fullString: 'Blech',
        tagSpec: new TagSpec('Blech', 0, 6, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('invalidTag', { tag: 'Blech' }),
      },
      {
        testname: 'invalid-tag-requires-child',
        explanation: '"Duration" should have a child.',
        schemaVersion: '8.3.0',
        fullString: 'Duration',
        tagSpec: new TagSpec('Duration', 0, 8, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: true,
        error: generateIssue('childRequired', { tag: 'Duration' }),
      },
      {
        //TODO: Special tag Event-context is unique and doesn't allow extension although parent does
        testname: 'invalid-tag-does-not-allow-extension',
        explanation: '"Sensory-event/Blech" should not have a child no recursive-extension allowed.',
        schemaVersion: '8.3.0',
        fullString: 'Duration',
        tagSpec: new TagSpec('Sensory-event/Blech', 0, 19, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: true,
        error: generateIssue('invalidExtension', { parentTag: 'Sensory-event', tag: 'Blech' }),
      },
      {
        testname: 'invalid-tag-with-blank-in-extension',
        explanation: '" Object/blec h " has a blank in the tag extension',
        schemaVersion: '8.3.0',
        fullString: ' Object/blec h ',
        tagSpec: new TagSpec(' Object/blec h ', 1, 14, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('invalidExtension', { parentTag: 'Object', tag: 'blec h' }),
      },
      {
        testname: 'invalid-tag-should-not-have-a-placeholder',
        explanation: '"object/#" should not have a placeholder.',
        schemaVersion: '8.3.0',
        fullString: 'object/#',
        tagSpec: new TagSpec('object/#', 0, 8, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('invalidExtension', { parentTag: 'object', tag: '#' }),
      },
      {
        testname: 'invalid-tag-bad-parent',
        explanation: '"object/property/Red" -- property is not a child of object.',
        schemaVersion: '8.3.0',
        fullString: 'object/property/Red',
        tagSpec: new TagSpec('object/property/Red', 0, 19, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('invalidParentNode', { parentTag: 'object', tag: 'property' }),
      },
      {
        testname: 'invalid-tag-bad-parent-after extension',
        explanation: '"object/Junk/baloney/Red" -- Red is not a child of baloney.',
        schemaVersion: '8.3.0',
        fullString: 'object/Junk/baloney/Red',
        tagSpec: new TagSpec('object/Junk/baloney/Red', 0, 22, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('invalidParentNode', { parentTag: 'object/Junk/baloney', tag: 'Red' }),
      },
      {
        testname: 'invalid-tag-bad-unit-class',
        explanation: '"Length/2 s" has wrong unit class.',
        schemaVersion: '8.3.0',
        fullString: 'Length/2 s',
        tagSpec: new TagSpec('Length/2 s', 0, 10, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Length/2 s' }),
      },
      {
        testname: 'invalid-tag-bad-unit-plural',
        explanation: '"Frequency/3 hertzs" is not the plural of hertz.',
        schemaVersion: '8.3.0',
        fullString: 'Frequency/3 hertzs',
        tagSpec: new TagSpec('Frequency/3 hertzs', 0, 18, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Frequency/3 hertzs' }),
      },
      {
        testname: 'invalid-tag-incorrect-unit-symbol-caps',
        explanation: '"Frequency/3 hz" has unit symbol not correctly capitalized.',
        schemaVersion: '8.3.0',
        fullString: 'Frequency/3 hz',
        tagSpec: new TagSpec('Frequency/3 hz', 0, 14, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Frequency/3 hz' }),
      },
      {
        testname: 'invalid-tag-incorrect-unit-modifier caps',
        explanation: '"Frequency/3 KHz" has unit modifier not correctly capitalized.',
        schemaVersion: '8.3.0',
        fullString: 'Frequency/3 KHz',
        tagSpec: new TagSpec('Frequency/3 KHz', 0, 15, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Frequency/3 KHz' }),
      },
      {
        testname: 'invalid-tag-non-SI-unit-modified',
        explanation: '"Time-value/1 millihour" has a non-SI unit with unit modifier.',
        schemaVersion: '8.3.0',
        fullString: 'Time-value/1 millihour',
        tagSpec: new TagSpec('Time-value/1 millihour', 0, 22, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Time-value/1 millihour' }),
      },
      {
        testname: 'invalid-tag-bad-unit-symbol-modifier',
        explanation: '"Speed/100 Mkph" has a bad unit symbol.',
        schemaVersion: '8.3.0',
        fullString: 'Speed/100 Mkph',
        tagSpec: new TagSpec('Speed/100 Mkph', 0, 14, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Speed/100 Mkph' }),
      },
      {
        testname: 'invalid-tag-bad-units-double-blank',
        explanation: '"Length/5  m" has a double blank.',
        schemaVersion: '8.3.0',
        fullString: 'Length/5  m',
        tagSpec: new TagSpec('Length/5  m', 0, 11, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Length/5  m' }),
      },
      {
        testname: 'invalid-tag-bad-unit-capitalization',
        explanation: '"Time-value/5 Milliseconds" is not a valid unit.',
        schemaVersion: '8.3.0',
        fullString: 'Time-value/5 Milliseconds',
        tagSpec: new TagSpec('Length/2 s', 0, 25, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('unitClassInvalidUnit', { tag: 'Length/2 s' }),
      },
      {
        testname: 'invalid-tag-value-no-units',
        explanation: '"Label/Blec h" does not have a valid value.',
        schemaVersion: '8.3.0',
        fullString: 'Label/Blec h',
        tagSpec: new TagSpec('Label/Blec h', 0, 12, ''),
        tagLong: undefined,
        tagShort: undefined,
        formattedTag: undefined,
        canonicalTag: undefined,
        takesValue: false,
        error: generateIssue('invalidValue', { tag: 'Label/Blec h' }),
      },
    ],
  },
]

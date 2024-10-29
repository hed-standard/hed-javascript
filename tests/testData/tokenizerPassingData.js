//import { TagSpec, GroupSpec, ColumnSpliceSpec } from '../parser/tokenizerNew'
import { TagSpec, GroupSpec, ColumnSpliceSpec } from '../../parser/tokenizer'

export const passingTests = [
  {
    name: 'valid-single-tags',
    description: 'Single tags with no groups.',
    warning: false,
    tests: [
      {
        testname: 'simple-tag-no-blanks',
        string: 'xy',
        explanation: 'Should have bounds 0, 2',
        tagSpecs: [new TagSpec('xy', 0, 2, '')],
        groupSpec: new GroupSpec(0, 2, []),
      },
      {
        testname: 'internal-blank',
        string: 'x y',
        explanation: 'Can have internal blank',
        tagSpecs: [new TagSpec('x y', 0, 3, '')],
        groupSpec: new GroupSpec(0, 3, []),
      },
      {
        testname: 'extra-blanks-simple',
        string: ' xy  ',
        explanation: 'Can have extra blanks',
        tagSpecs: [new TagSpec('xy', 1, 3, '')],
        groupSpec: new GroupSpec(0, 5, []),
      },
      {
        testname: 'tag-with-slashes',
        string: 'x/y/z',
        explanation: 'Can have multiple slashes',
        tagSpecs: [new TagSpec('x/y/z', 0, 5, '')],
        groupSpec: new GroupSpec(0, 5, []),
      },
      {
        testname: 'tag-in-column-spec',
        string: '{xy}',
        explanation: 'Single column spec',
        tagSpecs: [new ColumnSpliceSpec('xy', 0, 3, '')],
        groupSpec: new GroupSpec(0, 4, []),
      },
      {
        testname: 'tag-in-column-spec-multiple-blanks',
        string: '  { xy  } ',
        explanation: 'Single column spec with multiple blanks',
        tagSpecs: [new ColumnSpliceSpec('xy', 2, 8, '')],
        groupSpec: new GroupSpec(0, 10, []),
      },
      {
        testname: 'tag-with-colons-no-blanks',
        string: 'xy:wz',
        explanation: 'Tag with a single colon and no blanks',
        tagSpecs: [new TagSpec('wz', 3, 5, 'xy')],
        groupSpec: new GroupSpec(0, 5, []),
      },
      {
        testname: 'tag-with-multiple-colons',
        string: 'xy:wz x:y',
        explanation: 'Tag with one colon marking library and another as part of a value',
        tagSpecs: [new TagSpec('wz x:y', 3, 9, 'xy')],
        groupSpec: new GroupSpec(0, 9, []),
      },
      {
        testname: 'tags-with-one-value column',
        string: 'xy x:y',
        explanation: 'Tag with one colon as part of a value',
        tagSpecs: [new TagSpec('xy x:y', 0, 6, '')],
        groupSpec: new GroupSpec(0, 6, []),
      },
    ],
  },
  {
    name: 'multiple-tags-no-groups',
    description: 'multiple tags with no groups.',
    warning: false,
    tests: [
      {
        testname: 'multiple-tags',
        string: 'xy,zy,wy',
        explanation: 'Multiple tags with no blanks',
        tagSpecs: [new TagSpec('xy', 0, 2, ''), new TagSpec('zy', 3, 5, ''), new TagSpec('wy', 6, 8, '')],
        groupSpec: new GroupSpec(0, 8, []),
      },
      {
        testname: 'multiple-tags-with-blanks',
        string: ' xy,  zy , wy  ',
        explanation: 'Can have extra blanks',
        tagSpecs: [new TagSpec('xy', 1, 3, ''), new TagSpec('zy', 6, 8, ''), new TagSpec('wy', 11, 13, '')],
        groupSpec: new GroupSpec(0, 15, []),
      },
      {
        testname: 'multiple-tags-with-blanks',
        string: ' xy,  zy , wy  ',
        explanation: 'Can have extra blanks',
        tagSpecs: [new TagSpec('xy', 1, 3, ''), new TagSpec('zy', 6, 8, ''), new TagSpec('wy', 11, 13, '')],
        groupSpec: new GroupSpec(0, 15, []),
      },
    ],
  },
  {
    name: 'un-nested-groups',
    description: 'Groups with no nesting',
    warning: false,
    tests: [
      {
        testname: 'single-non-empty-group-no-blanks',
        string: '(xy)',
        explanation: 'Single group',
        tagSpecs: [[new TagSpec('xy', 1, 3, '')]],
        groupSpec: new GroupSpec(0, 4, [new GroupSpec(0, 4, [])]),
      },
      {
        testname: 'tag-after-group',
        string: '(x), p',
        explanation: 'A tag after a group.',
        tagSpecs: [[new TagSpec('x', 1, 2, '')], new TagSpec('p', 5, 6, '')],
        groupSpec: new GroupSpec(0, 6, [new GroupSpec(0, 3, [])]),
      },
      {
        testname: 'multiple-tags-in-group',
        string: '(x,y)',
        explanation: 'Multiple tags in one group.',
        tagSpecs: [[new TagSpec('x', 1, 2, ''), new TagSpec('y', 3, 4, '')]],
        groupSpec: new GroupSpec(0, 5, [new GroupSpec(0, 5, [])]),
      },
      {
        testname: 'multiple-unnested-groups',
        string: 'q, (xy), (zw, uv), p',
        explanation: 'Multiple unnested tag groups and tags.',
        tagSpecs: [
          new TagSpec('q', 0, 1, ''),
          [new TagSpec('xy', 4, 6, '')],
          [new TagSpec('zw', 10, 12, ''), new TagSpec('uv', 14, 16, '')],
          new TagSpec('p', 19, 20, ''),
        ],
        groupSpec: new GroupSpec(0, 20, [new GroupSpec(3, 7, []), new GroupSpec(9, 17, [])]),
      },
      {
        testname: 'tag-after-group',
        string: 'x/y,(r,v)',
        explanation: 'A tag after a group.',
        tagSpecs: [new TagSpec('x/y', 0, 3, ''), [new TagSpec('r', 5, 6, ''), new TagSpec('v', 7, 8, '')]],
        groupSpec: new GroupSpec(0, 9, [new GroupSpec(4, 9, [])]),
      },
    ],
  },
  {
    name: 'Nested groups',
    description: 'Nested groups with complex nesting',
    warning: false,
    tests: [
      {
        testname: 'Single-multi-nested-group',
        string: '(((xy)))',
        explanation: 'Single group with deep nesting',
        tagSpecs: [[[[new TagSpec('xy', 3, 5, '')]]]],
        groupSpec: new GroupSpec(0, 8, [new GroupSpec(0, 8, [new GroupSpec(1, 7, [new GroupSpec(2, 6, [])])])]),
      },
      {
        testname: 'Single-nested-group-with-trailing-tag',
        string: '((xy)), g',
        explanation: 'Nested group with trailing tag',
        tagSpecs: [[[new TagSpec('xy', 2, 4, '')]], new TagSpec('g', 8, 9, '')],
        groupSpec: new GroupSpec(0, 9, [new GroupSpec(0, 6, [new GroupSpec(1, 5, [])])]),
      },
      {
        testname: 'Single-nested-group-with-leading-tag',
        string: ' g, ((xy))',
        explanation: 'Nested group with trailing tag',
        tagSpecs: [new TagSpec('g', 1, 2, ''), [[new TagSpec('xy', 6, 8, '')]]],
        groupSpec: new GroupSpec(0, 10, [new GroupSpec(4, 10, [new GroupSpec(5, 9, [])])]),
      },
      {
        testname: 'Single-nested-group-with-splice',
        string: '((({xy})))',
        explanation: 'A single nested group with a column splice.',
        tagSpecs: [[[[new ColumnSpliceSpec('xy', 3, 6)]]]],
        groupSpec: new GroupSpec(0, 10, [new GroupSpec(0, 10, [new GroupSpec(1, 9, [new GroupSpec(2, 8, [])])])]),
      },
      {
        testname: 'Complex-nested-group-1',
        string: '((xy), ( h:p, ((q, r ))))',
        explanation: 'Single deeply nested group',
        tagSpecs: [
          [
            [new TagSpec('xy', 2, 4, '')],
            [new TagSpec('p', 11, 12, 'h'), [[new TagSpec('q', 16, 17, ''), new TagSpec('r', 19, 20, '')]]],
          ],
        ],
        groupSpec: new GroupSpec(0, 25, [
          new GroupSpec(0, 25, [
            new GroupSpec(1, 5, []),
            new GroupSpec(7, 24, [new GroupSpec(14, 23, [new GroupSpec(15, 22, [])])]),
          ]),
        ]),
      },
      {
        testname: 'Complex-nested-group-2',
        string: '((xy), g), h',
        explanation: 'Nested group with trailing tag',
        tagSpecs: [[[new TagSpec('xy', 2, 4, '')], new TagSpec('g', 7, 8, '')], new TagSpec('h', 11, 12, '')],
        groupSpec: new GroupSpec(0, 12, [new GroupSpec(0, 9, [new GroupSpec(1, 5, [])])]),
      },
      {
        testname: 'Complex-nested-group-3',
        string: '((xy), ( h:p, ((q, r ))), g)',
        explanation: 'A single group with multiple nested groups and a tag',
        tagSpecs: [
          [
            [new TagSpec('xy', 2, 4, '')],
            [new TagSpec('p', 11, 12, 'h'), [[new TagSpec('q', 16, 17, ''), new TagSpec('r', 19, 20, '')]]],
            new TagSpec('g', 26, 27, ''),
          ],
        ],
        groupSpec: new GroupSpec(0, 28, [
          new GroupSpec(0, 28, [
            new GroupSpec(1, 5, []),
            new GroupSpec(7, 24, [new GroupSpec(14, 23, [new GroupSpec(15, 22, [])])]),
          ]),
        ]),
      },
      {
        name: 'Complex-nested-group-4',
        string: '((xy), ( h:p, ((q, r ))), g), h',
        explanation: 'Complex group with trailing tag',
        tagSpecs: [
          [
            [new TagSpec('xy', 2, 4, '')],
            [new TagSpec('p', 11, 12, 'h'), [[new TagSpec('q', 16, 17, ''), new TagSpec('r', 19, 20, '')]]],
            new TagSpec('g', 26, 27, ''),
          ],
          new TagSpec('h', 30, 31, ''),
        ],
        groupSpec: new GroupSpec(0, 31, [
          new GroupSpec(0, 28, [
            new GroupSpec(1, 5, []),
            new GroupSpec(7, 24, [new GroupSpec(14, 23, [new GroupSpec(15, 22, [])])]),
          ]),
        ]),
      },
    ],
  },
]

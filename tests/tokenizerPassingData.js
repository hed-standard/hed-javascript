//import { TagSpec, GroupSpec, ColumnSpliceSpec } from '../parser/tokenizerNew'
import { TagSpec, GroupSpec, ColumnSpliceSpec } from '../parser/tokenizer'

export const passingTests = [
  {
    name: 'valid-single-tags',
    description: 'Single tags with no groups.',
    warning: false,
    tests: [
      {
        name: 'simple-tag-no-blanks',
        string: 'xy',
        explanation: 'Should have bounds 0, 2',
        tagSpecs: [new TagSpec('xy', 0, 2, '')],
        groupSpec: new GroupSpec(0, 2, []),
      },
      {
        name: 'internal-blank',
        string: 'x y',
        explanation: 'Can have internal blank',
        tagSpecs: [new TagSpec('x y', 0, 3, '')],
        groupSpec: new GroupSpec(0, 3, []),
      },
      {
        name: 'extra-blanks-simple',
        string: ' xy  ',
        explanation: 'Can have extra blanks',
        tagSpecs: [new TagSpec('xy', 1, 3, '')],
        groupSpec: new GroupSpec(0, 5, []),
      },
      {
        name: 'tag-with-slashes',
        string: 'x/y/z',
        explanation: 'Can have multiple slashes',
        tagSpecs: [new TagSpec('x/y/z', 0, 5, '')],
        groupSpec: new GroupSpec(0, 5, []),
      },
    ],
  },
  {
    name: 'valid-tags-no-groups',
    description: 'multiple tags with no groups.',
    warning: false,
    tests: [
      {
        name: 'multiple-tags',
        string: 'xy,zy,wy',
        explanation: 'Multiple tags with no blanks',
        tagSpecs: [new TagSpec('xy', 0, 2, ''), new TagSpec('zy', 3, 5, ''), new TagSpec('wy', 6, 8, '')],
        groupSpec: new GroupSpec(0, 8, []),
      },
      {
        name: 'multiple-tags-with-blanks',
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
        name: 'single-non-empty-group-no-blanks',
        string: '(xy)',
        explanation: 'Single group',
        tagSpecs: [[new TagSpec('xy', 1, 3, '')]],
        groupSpec: new GroupSpec(0, 4, [new GroupSpec(0, 4, [])]),
      },
      {
        name: 'tag-after-group',
        string: '(x), p',
        explanation: 'A tag after a group.',
        tagSpecs: [[new TagSpec('x', 1, 2, '')], new TagSpec('p', 5, 6, '')],
        groupSpec: new GroupSpec(0, 6, [new GroupSpec(0, 3, [])]),
      },
      {
        name: 'multiple-tags-in-group',
        string: '(x,y)',
        explanation: 'Multiple tags in one group.',
        tagSpecs: [[new TagSpec('x', 1, 2, '')], new TagSpec('y', 3, 4, '')],
        groupSpec: new GroupSpec(0, 5, [new GroupSpec(0, 5, [])]),
      },
      // {
      //   name: 'multiple-unnested-groups',
      //   string: 'q, (xy), (zw, uv), p',
      //   explanation: 'Multiple unnested tag groups and tags.',
      //   tagSpecs: [new TagSpec('q', 0, 1, ''),
      //     [new TagSpec('xy', 4, 6, '')],
      //     [new TagSpec('zw', 10, 12, ''),
      //       new TagSpec('uv', 14, 16, '')],
      //     new TagSpec('p', 19, 20, '')],
      //   groupSpec: new GroupSpec(0, 20,
      //     [new GroupSpec(3, 7, []),
      //              new GroupSpec(9, 17, [])])
      // },
      {
        name: 'tag-after-group',
        string: 'x/y,(r,v)',
        explanation: 'A tag after a group.',
        tagSpecs: [[new TagSpec('x', 1, 2, '')], new TagSpec('p', 5, 6, '')],
        groupSpec: new GroupSpec(0, 6, [new GroupSpec(0, 3, [])]),
      },
    ],
  },
]

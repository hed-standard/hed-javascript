import { TagSpec, GroupSpec, ColumnSpliceSpec } from '../parser/tokenizerNew'

export const passingTests = [
  {
    name: 'valid-single-tags',
    description: 'Single tags with no groups.',
    warning: false,
    tests: [
      // {
      //   name: 'simple-tag-no-blanks',
      //   string: 'xy',
      //   explanation: 'Should have bounds 0, 2',
      //   tagSpecs: [new TagSpec("xy", 0, 2, "")],
      //   groupSpec: new GroupSpec(0, undefined)
      // },
      // {
      //   name: 'internal-blank',
      //   string: 'x y',
      //   explanation: 'Can have internal blank',
      //   tagSpecs: [new TagSpec("x y", 0, 3, "")],
      //   groupSpec: new GroupSpec(0, undefined)
      // },
      // {
      //   name: 'extra-blanks-simple',
      //   string: ' xy  ',
      //   explanation: 'Can have extra blanks',
      //   tagSpecs: [new TagSpec("xy", 1, 3, "")],
      //   groupSpec: new GroupSpec(0, undefined)
      // }
    ],
  },
  // {
  //   name: 'valid-tags-no-groups',
  //   description: 'multiple tags with no groups.',
  //   warning: false,
  //   tests: [
  //     {
  //       name: 'multiple-tags',
  //       string: 'xy,zy,wy',
  //       explanation: 'Can have extra blanks',
  //       tagSpecs: [new TagSpec("xy", 0, 2, ""),
  //                  new TagSpec("zy", 3, 5, ""),
  //                  new TagSpec("wy", 6, 8, "")
  //       ],
  //       groupSpec: new GroupSpec(0, undefined)
  //     },
  //     {
  //       name: 'multiple-tags-with-blanks',
  //       string: ' xy,  zy , wy  ',
  //       explanation: 'Can have extra blanks',
  //       tagSpecs: [new TagSpec("xy", 1, 3, ""),
  //         new TagSpec("zy", 6, 8, ""),
  //         new TagSpec("wy", 11, 13, "")
  //       ],
  //       groupSpec: new GroupSpec(0, undefined,[])
  //     },
  //   ]
  // },
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
    ],
  },
]

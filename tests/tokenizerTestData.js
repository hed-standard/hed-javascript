export const passingTests = [
  {
    name: 'valid-strings-simple',
    description: 'Simple tags and groups',
    warning: false,
    tests: [
      {
        name: 'internal-blank',
        string: 'x y',
        issueCount: 1,
        hedCode: 'TAG_EMPTY',
        code: 'emptyTagFound',
        explanation: 'Cannot end in a comma',
      },
    ],
  },
]

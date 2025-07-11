import { generateIssue } from '../../src/issues/issues'
import { ColumnSpliceSpec, GroupSpec, TagSpec } from '../../src/parser/tokenizer'

export const tokenizerTests = [
  {
    name: 'valid-single-tags',
    description: 'Single tags with no groups.',
    warning: false,
    tests: [
      {
        testname: 'simple-tag-no-blanks',
        string: 'xy',
        explanation: '"xy" a simple tag should have correct bounds',
        tagSpecs: [new TagSpec('xy', 0, 2, '')],
        groupSpec: new GroupSpec(0, 2, []),
        errors: [],
      },
      {
        testname: 'internal-blank',
        string: 'x y',
        explanation: '"x y" has an extra internal blank',
        tagSpecs: [new TagSpec('x y', 0, 3, '')],
        groupSpec: new GroupSpec(0, 3, []),
        errors: [],
      },
      {
        testname: 'extra-blanks-simple',
        string: ' xy  ',
        explanation: '" xy  " has extra surrounding blanks',
        tagSpecs: [new TagSpec('xy', 1, 3, '')],
        groupSpec: new GroupSpec(0, 5, []),
        errors: [],
      },
      {
        testname: 'tag-with-slashes',
        string: 'x/y/z',
        explanation: '"x/y/z" has multiple slashes',
        tagSpecs: [new TagSpec('x/y/z', 0, 5, '')],
        groupSpec: new GroupSpec(0, 5, []),
        errors: [],
      },
      {
        testname: 'tag-in-column-spec',
        string: '{xy}',
        explanation: '"{xy}" is a standalone column splice',
        tagSpecs: [new ColumnSpliceSpec('xy', 0, 3, '')],
        groupSpec: new GroupSpec(0, 4, []),
        errors: [],
      },
      {
        testname: 'tag-in-column-spec-multiple-blanks',
        string: '  { xy  } ',
        explanation: '"  { xy  } " is a column splice with multiple blanks',
        tagSpecs: [new ColumnSpliceSpec('xy', 2, 8, '')],
        groupSpec: new GroupSpec(0, 10, []),
        errors: [],
      },
      {
        testname: 'tag-with-colons-no-blanks',
        string: 'xy:wz',
        explanation: '"xy:wz" has a single colon and no blanks',
        tagSpecs: [new TagSpec('wz', 3, 5, 'xy')],
        groupSpec: new GroupSpec(0, 5, []),
        errors: [],
      },
      {
        testname: 'tag-with-date-time',
        string: 'Creation-date/2009-04-09T12:04:14',
        explanation: 'Creation-date/2009-04-09T12:04:14" has a date-time value',
        tagSpecs: [new TagSpec('Creation-date/2009-04-09T12:04:14', 0, 33, '')],
        groupSpec: new GroupSpec(0, 33, []),
        errors: [],
      },
      {
        testname: 'tag-with-multiple-colons',
        string: 'xy:wz x:y',
        explanation: '"xy:wz x:y" has one colon marking library and another as part of a value',
        tagSpecs: [new TagSpec('wz x:y', 3, 9, 'xy')],
        groupSpec: new GroupSpec(0, 9, []),
        errors: [],
      },
      {
        testname: 'tags-with-one-value column',
        string: 'xy x:y',
        explanation: '"xy x:y" has one colon as part of a value',
        tagSpecs: [new TagSpec('xy x:y', 0, 6, '')],
        groupSpec: new GroupSpec(0, 6, []),
        errors: [],
      },
    ],
  },
  {
    name: 'valid-multiple-tags-no-groups',
    description: 'multiple tags with no groups.',
    warning: false,
    tests: [
      {
        testname: 'multiple-tags',
        string: 'xy,zy,wy',
        explanation: '"xy,zy,wy" has multiple tags with no blanks',
        tagSpecs: [new TagSpec('xy', 0, 2, ''), new TagSpec('zy', 3, 5, ''), new TagSpec('wy', 6, 8, '')],
        groupSpec: new GroupSpec(0, 8, []),
        errors: [],
      },
      {
        testname: 'multiple-tags-with-blanks',
        string: ' xy,  zy , wy  ',
        explanation: '" xy,  zy , wy  " has extra blanks in various places',
        tagSpecs: [new TagSpec('xy', 1, 3, ''), new TagSpec('zy', 6, 8, ''), new TagSpec('wy', 11, 13, '')],
        groupSpec: new GroupSpec(0, 15, []),
        errors: [],
      },
      {
        testname: 'tags-with-blanks-around-commas',
        string: ' xy,  zy , wy  ',
        explanation: '" xy,  zy , wy  " has extra blanks around commas',
        tagSpecs: [new TagSpec('xy', 1, 3, ''), new TagSpec('zy', 6, 8, ''), new TagSpec('wy', 11, 13, '')],
        groupSpec: new GroupSpec(0, 15, []),
        errors: [],
      },
    ],
  },
  {
    name: 'valid-un-nested-groups',
    description: 'Groups with no nesting',
    warning: false,
    tests: [
      {
        testname: 'single-non-empty-group-no-blanks',
        string: '(xy)',
        explanation: '"(xy)" has a single group',
        tagSpecs: [[new TagSpec('xy', 1, 3, '')]],
        groupSpec: new GroupSpec(0, 4, [new GroupSpec(0, 4, [])]),
        errors: [],
      },
      {
        testname: 'tag-after-group',
        string: '(x), p',
        explanation: '"(x), p" has a tag after a group.',
        tagSpecs: [[new TagSpec('x', 1, 2, '')], new TagSpec('p', 5, 6, '')],
        groupSpec: new GroupSpec(0, 6, [new GroupSpec(0, 3, [])]),
        errors: [],
      },
      {
        testname: 'multiple-tags-in-group',
        string: '(x,y)',
        explanation: '"(x,y)" has multiple tags in one group.',
        tagSpecs: [[new TagSpec('x', 1, 2, ''), new TagSpec('y', 3, 4, '')]],
        groupSpec: new GroupSpec(0, 5, [new GroupSpec(0, 5, [])]),
        errors: [],
      },
      {
        testname: 'multiple-unnested-groups',
        string: 'q, (xy), (zw, uv), p',
        explanation: '"q, (xy), (zw, uv), p" has multiple unnested tag groups and tags.',
        tagSpecs: [
          new TagSpec('q', 0, 1, ''),
          [new TagSpec('xy', 4, 6, '')],
          [new TagSpec('zw', 10, 12, ''), new TagSpec('uv', 14, 16, '')],
          new TagSpec('p', 19, 20, ''),
        ],
        groupSpec: new GroupSpec(0, 20, [new GroupSpec(3, 7, []), new GroupSpec(9, 17, [])]),
        errors: [],
      },
      {
        testname: 'tag-after-group',
        string: 'x/y,(r,v)',
        explanation: '"x/y,(r,v)" has a tag after a group.',
        tagSpecs: [new TagSpec('x/y', 0, 3, ''), [new TagSpec('r', 5, 6, ''), new TagSpec('v', 7, 8, '')]],
        groupSpec: new GroupSpec(0, 9, [new GroupSpec(4, 9, [])]),
        errors: [],
      },
    ],
  },
  {
    name: 'valid-nested groups',
    description: 'Nested groups with complex nesting',
    warning: false,
    tests: [
      {
        testname: 'Single-multi-nested-group',
        string: '(((xy)))',
        explanation: '"(((xy)))" is a single group with deep nesting',
        tagSpecs: [[[[new TagSpec('xy', 3, 5, '')]]]],
        groupSpec: new GroupSpec(0, 8, [new GroupSpec(0, 8, [new GroupSpec(1, 7, [new GroupSpec(2, 6, [])])])]),
        errors: [],
      },
      {
        testname: 'Single-nested-group-with-trailing-tag',
        string: '((xy)), g',
        explanation: '"((xy)), g" is a nested group with trailing tag',
        tagSpecs: [[[new TagSpec('xy', 2, 4, '')]], new TagSpec('g', 8, 9, '')],
        groupSpec: new GroupSpec(0, 9, [new GroupSpec(0, 6, [new GroupSpec(1, 5, [])])]),
        errors: [],
      },
      {
        testname: 'Single-nested-group-with-leading-tag',
        string: ' g, ((xy))',
        explanation: '" g, ((xy))" is a nested group with trailing tag',
        tagSpecs: [new TagSpec('g', 1, 2, ''), [[new TagSpec('xy', 6, 8, '')]]],
        groupSpec: new GroupSpec(0, 10, [new GroupSpec(4, 10, [new GroupSpec(5, 9, [])])]),
        errors: [],
      },
      {
        testname: 'Single-nested-group-with-splice',
        string: '((({xy})))',
        explanation: '"((({xy})))" is a single nested group with a column splice.',
        tagSpecs: [[[[new ColumnSpliceSpec('xy', 3, 6)]]]],
        groupSpec: new GroupSpec(0, 10, [new GroupSpec(0, 10, [new GroupSpec(1, 9, [new GroupSpec(2, 8, [])])])]),
        errors: [],
      },
      {
        testname: 'Complex-nested-group-1',
        string: '((xy), ( h:p, ((q, r ))))',
        explanation: '"((xy), ( h:p, ((q, r ))))" is a single deeply nested group',
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
        errors: [],
      },
      {
        testname: 'Complex-nested-group-2',
        string: '((xy), g), h',
        explanation: '"((xy), g), h" is a nested group with trailing tag',
        tagSpecs: [[[new TagSpec('xy', 2, 4, '')], new TagSpec('g', 7, 8, '')], new TagSpec('h', 11, 12, '')],
        groupSpec: new GroupSpec(0, 12, [new GroupSpec(0, 9, [new GroupSpec(1, 5, [])])]),
        errors: [],
      },
      {
        testname: 'Complex-nested-group-3',
        string: '((xy), ( h:p, ((q, r ))), g)',
        explanation: '"((xy), ( h:p, ((q, r ))), g)" is a single group with multiple nested groups and a tag',
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
        errors: [],
      },
      {
        testname: 'Complex-nested-group-4',
        string: '((xy), ( h:p, ((q, r ))), g), h',
        explanation: '"((xy), ( h:p, ((q, r ))), g), h" is a complex group with trailing tag',
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
        errors: [],
      },
    ],
  },
  {
    name: 'valid-placeholders',
    description: 'Valid placeholders in various places',
    warning: false,
    tests: [
      {
        testname: 'Simple-placeholder',
        string: 'x/#, y/#',
        explanation: '"x/#, y/#" is a string with simple placeholder tags.',
        tagSpecs: [new TagSpec('x/#', 0, 3, ''), new TagSpec('y/#', 5, 8, '')],
        groupSpec: new GroupSpec(0, 8, []),
        errors: [],
      },
      {
        testname: 'placeholder-with-units',
        string: 'x/# ms, y',
        explanation: '"x/# ms, y" has units',
        tagSpecs: [new TagSpec('x/# ms', 0, 6, ''), new TagSpec('y', 8, 9, '')],
        groupSpec: new GroupSpec(0, 9, []),
        errors: [],
      },
    ],
  },
  {
    name: 'invalid-extra-slash-in-various-places',
    description: 'Tags cannot have leading or trailing, or extra slashes',
    tests: [
      {
        testname: 'leading-slash',
        explanation: '"/x" should not have a leading slash',
        string: '/x',
        tagSpecs: [],
        groupSpec: null,
        errors: [generateIssue('extraSlash', { index: '0', string: '/x', msg: '"/" at the beginning of tag.' })],
      },
      {
        testname: 'double-slash',
        explanation: '"x//y" should not have double slash',
        string: 'x//y',
        tagSpecs: [],
        groupSpec: null,
        errors: [generateIssue('extraSlash', { index: '2', string: 'x//y', msg: 'Slashes with only blanks between' })],
      },
      {
        testname: 'triple-slash',
        string: 'x///y',
        explanation: '"x///y" should not have double slash',
        tagSpecs: [],
        groupSpec: null,
        errors: [generateIssue('extraSlash', { index: '2', string: 'x///y', msg: 'Slashes with only blanks between' })],
      },
      {
        testname: 'trailing-slash',
        explanation: '"x/y/" should not have ending slash',
        string: 'x/y/',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('extraSlash', {
            index: '3',
            string: 'x/y/',
            msg: 'Usually the result of multiple consecutive slashes or a slash at the end.',
          }),
        ],
      },
      {
        testname: 'value-slash',
        explanation: '"x /y" should not have extra blanks before slash',
        string: 'x /y',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('extraBlank', {
            index: '1',
            string: 'x /y',
            msg: 'Blank before an internal slash -- often a slash in a value',
          }),
        ],
      },
      {
        testname: 'group-leading-slash',
        explanation: '"(/x)" should not have a slash after group',
        string: '(/x)',
        tagSpecs: [],
        groupSpec: null,
        errors: [generateIssue('extraSlash', { index: '1', string: '(/x)', msg: '"/" at the beginning of tag.' })],
      },
    ],
  },
  {
    name: 'invalid-commas',
    description: 'Commas must separate tags and groups',
    tests: [
      {
        testname: 'end-in-comma',
        explanation: '"x,y," should not end in a comma',
        string: 'x,y,',
        tagSpecs: [],
        groupSpec: null,
        errors: [generateIssue('emptyTagFound', { index: '3', string: 'x,y,', msg: 'Probably extra commas at end.' })],
      },
      {
        testname: 'double-comma',
        explanation: '"x,,y," should not have double commas',
        string: 'x,,y,',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '2',
            string: 'x,,y,',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
      {
        testname: 'leading-comma',
        string: ',x,y',
        explanation: '",x,y" should not have a leading comma',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '0',
            string: ',x,y',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
      {
        testname: 'missing-comma-before-open',
        explanation: '"x, y(z)" should have a comma before open parentheses if tag present',
        string: 'x, y(z)',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('commaMissing', { index: '4', string: 'x, y(z)', tag: 'y', msg: 'Missing comma before "(".' }),
        ],
      },
      {
        testname: 'missing-comma-before-close',
        explanation: '"x, (y)zp, (w)" should have a comma after closing parentheses',
        string: 'x, (y)zp, (w)',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('invalidTag', {
            index: '8',
            string: 'x, (y)zp, (w)',
            tag: 'zp',
            msg: 'Tag found after group or column without a comma.',
          }),
        ],
      },
      {
        testname: 'missing-comma-before-close-at-end',
        explanation: '"x, (y)z" should have a comma after closing parenthesis at end of string',
        string: 'x, (y)z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('commaMissing', {
            index: '6',
            string: 'x, (y)z',
            msg: 'This likely occurred near the end of "x, (y)z"',
          }),
        ],
      },
      {
        testname: 'extra-comma-after-open-group',
        explanation: '"(, x, y), z" should not have a comma after an open parenthesis',
        string: '(, x, y), z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '1',
            string: '(, x, y), z',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
      {
        testname: 'missing-comma-before-open-column',
        explanation: '"x, y, {(z)" should have a comma before open brace',
        string: 'x, y, {(z)',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedCurlyBrace', {
            index: '6',
            string: 'x, y, {(z)',
            msg: 'Previous "{" is not closed and braces or parentheses cannot appear inside braces.',
          }),
        ],
      },
      {
        testname: 'missing-comma-between groups',
        explanation: '"(x, y)(z, (w))" should have a comma before open brace',
        string: '(x, y)(z, (w))',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('commaMissing', { index: '6', string: '(x, y)(z, (w))', msg: 'Missing comma after ")".' }),
        ],
      },
      {
        testname: 'missing-close-brace-before-parentheses',
        explanation: '"x, y, {w(z)" should have a closed-brace-after-open-brace',
        string: 'x, y, {w(z)',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedCurlyBrace', {
            index: '6',
            string: 'x, y, {w(z)',
            msg: 'Previous "{" is not closed and braces or parentheses cannot appear inside braces.',
          }),
        ],
      },
      {
        testname: 'missing-comma-after-closing-column',
        explanation: '"x, {y}(z)" should have a comma after closing brace',
        string: 'x, {y}(z)',
        tagSpecs: [],
        groupSpec: null,
        errors: [generateIssue('commaMissing', { index: '5', string: 'x, {y}(z)', msg: 'Missing comma after "}".' })],
      },
      {
        testname: 'extra-leading-comma',
        explanation: '",x, (y), z" should not have a leading comma',
        string: ',x, (y), z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '0',
            string: ',x, (y), z',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
      {
        testname: 'extra-closing-comma',
        explanation: '"x, (y), z," should not have a trailing comma',
        string: 'x, (y), z,',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', { index: '9', string: 'x, (y), z,', msg: 'Probably extra commas at end.' }),
        ],
      },
      {
        testname: 'multiple-leading-commas',
        explanation: '",,x, (y), z" should not have multiple leading commas',
        string: ',,x, (y), z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '0',
            string: ',,x, (y), z',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
      {
        testname: 'multiple-closing-commas',
        explanation: '"x, (y), z,," should not have multiple trailing commas',
        string: 'x, (y), z,,',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '10',
            string: 'x, (y), z,,',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
      {
        testname: 'multiple-internal-commas',
        explanation: '"x, (y),, z" should not have multiple internal commas',
        string: 'x, (y),, z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('emptyTagFound', {
            index: '7',
            string: 'x, (y),, z',
            msg: 'Usually a comma after another comma or an open parenthesis or at beginning of string.',
          }),
        ],
      },
    ],
  },
  {
    name: 'invalid-braces',
    description: 'Braces cannot have commas, parentheses or other braces',
    tests: [
      {
        testname: 'leading-close-brace',
        explanation: '"}x" should not have a leading slash',
        string: '}x',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unopenedCurlyBrace', { index: '0', string: '}x', msg: 'No matching open brace Ex: " x}"' }),
        ],
      },
      {
        testname: 'parenthesis-after-open-brace',
        explanation: '"x, {y(z)}" should not have parentheses inside braces',
        string: 'x, {y(z)}',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedCurlyBrace', {
            index: '3',
            string: 'x, {y(z)}',
            msg: 'Previous "{" is not closed and braces or parentheses cannot appear inside braces.',
          }),
        ],
      },
      {
        testname: 'comma-inside-braces',
        explanation: '"x, {y,z}" should not have a comma inside braces',
        string: 'x, {y,z}',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedCurlyBrace', {
            index: '3',
            string: 'x, {y,z}',
            msg: 'A "{" appears before the previous "{" was closed.',
          }),
        ],
      },
      {
        testname: 'unclosed-brace',
        explanation: '"x, {y, z" should have a closing brace to match the open brace',
        string: 'x, {y, z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedCurlyBrace', {
            index: '3',
            string: 'x, {y, z',
            msg: 'A "{" appears before the previous "{" was closed.',
          }),
        ],
      },
      {
        testname: 'nested-braces',
        explanation: '"{x}, {{y, z}}" should not have nested braces',
        string: '{x}, {{y, z}}',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('nestedCurlyBrace', {
            index: '6',
            string: '{x}, {{y, z}}',
            msg: 'Often after another open brace Ex:  Ex: "{x{"',
          }),
        ],
      },
    ],
  },
  {
    name: 'invalid-parenthesis',
    description: 'Various types of mismatched parentheses',
    tests: [
      {
        testname: 'extra-opening-parentheses',
        explanation: '"x, (((y, z), w), u" should not have extra open parentheses must match',
        string: 'x, (((y, z), w), u',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedParenthesis', {
            index: '3',
            string: 'x, (((y, z), w), u',
            msg: 'Unclosed group due to unmatched "(".',
          }),
        ],
      },
      {
        testname: 'unmatched-opening-parentheses',
        explanation: '"x, (((y, z), w))), (u" should matching open-close parentheses',
        string: 'x, (((y, z), w), u',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unclosedParenthesis', {
            index: '3',
            string: 'x, (((y, z), w), u',
            msg: 'Unclosed group due to unmatched "(".',
          }),
        ],
      },
      {
        testname: 'extra-closing-parentheses',
        explanation: '"x, (y, z)), w" should not have extra closing parenthesis',
        string: 'x, (y, z)), w',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unopenedParenthesis', {
            index: '9',
            string: 'x, (y, z)), w',
            msg: 'A ")" appears before a matching "("',
          }),
        ],
      },
      {
        testname: 'parentheses-in-wrong-order',
        explanation: '"((x),y))(z" should have proper parentheses nesting',
        string: '((x),y))(z',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('unopenedParenthesis', {
            index: '7',
            string: '((x),y))(z',
            msg: 'A ")" appears before a matching "("',
          }),
        ],
      },
    ],
  },
  {
    name: 'invalid-placeholders',
    description: 'Test various placeholder issues',
    tests: [
      {
        testname: 'leading-placeholder',
        explanation: '"#/x, y" should not have a leading placeholder',
        string: '#/x, y',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('invalidPlaceholder', {
            index: '3',
            string: '#/x, y',
            tag: '#/x',
            msg: 'A placeholder must be preceded by a slash in the tag.',
          }),
        ],
      },
      {
        testname: 'extra-placeholder-extension',
        explanation: '"x/#/#" should have a most one placeholder extension',
        string: 'x/#/#, z/#',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('invalidPlaceholder', {
            index: '5',
            string: 'x/#/#, z/#',
            tag: 'x/#/#',
            msg: '2 placeholders found, but only one is allowed.',
          }),
        ],
      },
      {
        testname: 'placeholder-before-group',
        explanation: '"x/#(yz)" should have a comma after placeholder',
        string: 'x/#(yz)',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('commaMissing', {
            index: '3',
            string: 'x/#(yz)',
            tag: 'x/#',
            msg: 'Missing comma before "(".',
          }),
        ],
      },
      {
        testname: 'placeholder-before-column',
        explanation: '"x/#{yz}" should have a comma after placeholder',
        string: 'x/#{yz}',
        tagSpecs: [],
        groupSpec: null,
        errors: [
          generateIssue('invalidCharacter', {
            character: 'LEFT CURLY BRACKET',
            index: '3',
            string: 'x/#{yz}',
            msg: 'Brace in the middle of a tag Ex: "x {"',
          }),
        ],
      },
    ],
  },
]

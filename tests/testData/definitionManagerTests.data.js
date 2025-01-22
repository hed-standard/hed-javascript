import { generateIssue } from '../../src/common/issues/issues'

export const definitionTestData = [
  {
    name: 'def-or-def-expand',
    description: '"Event" is a single level tag"',
    schemaVersion: '8.3.0',
    definitions: ['(Definition/Acc/#, (Acceleration/# m-per-s^2, Red))', '(Definition/MyColor, (Label/Pie))'],
    tests: [
      {
        testname: 'valid-def',
        explanation: '"Def/MyColor" is a valid def tag',
        definition: null,
        stringIn: 'Def/MyColor',
        placeholderAllowed: false,
        errors: [],
      },
      {
        testname: 'valid-def-different-case',
        explanation: '"def/myColor" is a valid def tag although different cases',
        definition: null,
        stringIn: 'def/myColor',
        placeholderAllowed: false,
        errors: [],
      },
      {
        testname: 'valid-def-no-group',
        explanation: '"Def/Blech" has a definition without a group',
        definition: '(Definition/Blech)',
        stringIn: 'Def/Blech, (Red, Green)',
        placeholderAllowed: false,
        errors: [],
      },
      {
        testname: 'valid-def-with-placeholder',
        explanation: '"def/Acc/#" is def tag with an allowed placeholder',
        definition: null,
        stringIn: 'def/Acc/#',
        placeholderAllowed: true,
        errors: [],
      },
      {
        testname: 'invalid-def-with-placeholder',
        explanation: '"def/Acc/#" is def tag with disallowed placeholder',
        definition: null,
        stringIn: 'def/Acc/#',
        placeholderAllowed: false,
        errors: [generateIssue('invalidPlaceholderContext', { string: 'def/Acc/#' })],
      },
      {
        testname: 'valid-def-expand-with-placeholder',
        explanation:
          '"(Def-expand/Acc/#, (Acceleration/# m-per-s^2, Red))" is def-expand tag with an allowed placeholder',
        definition: null,
        stringIn: '(Def-expand/Acc/#, (Acceleration/# m-per-s^2, Red))',
        placeholderAllowed: true,
        errors: [],
      },
      {
        testname: 'invalid-def-with-placeholder',
        explanation:
          '"(Def-expand/Acc/#, (Acceleration/# m-per-s^2, Red))" is def-expand tag with disallowed placeholder',
        definition: null,
        stringIn: '(Def-expand/Acc/#, (Acceleration/# m-per-s^2, Red))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidPlaceholderContext', { string: '(Def-expand/Acc/#, (Acceleration/# m-per-s^2, Red))' }),
        ],
      },
      {
        testname: 'invalid-def-expand-should-have-a-group',
        explanation: '"(Def-expand/Acc/4.5)" has a definition without a group',
        definition: null,
        stringIn: '(Def-expand/Acc/4.5)',
        placeholderAllowed: false,
        errors: [
          generateIssue('defExpandContentsInvalid', { contents: '', defContents: '(Acceleration/4.5 m-per-s^2,Red)' }),
        ],
      },
      {
        testname: 'missing-definition',
        explanation: '"def/Blech" does not have a corresponding definition',
        definition: null,
        stringIn: 'def/Blech',
        placeholderAllowed: false,
        errors: [generateIssue('missingDefinitionForDef', { definition: 'blech' })],
      },
      {
        testname: 'invalid-def-extra-level',
        explanation: '"def/Blech/5" is def tag with unexpected second level',
        definition: '(Definition/Blech, (Label/Cake))',
        stringIn: 'def/Blech/5',
        placeholderAllowed: false,
        errors: [generateIssue('missingDefinitionForDef', { definition: 'blech' })],
      },
      {
        testname: 'invalid-def-invalid-value',
        explanation: '"def/Acc/4.5/3" is def tag with invalid value',
        definition: null,
        stringIn: 'def/Acc/4.5/3',
        placeholderAllowed: false,
        errors: [generateIssue('invalidValue', { tag: 'Acceleration/4.5/3 m-per-s^2' })],
      },
      {
        testname: 'invalid-def-expand-invalid-value',
        explanation:
          '"(Def-expand/Acc/4.5/3, (Acceleration/4.5/3 m-per-s^2, Red))" is def-expand tag with invalid substituted value',
        definition: null,
        stringIn: '(Def-expand/Acc/4.5/3, (Acceleration/4.5/3 m-per-s^2, Red))',
        placeholderAllowed: false,
        errors: [generateIssue('invalidValue', { tag: 'Acceleration/4.5/3 m-per-s^2' })],
      },
      {
        testname: 'invalid-def-expand-invalid-substitution',
        explanation:
          '"(Def-expand/Acc/4.5, (Acceleration/6 m-per-s^2, Red))" has def-expand tag with invalid substitution',
        definition: null,
        stringIn: '(Def-expand/Acc/4.5, (Acceleration/6 m-per-s^2, Red))',
        placeholderAllowed: false,
        errors: [
          generateIssue('defExpandContentsInvalid', {
            contents: '(Acceleration/6 m-per-s^2,Red)',
            defContents: '(Acceleration/4.5 m-per-s^2,Red)',
          }),
        ],
      },
      {
        testname: 'invalid-def-expand-invalid-value',
        explanation:
          '"(Def-expand/Acc/Blech, (Acceleration/Blech m-per-s^2, Red))" is def-expand tag with invalid substitution',
        definition: null,
        stringIn: '(Def-expand/Acc/4.5, (Acceleration/6 m-per-s^2, Red))',
        placeholderAllowed: false,
        errors: [
          generateIssue('defExpandContentsInvalid', {
            contents: '(Acceleration/6 m-per-s^2,Red)',
            defContents: '(Acceleration/4.5 m-per-s^2,Red)',
          }),
        ],
      },
    ],
  },
]

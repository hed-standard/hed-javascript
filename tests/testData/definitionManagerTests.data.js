import { generateIssue } from '../../common/issues/issues'

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
        fullCheck: true,
        errors: [],
      },
      {
        testname: 'valid-def-different-case',
        explanation: '"def/myColor" is a valid def tag although different cases',
        definition: null,
        stringIn: 'def/myColor',
        fullCheck: true,
        errors: [],
      },
      {
        testname: 'missing-definition',
        explanation: '"def/Blech" does not have a corresponding definition',
        definition: null,
        stringIn: 'def/Blech',
        fullCheck: true,
        errors: [generateIssue('missingDefinitionForDef', { definition: 'blech' })],
      },
      {
        testname: 'invalid-def-extra-level',
        explanation: '"def/Blech/5" is def tag with unexpected second level',
        definition: '(Definition/Blech, (Label/Cake))',
        stringIn: 'def/Blech/5',
        fullCheck: true,
        errors: [generateIssue('missingDefinitionForDef', { definition: 'blech' })],
      },
      {
        testname: 'invalid-def-invalid-value',
        explanation: '"def/Acc/4.5/3" is def tag with invalid value',
        definition: null,
        stringIn: 'def/Acc/4.5/3',
        fullCheck: true,
        errors: [generateIssue('invalidValue', { tag: 'Acceleration/4.5/3 m-per-s^2' })],
      },
      {
        testname: 'invalid-def-expand-invalid-value',
        explanation:
          '"(Def-expand/Acc/4.5/3, (Acceleration/4.5/3 m-per-s^2, Red))" is def-expand tag with invalid substituted value',
        definition: null,
        stringIn: '(Def-expand/Acc/4.5/3, (Acceleration/4.5/3 m-per-s^2, Red))',
        fullCheck: true,
        errors: [generateIssue('invalidValue', { tag: 'Acceleration/4.5/3 m-per-s^2' })],
      },
    ],
  },
]

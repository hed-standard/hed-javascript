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
        testname: 'invalid-def-extra-level',
        explanation: '"def/myColor/5" is def tag with unexpect second level',
        definition: null,
        stringIn: 'def/myColor/5',
        fullCheck: true,
        errors: [generateIssue('missingDefinitionForDef', { definition: 'myColor' })],
      },
    ],
  },
]

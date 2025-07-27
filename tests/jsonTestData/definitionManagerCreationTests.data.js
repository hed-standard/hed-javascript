import { generateIssue } from '../../src/issues/issues'

export const definitionTestData = [
  {
    name: 'definition-creation-validation',
    description: 'Tests for Definition creation validation and error handling',
    schemaVersion: '8.4.0',
    definitions: ['(Definition/ValidDef, (Label/Valid))'],
    tests: [
      {
        testname: 'valid-definition-creation-from-string',
        explanation: 'Valid definition should be created successfully using createDefinition static method',
        stringIn: '(Definition/TestDef, (Label/Test))',
        placeholderAllowed: false,
        errors: [],
      },
      {
        testname: 'invalid-definition-multiple-top-tags',
        explanation: 'Definition with multiple top tags should return invalidDefinition error',
        stringIn: '(Definition/BadDef, Definition/AnotherDef, (Label/Invalid))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidDefinitionGroupStructure', {
            tag: 'Definition/BadDef',
            tagGroup: '(Definition/BadDef, Definition/AnotherDef, (Label/Invalid))',
          }),
        ],
      },
      {
        testname: 'invalid-definition-multiple-top-groups',
        explanation: 'Definition with multiple top groups should return invalidDefinition error',
        stringIn: '(Definition/BadDef, (Label/First), (Label/Second))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidDefinitionGroupStructure', {
            tag: 'Definition/BadDef',
            tagGroup: '(Definition/BadDef, (Label/First), (Label/Second))',
          }),
        ],
      },
      {
        testname: 'invalid-definition-no-top-tags',
        explanation: 'Definition with no top tags should return invalidDefinition error',
        stringIn: '((Label/NoTopTag))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidDefinition', { definition: '((Label/NoTopTag))', msg: 'There was no Definition tag.' }),
        ],
      },
      {
        testname: 'invalid-definition-wrong-placeholder-count-too-many',
        explanation: 'Definition with too many placeholders should return invalidPlaceholderInDefinition error',
        stringIn: '(Definition/TooManyPlaceholders/#, (Label/#/More/#))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidPlaceholder', {
            index: '50',
            string: '(Definition/TooManyPlaceholders/#, (Label/#/More/#))',
            tag: 'Label/#/More/#',
            msg: '2 placeholders found, but only one is allowed.',
          }),
        ],
      },
      {
        testname: 'invalid-definition-wrong-placeholder-count-missing',
        explanation:
          'Definition expecting placeholder but content has none should return invalidPlaceholderInDefinition error',
        stringIn: '(Definition/MissingPlaceholder/#, (Label/NoPlaceholder))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidPlaceholderInDefinition', {
            definition: '(Definition/MissingPlaceholder/#, (Label/NoPlaceholder))',
            msg: 'The definition should have 1 placeholder but has 0 #s.',
          }),
        ],
      },
      {
        testname: 'invalid-definition-unexpected-placeholder',
        explanation: 'Definition with unexpected placeholder should return invalidPlaceholderInDefinition error',
        stringIn: '(Definition/UnexpectedPlaceholder, (Label/#))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidPlaceholderInDefinition', {
            definition: '(Definition/UnexpectedPlaceholder, (Label/#))',
            msg: 'The definition should have no placeholders but has 1 #s.',
          }),
        ],
      },
      {
        testname: 'valid-definition-with-correct-placeholder',
        explanation: 'Definition with correctly matching placeholder should be valid',
        stringIn: '(Definition/CorrectPlaceholder/#, (Label/#))',
        placeholderAllowed: false,
        errors: [],
      },
      {
        testname: 'valid-definition-no-placeholder-no-content',
        explanation: 'Definition without placeholder and without placeholder in content should be valid',
        stringIn: '(Definition/NoPlaceholder, (Label/Fixed))',
        placeholderAllowed: false,
        errors: [],
      },
      {
        testname: 'invalid-definition-malformed-string',
        explanation: 'Malformed definition string should return invalidDefinition error',
        stringIn: 'Definition/Malformed, Label/Invalid)',
        placeholderAllowed: false,
        errors: [
          generateIssue('unopenedParenthesis', {
            index: '35',
            string: 'Definition/Malformed, Label/Invalid)',
            msg: 'A ")" appears before a matching "(".',
          }),
        ],
      },
      {
        testname: 'invalid-definition-with-top-level-tags',
        explanation: 'Definition string with top-level tags should return invalidDefinition error',
        stringIn: 'Definition/TopLevel, (Label/Valid)',
        placeholderAllowed: false,
        errors: [
          generateIssue('missingTagGroup', {
            string: 'Definition/TopLevel, (Label/Valid)',
            tag: 'Definition/TopLevel',
          }),
        ],
      },
      {
        testname: 'invalid-definition-multiple-groups',
        explanation: 'Definition string with multiple groups should return invalidDefinition error',
        stringIn: '(Definition/MultiGroup, (Label/First)), (Definition/Another, (Label/Second))',
        placeholderAllowed: false,
        errors: [
          generateIssue('invalidDefinition', {
            definition: '(Definition/MultiGroup, (Label/First)), (Definition/Another, (Label/Second))',
            msg: 'There are too many tag groups inside the definition.',
          }),
        ],
      },
    ],
  },
]

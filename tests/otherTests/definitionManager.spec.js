import { beforeAll, describe, it, beforeEach } from '@jest/globals'

import { Definition, DefinitionManager } from '../../src/parser/definitionManager'
import { parseHedString } from '../../src/parser/parser'
import { buildSchemas } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'


describe('Definition and DefinitionManager', () => {
  let hedSchemas

  beforeAll(async () => {
    const spec = new SchemaSpec('', '8.4.0', '', '')
    const specs = new SchemasSpec().addSchemaSpec(spec)
    hedSchemas = await buildSchemas(specs)
  })

  describe('Definition class', () => {
    describe('Constructor', () => {
      it('should prevent direct construction', () => {
        expect(() => {
          new Definition({})
        }).toThrow('Definition instances must be created using Definition.createDefinition() or Definition.createDefinitionFromGroup() static methods')
      })

      it('should allow construction with private flag', () => {
        const testDef = '(Definition/TestDef, (Red, Blue))'
        const [hedString, errors, warnings] =  parseHedString(testDef, hedSchemas, true, true, false)
        expect(errors.length).toBe(0)
        expect(warnings.length).toBe(0)
        expect(() => {
          new Definition(hedString.tagGroups[0],true)
        }).not.toThrow()
      })
    })

    describe('createDefinition static method', () => {
      it('should create a valid definition from a simple definition string', async () => {
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition, errorIssues, warningIssues] = Definition.createDefinition(definitionString, hedSchemas)
        
        expect(definition).not.toBeNull()
        expect(errorIssues).toHaveLength(0)
        expect(warningIssues).toHaveLength(0)
        expect(definition.name).toBe('TestDef')
      })

      it('should create a valid definition with warnings', async () => {
        const definitionString = '(Definition/TestDef, (Red/Blech, Blue))'
        const [definition, errorIssues, warningIssues] = Definition.createDefinition(definitionString, hedSchemas)

        expect(definition).not.toBeNull()
        expect(errorIssues).toHaveLength(0)
        expect(warningIssues).toHaveLength(1)
        expect(definition.name).toBe('TestDef')
      })


      it('should create a valid definition with placeholder', async () => {
        const definitionString = '(Definition/TestDef/#, (Label/#, Blue))'
        const [definition, errorIssues, warningIssues] = Definition.createDefinition(definitionString, hedSchemas)
        
        expect(definition).not.toBeNull()
        expect(errorIssues).toHaveLength(0)
        expect(warningIssues).toHaveLength(0)
        expect(definition.name).toBe('TestDef')
        expect(definition.placeholder).toBe('#')
      })

      it('should return error for invalid definition string', async () => {
        const invalidDefinitionString = 'Invalid definition'
        const [definition, errorIssues] = Definition.createDefinition(invalidDefinitionString, hedSchemas)
        
        expect(definition).toBeNull()
        expect(errorIssues.length).toBeGreaterThan(0)
      })

      it('should return error for definition with extra tags outside group', async () => {
        const invalidDefinitionString = '(Definition/TestDef, (Red, Blue), Green)'
        const [definition, errorIssues, warningIssues] = Definition.createDefinition(invalidDefinitionString, hedSchemas)
        
        expect(definition).toBeNull()
        expect(errorIssues.length).toBeGreaterThan(0)
        expect(errorIssues[0].hedCode).toBe('DEFINITION_INVALID')
        expect(warningIssues).toHaveLength(0)
      })

      it('should return error for definition with too many tag groups', async () => {
        const invalidDefinitionString = '(Definition/TestDef, (Red, Blue)), (Definition/TestDef2, (Green, Yellow))'
        const [definition, errorIssues, warningIssues] = Definition.createDefinition(invalidDefinitionString, hedSchemas)
        
        expect(definition).toBeNull()
        expect(errorIssues.length).toBeGreaterThan(0)
        expect(errorIssues[0].hedCode).toBe('DEFINITION_INVALID')
        expect(warningIssues).toHaveLength(0)
      })
    })

    describe('createDefinitionFromGroup static method', () => {
      it('should create definition from valid ParsedHedGroup', async () => {
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [parsedString] = parseHedString(definitionString, hedSchemas, true, true, true)
        const group = parsedString.tagGroups[0]
        
        const [definition, errorIssues] = Definition.createDefinitionFromGroup(group)
        
        expect(definition).not.toBeNull()
        expect(errorIssues).toHaveLength(0)
        expect(definition.name).toBe('TestDef')
      })

      it('should return error for group without Definition tag', async () => {
        const nonDefinitionString = '(Red, Blue)'
        const [parsedString] = parseHedString(nonDefinitionString, hedSchemas, true, true, true)
        const group = parsedString.tagGroups[0]
        
        const [definition, errorIssues] = Definition.createDefinitionFromGroup(group)
        
        expect(definition).toBeNull()
        expect(errorIssues.length).toBeGreaterThan(0)
        expect(errorIssues[0].hedCode).toBe('DEFINITION_INVALID')
      })

      it('should return error for invalid placeholder count', async () => {
        const invalidPlaceholderString = '(Definition/TestDef/#, (Label/#, Item-count/#, Blue))'
        const [parsedString] = parseHedString(invalidPlaceholderString, hedSchemas, true, true, true)
        const group = parsedString.tagGroups[0]
        
        const [definition, errorIssues] = Definition.createDefinitionFromGroup(group)
        
        expect(definition).toBeNull()
        expect(errorIssues.length).toBeGreaterThan(0)
        expect(errorIssues[0].hedCode).toBe('DEFINITION_INVALID')
      })
    })

    describe('evaluateDefinition method', () => {
      let testDefinition

      beforeAll(async () => {
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        testDefinition = definition
      })

      it('should evaluate definition without placeholder', async () => {
        // TODO: Create test tag
        const testTagString = 'Def/TestDef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, errorIssues, warningIssues] = testDefinition.evaluateDefinition(tag, hedSchemas, false)
        
        expect(result).not.toBeNull()
        expect(errorIssues).toHaveLength(0)
        expect(warningIssues).toHaveLength(0)
      })

      it('should evaluate definition with placeholder', async () => {

        const definitionString = '(Definition/TestDef/#, (Label/#, Blue))'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        
        const testTagString = 'Def/TestDef/Blech'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, errorIssues, warningIssues] = definition.evaluateDefinition(tag, hedSchemas, false)
        
        expect(result).not.toBeNull()
        expect(errorIssues).toHaveLength(0)
        expect(warningIssues).toHaveLength(0)
      })

      it('should return error for mismatched value levels', async () => {
        const testTagString = 'Def/TestDef/ExtraValue'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, errorIssues] = testDefinition.evaluateDefinition(tag, hedSchemas, false)
        
        expect(result).toBeNull()
        expect(errorIssues.length).toBeGreaterThan(0)
      })

      it('should handle empty definition contents', async () => {
        const definitionString = '(Definition/EmptyDef)'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        
        const testTagString = 'Def/EmptyDef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, errorIssues, warningIssues] = definition.evaluateDefinition(tag, hedSchemas, false)
        
        expect(result).toBe('')
        expect(errorIssues).toHaveLength(0)
        expect(warningIssues).toHaveLength(0)
      })
    })

    describe('equivalent method', () => {
      it('should return true for equivalent definitions', async () => {
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition1] = Definition.createDefinition(definitionString, hedSchemas)
        const [definition2] = Definition.createDefinition(definitionString, hedSchemas)
        
        expect(definition1.equivalent(definition2)).toBe(true)
      })

      it('should return false for different names', async () => {
        const definitionString1 = '(Definition/TestDef1, (Red, Blue))'
        const definitionString2 = '(Definition/TestDef2, (Red, Blue))'
        const [definition1] = Definition.createDefinition(definitionString1, hedSchemas)
        const [definition2] = Definition.createDefinition(definitionString2, hedSchemas)
        
        expect(definition1.equivalent(definition2)).toBe(false)
      })

      it('should return false for different placeholders', async () => {
        const definitionString1 = '(Definition/TestDef, (Red, Blue))'
        const definitionString2 = '(Definition/TestDef/#, (Label/#, Blue))'
        const [definition1] = Definition.createDefinition(definitionString1, hedSchemas)
        const [definition2] = Definition.createDefinition(definitionString2, hedSchemas)
        
        expect(definition1.equivalent(definition2)).toBe(false)
      })

      it('should return false for different contents', async () => {
        const definitionString1 = '(Definition/TestDef, (Red, Blue))'
        const definitionString2 = '(Definition/TestDef, (Green, Yellow))'
        const [definition1] = Definition.createDefinition(definitionString1, hedSchemas)
        const [definition2] = Definition.createDefinition(definitionString2, hedSchemas)
        
        expect(definition1.equivalent(definition2)).toBe(false)
      })
    })
  })

  describe('DefinitionManager class', () => {
    let manager

    beforeEach(() => {
      manager = new DefinitionManager()
    })

    describe('Constructor', () => {
      it('should create empty definitions map', () => {
        expect(manager.definitions).toBeInstanceOf(Map)
        expect(manager.definitions.size).toBe(0)
      })
    })

    describe('addDefinition method', () => {
      it('should add a new definition successfully', async () => {
        // TODO: Create test definition
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        
        const issues = manager.addDefinition(definition)
        
        expect(issues).toHaveLength(0)
        expect(manager.definitions.size).toBe(1)
        expect(manager.definitions.has('testdef')).toBe(true)
      })

      it('should allow adding equivalent definitions without conflict', async () => {
        // TODO: Create equivalent definitions
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition1] = Definition.createDefinition(definitionString, hedSchemas)
        const [definition2] = Definition.createDefinition(definitionString, hedSchemas)
        
        manager.addDefinition(definition1)
        const issues = manager.addDefinition(definition2)
        
        expect(issues).toHaveLength(0)
        expect(manager.definitions.size).toBe(1)
      })

      it('should return conflict error for conflicting definitions', async () => {
        const definitionString1 = '(Definition/TestDef, (Red, Blue))'
        const definitionString2 = '(Definition/TestDef, (Green, Yellow))'
        const [definition1] = Definition.createDefinition(definitionString1, hedSchemas)
        const [definition2] = Definition.createDefinition(definitionString2, hedSchemas)
        
        manager.addDefinition(definition1)
        const issues = manager.addDefinition(definition2)
        
        expect(issues.length).toBeGreaterThan(0)
        expect(issues[0].hedCode).toBe('DEFINITION_INVALID')
      })
    })

    describe('addDefinitions method', () => {
      it('should add multiple definitions successfully', async () => {
        const definitionStrings = [
          '(Definition/TestDef1, (Red, Blue))',
          '(Definition/TestDef2, (Green, Yellow))'
        ]
        const definitions = []
        for (const defString of definitionStrings) {
          const [definition] = Definition.createDefinition(defString, hedSchemas)
          definitions.push(definition)
        }
        
        const issues = manager.addDefinitions(definitions)
        
        expect(issues).toHaveLength(0)
        expect(manager.definitions.size).toBe(2)
      })

      it('should collect issues from all definitions', async () => {
        const definitionStrings = [
          '(Definition/TestDef, (Red, Blue))',
          '(Definition/TestDef, (Green, Yellow))'
        ]
        const definitions = []
        for (const defString of definitionStrings) {
          const [definition] = Definition.createDefinition(defString, hedSchemas)
          definitions.push(definition)
        }
        
        const issues = manager.addDefinitions(definitions)
        
        expect(issues.length).toBeGreaterThan(0)
      })
    })

    describe('findDefinition method', () => {
      beforeEach(async () => {
        const definitionStrings = [
          '(Definition/TestDef, (Red, Blue))',
          '(Definition/TestDefWithPlaceholder/#, (Label/#, Blue))'
        ]
        for (const defString of definitionStrings) {
          const [definition] = Definition.createDefinition(defString, hedSchemas)
          manager.addDefinition(definition)
        }
      })

      it('should find existing definition', async () => {
        const testTagString = 'Def/TestDef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [definition, issues] = manager.findDefinition(tag)
        
        expect(definition).not.toBeNull()
        expect(issues).toHaveLength(0)
        expect(definition.name).toBe('TestDef')
      })

      it('should return error for missing definition', async () => {
        const testTagString = 'Def/NonExistentDef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [definition, issues] = manager.findDefinition(tag)
        
        expect(definition).toBeNull()
        expect(issues.length).toBeGreaterThan(0)
        expect(issues[0].hedCode).toBe('DEF_INVALID')
      })

      it('should return null for non-Def tags', async () => {
        const testTagString = 'Red'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [definition, issues] = manager.findDefinition(tag)
        
        expect(definition).toBeNull()
        expect(issues).toHaveLength(0)
      })

      it('should handle case insensitive lookup', async () => {
        // TODO: Create tag with different case
        const testTagString = 'Def/testdef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [definition, issues] = manager.findDefinition(tag)
        
        expect(definition).not.toBeNull()
        expect(issues).toHaveLength(0)
      })
    })

    describe('evaluateTag method', () => {
      beforeEach(async () => {
        // TODO: Set up test definitions
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        manager.addDefinition(definition)
      })

      it('should evaluate existing definition tag', async () => {
        // TODO: Create test tag
        const testTagString = 'Def/TestDef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, issues] = manager.evaluateTag(tag, hedSchemas, false)
        
        expect(result).not.toBeNull()
        expect(issues).toHaveLength(0)
      })

      it('should return error for missing definition', async () => {
        // TODO: Create tag for missing definition
        const testTagString = 'Def/MissingDef'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, issues] = manager.evaluateTag(tag, hedSchemas, false)
        
        expect(result).toBeNull()
        expect(issues.length).toBeGreaterThan(0)
      })

      it('should return null for non-Def tags', async () => {
        // TODO: Create non-Def tag
        const testTagString = 'Red'
        const [parsedString] = parseHedString(testTagString, hedSchemas, false, false, true)
        const tag = parsedString.topLevelTags[0]
        
        const [result, issues] = manager.evaluateTag(tag, hedSchemas, false)
        
        expect(result).toBeNull()
        expect(issues).toHaveLength(0)
      })
    })

    describe('validateDefs method', () => {
      beforeEach(async () => {
        // TODO: Set up test definitions
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        manager.addDefinition(definition)
      })

      it('should validate HED string with valid Def tags', async () => {
        // TODO: Create HED string with valid Def tags
        const hedString = 'Def/TestDef, Green'
        const [parsedString] = parseHedString(hedString, hedSchemas, false, false, true)
        
        const issues = manager.validateDefs(parsedString, hedSchemas, false)
        
        expect(issues).toHaveLength(0)
      })

      it('should return issues for invalid Def tags', async () => {
        // TODO: Create HED string with invalid Def tags
        const hedString = 'Def/MissingDef, Green'
        const [parsedString] = parseHedString(hedString, hedSchemas, false, false, true)
        
        const issues = manager.validateDefs(parsedString, hedSchemas, false)
        
        expect(issues.length).toBeGreaterThan(0)
      })

      it('should handle HED string without Def tags', async () => {
        // TODO: Create HED string without Def tags
        const hedString = 'Red, Green, Blue'
        const [parsedString] = parseHedString(hedString, hedSchemas, false, false, true)
        
        const issues = manager.validateDefs(parsedString, hedSchemas, false)
        
        expect(issues).toHaveLength(0)
      })
    })

    describe('validateDefExpands method', () => {
      beforeEach(async () => {
        // TODO: Set up test definitions
        const definitionString = '(Definition/TestDef, (Red, Blue))'
        const [definition] = Definition.createDefinition(definitionString, hedSchemas)
        manager.addDefinition(definition)
      })

      it('should validate HED string with valid Def-expand tags', async () => {
        // TODO: Create HED string with valid Def-expand tags
        const hedString = '(Def-expand/TestDef, (Red, Blue))'
        const [parsedString] = parseHedString(hedString, hedSchemas, false, false, true)
        
        const issues = manager.validateDefExpands(parsedString, hedSchemas, false)
        
        expect(issues).toHaveLength(0)
      })

      it('should return early for HED string without Def-expand tags', async () => {
        // TODO: Create HED string without Def-expand tags
        const hedString = 'Red, Green, Blue'
        const [parsedString] = parseHedString(hedString, hedSchemas, false, false, true)
        
        const issues = manager.validateDefExpands(parsedString, hedSchemas, false)
        
        expect(issues).toHaveLength(0)
      })

      it('should return issues for invalid Def-expand contents', async () => {
        // TODO: Create HED string with invalid Def-expand contents
        const hedString = '(Def-expand/TestDef, (Green, Yellow))'
        const [parsedString] = parseHedString(hedString, hedSchemas, false, false, true)
        
        const issues = manager.validateDefExpands(parsedString, hedSchemas, false)
        
        expect(issues.length).toBeGreaterThan(0)
      })
    })

    describe('createDefinitions static method', () => {
      it('should create multiple definitions from string array', async () => {
        // TODO: Create array of definition strings
        const definitionStrings = [
          '(Definition/TestDef1, (Red, Blue))',
          '(Definition/TestDef2, (Green, Yellow))'
        ]
        
        const [definitions, issues] = DefinitionManager.createDefinitions(definitionStrings, hedSchemas)
        
        expect(definitions).toHaveLength(2)
        expect(issues).toHaveLength(0)
      })

      it('should collect issues from invalid definitions', async () => {
        // TODO: Create array with invalid definition strings
        const definitionStrings = [
          '(Definition/TestDef1, (Red, Blue))',
          'Invalid definition string'
        ]
        
        const [definitions, issues] = DefinitionManager.createDefinitions(definitionStrings, hedSchemas)
        
        expect(definitions).toHaveLength(1)
        expect(issues.length).toBeGreaterThan(0)
      })

      it('should handle empty array', async () => {
        const definitionStrings = []
        
        const [definitions, issues] = DefinitionManager.createDefinitions(definitionStrings, hedSchemas)
        
        expect(definitions).toHaveLength(0)
        expect(issues).toHaveLength(0)
      })
    })
  })
})

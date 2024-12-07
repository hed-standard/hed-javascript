import { generateIssue, IssueError } from '../common/issues/issues'
import { parseHedString } from './parser'
import { filterNonEqualDuplicates } from '../utils/map'

export class Definition {
  /**
   * The name of the definition.
   * @type {string}
   */
  name

  /**
   * The name of the definition.
   * @type {ParsedHedTag}
   */
  defTag

  /**
   * The parsed HED group representing the definition
   * @type {ParsedHedGroup}
   */
  defGroup

  /**
   * The definition contents group)
   * @type {string}
   */
  defContents

  placeholder
  /**
   * A single definition
   *
   * @param {ParsedHedGroup} definitionGroup - the parsedHedGroup representing the definition.
   */
  constructor(definitionGroup) {
    this.defGroup = definitionGroup
    this._initializeDefinition(definitionGroup)
  }

  _initializeDefinition(definitionGroup) {
    if (definitionGroup.topTags?.length !== 1 || definitionGroup.topGroups?.length > 1) {
      IssueError.generateAndThrow('invalidDefinition', { definition: definitionGroup.originalTag })
    }
    this.defTag = definitionGroup.topTags[0]
    this.name = this.defTag._value
    this.placeholder = this.defTag._splitValue
    this.defContents = this.defGroup.topGroups.length > 0 ? this.defGroup.topGroups[0] : null
  }

  /**
   * Check a Def or Def-expand tag against this definition
   * @param {ParsedHedTag} - tag to be checked
   * @returns Issue[] - if there is an error.
   */
  checkDef(tag) {
    // One is three level and one is not.
    if (!!this.defTag._splitValue !== !!tag._splitValue) {
      return [generateIssue('missingDefinitionForDef', { definition: tag._value })]
    }
    return []
  }

  /**
   * Check a Def or Def-expand tag against this definition
   * @param {ParsedHedGroup} group - tag to be checked
   * @returns Issue[] - errors encountered
   */
  checkDefGroup(group) {
    // One is three level and one is not.
    return this.checkDef(group.topTags[0])
    //TODO contents must also be checked
  }

  equivalent(other) {
    if (this.name != other.name || this._splitValue != other._splitValue) {
      return false
    }
    return true
  }

  _checkDefinitionPlaceholderCount() {
    const placeholderCount = this.defContents ? this.defContents.originalTag.split('#').length - 1 : 0
    if ((placeholderCount !== 1 && this.placeholder) || (placeholderCount !== 0 && !this.placeholder)) {
      return false
    }
    return true
  }

  /**
   * Create a list of Definition objects from a list of strings
   *
   * @param {string} hedString - A list of string definitions
   * @param {Schemas} hedSchemas - The HED schemas to use in creation
   * @returns { Definition[], Issue[]} - The Definition list and any issues found
   */
  static createDefinition(hedString, hedSchemas) {
    const [parsedString, issues] = parseHedString(hedString, hedSchemas, true, true)
    if (issues.length > 0) {
      return [null, issues]
    }
    if (parsedString.topLevelTags.length !== 0 || parsedString.tagGroups.length > 1) {
      return [null, [generateIssue('invalidDefinition', { definition: hedString })]]
    }
    return Definition.createDefinitionFromGroup(parsedString.tagGroups[0])
  }

  static createDefinitionFromGroup(group) {
    const def = new Definition(group)
    if (def._checkDefinitionPlaceholderCount()) {
      return [def, []]
    }
    return [null, [generateIssue('invalidPlaceholderInDefinition', { definition: def.defGroup.originalTag })]]
  }
}

export class DefinitionManager {
  /**
   * @type <string, Definition> definitions for this manager
   */
  definitions

  constructor() {
    this.definitions = new Map()
  }

  /**
   * Add the non-null items to this manager
   * @param {Definition[]} defs - The list of items to be added
   */
  addDefinitions(defs) {
    const issues = []
    for (const def of defs) {
      issues.push(...this.addDefinition(def))
    }
    return issues
  }

  /**
   * Add a Definition object to this manager
   * @param {Definition} def- The definition to be added.
   * @returns {Issue[]}
   */
  addDefinition(definition) {
    const lowerName = definition.name.toLowerCase()
    const existingDefinition = this.definitions.get(lowerName)
    if (existingDefinition && !existingDefinition.equivalent(definition)) {
      return [
        generateIssue('conflictingDefinitions', {
          definition1: definition.defTag.originalTag,
          definition2: existingDefinition.defGroup.originalTag,
        }),
      ]
    }
    if (!existingDefinition) {
      this.definitions.set(lowerName, definition)
    }
    return []
  }

  /**
   * Check a list of parsed HED tags for missing definitions
   * @param {ParsedHedTag[]} - list of tags to be checked
   * @returns Issue [] - if there is no matching definition
   */
  checkDefs(tags) {
    const issues = []
    for (const tag of tags) {
      issues.push(...this.checkDef(tag))
    }
    return issues
  }

  /**
   * Check a Def Parsed HED tag to make sure it corresponds to a definition
   * @param {ParsedHedTag} - tag to be checked
   * @returns Issue [] - if there is no matching definition
   */
  checkDef(tag) {
    if (tag.schemaTag._name !== 'Def' && tag.schemaTag.name !== 'Def-expand') {
      return []
    }
    const name = tag._value.toLowerCase()
    const existingDefinition = this.definitions.get(name)
    if (!existingDefinition) {
      return [generateIssue('missingDefinitionForDef', { definition: name })]
    }
    return existingDefinition.checkDef(tag)
  }

  /**
   * Check Def-expand groups for a corresponding definition or skip if not a Def-expand group.
   * @param {ParsedHedGroup[]} - group to be checked
   * @returns Issue[] - errors if no matching definitions
   */
  checkDefExpands(groups) {
    const issues = []
    for (const group of groups) {
      issues.push(...this.checkDefExpand(group))
    }
    return issues
  }

  /**
   * Check this Def-expand group for a corresponding definition or skip if not a Def tag.
   * @param {ParsedHedGroup} group - tag to be checked
   * @returns Issue - if there is no matching definition
   */
  checkDefExpand(group) {
    if (!group.isDefExpandGroup) {
      return []
    }

    const name = group.topTags[0].schemaTag.name.toLowerCase()
    const existingDefinition = this.definitions.get(name)
    if (!existingDefinition) {
      return [generateIssue('missingDefinitionForDef', { definition: name })]
    }

    return existingDefinition.checkDefGroup(group)
  }

  /**
   * Create a list of Definition objects from a list of strings
   *
   * @param {string[]} defStrings - A list of string definitions
   * @param {Schemas} hedSchemas - The HED schemas to use in creation
   * @returns { Definition[], Issue[]} - The Definition list and any issues found
   */
  static createDefinitions(defStrings, hedSchemas) {
    const defList = []
    const issues = []
    for (const defString of defStrings) {
      const [nextDef, defIssues] = Definition.createDefinition(defString, hedSchemas)
      defList.push(nextDef)
      issues.push(...defIssues)
    }
    return [defList, issues]
  }
}

/** This module holds the class for merging the schemas of a merge group (HED specification 3.1.2.4).
 *
 * A merge group is the list of schemas that share one namespace prefix. The group rules are decided first from
 * the schemas' headers: a schema listed twice is ignored, one schema may appear in only one version, every
 * library must be partnered with the same standard schema version, a listed standard schema must be that
 * version (it adds nothing), and an unpartnered library must be alone in its namespace. The library schemas are
 * then merged element by element: an element declared by one library only is added; an element declared by
 * several libraries must be declared identically (same attributes apart from inLibrary, same description, same
 * ancestor path, same "#" child), and then records every library that declares it.
 *
 * @module schema/schemaMerger
 */
import { IssueError } from '../issues/issues'
import { SchemaAttribute, SchemaTag, SchemaUnitClass, SchemaValueTag } from './entries'
import { PartneredSchema } from './containers'

export default class PartneredSchemaMerger {
  /**
   * The schemas listed for this merge group, in listed order.
   * @type {Schema[]}
   */
  sourceSchemas

  /**
   * The schemas to merge after the group rules are applied: the base first, then the other libraries.
   * @type {Schema[]}
   */
  members

  /**
   * The current source of data to be merged.
   * @type {Schema}
   */
  currentSource

  /**
   * The destination of data to be merged.
   * @type {Schema}
   */
  destination

  /**
   * Constructor.
   *
   * @param {Schema[]} sourceSchemas The schemas listed for this merge group.
   * @throws {IssueError} If the group breaks a merge group rule.
   */
  constructor(sourceSchemas) {
    this.sourceSchemas = sourceSchemas
    this.members = this._resolveGroup()
    this.destination = this.members.length > 1 ? new PartneredSchema(this.members) : this.members[0]
  }

  /**
   * Apply the merge group rules to the listed schemas.
   *
   * @returns {Schema[]} The schemas to merge: every library schema, or the single standard schema.
   * @throws {IssueError} If the group breaks a rule (every broken rule is listed in the one issue).
   * @private
   */
  _resolveGroup() {
    const describe = (schema) => (schema.library ? `${schema.library}_${schema.version}` : schema.version)
    // A schema listed twice is ignored.
    const seen = new Set()
    const members = this.sourceSchemas.filter((schema) => {
      const key = describe(schema)
      const isNew = !seen.has(key)
      seen.add(key)
      return isNew
    })
    const problems = []
    const versionsByLibrary = new Map()
    for (const schema of members) {
      versionsByLibrary.set(schema.library, [...(versionsByLibrary.get(schema.library) ?? []), schema.version])
    }
    for (const [library, versions] of versionsByLibrary) {
      if (versions.length > 1) {
        const what = library ? `library "${library}"` : 'the standard schema'
        problems.push(`different versions of ${what} in one merge group [${versions.join(', ')}]`)
      }
    }
    const libraries = members.filter((schema) => schema.library)
    const standards = members.filter((schema) => !schema.library)
    if (members.length > 1) {
      for (const schema of libraries) {
        if (!schema.withStandard) {
          problems.push(`unpartnered library schema "${describe(schema)}" must be alone in its namespace`)
        }
      }
    }
    const partners = [...new Set(libraries.map((schema) => schema.withStandard).filter(Boolean))].sort()
    if (partners.length > 1) {
      problems.push(`library schemas in one merge group have different partners [${partners.join(', ')}]`)
    }
    const partner = partners.length === 1 ? partners[0] : undefined
    for (const schema of standards) {
      if (partner !== undefined && schema.version !== partner) {
        problems.push(`standard schema "${schema.version}" differs from the group partner "${partner}"`)
      }
    }
    if (problems.length > 0) {
      IssueError.generateAndThrow('schemaGroupInvalid', {
        versions: this.sourceSchemas.map(describe).join(', '),
        problems: problems.join('; '),
      })
    }
    if (libraries.length === 0) {
      return [members[0]]
    }
    // A listed standard schema of the partner version adds nothing: every library file already contains it.
    return libraries
  }

  /**
   * Merge the schemas of the group.
   *
   * @returns {Schema} The merged schema (the base schema itself when there is nothing to merge into it).
   * @throws {IssueError} If an element is declared incompatibly by two libraries.
   */
  mergeSchemas() {
    for (const additionalSchema of this.members.slice(1)) {
      this.currentSource = additionalSchema
      this._mergeData()
    }
    return this.destination
  }

  /**
   * The source schema's tag collection.
   *
   * @return {SchemaEntryManager<SchemaTag>}
   */
  get sourceTags() {
    return this.currentSource.entries.tags
  }

  /**
   * The destination schema's tag collection.
   *
   * @returns {SchemaEntryManager<SchemaTag>}
   */
  get destinationTags() {
    return this.destination.entries.tags
  }

  /**
   * Merge one library schema into the destination, auxiliary sections before the tags that use them.
   * @private
   */
  _mergeData() {
    const source = this.currentSource.entries
    const destination = this.destination.entries
    this._mergeNamedEntries(source.properties, destination.properties, 'properties')
    this._mergeNamedEntries(source.attributes, destination.attributes, 'schema attributes')
    const addedModifiers = this._mergeNamedEntries(source.unitModifiers, destination.unitModifiers, 'unit modifiers')
    const addedUnits = this._mergeUnitClasses()
    if (addedModifiers > 0 || addedUnits > 0) {
      // Units build their accepted modified forms when constructed, against the modifiers of their own schema.
      // After the merge, every unit in the destination (the ones already there and the ones this library adds)
      // must know the merged set of modifiers, so the result does not depend on the merge order.
      for (const unitClass of destination.unitClasses.values()) {
        for (const unit of unitClass.units.values()) {
          unit.refreshModifiers(destination.unitModifiers)
        }
      }
    }
    this._mergeNamedEntries(source.valueClasses, destination.valueClasses, 'value classes')
    this._mergeTags()
  }

  /**
   * Merge the library-declared entries of a section that is keyed by name.
   *
   * @param {SchemaEntryManager} sourceEntries The source section.
   * @param {SchemaEntryManager} destinationEntries The destination section.
   * @param {string} sectionName The section name for messages.
   * @returns {number} The number of entries added to the destination.
   * @private
   */
  _mergeNamedEntries(sourceEntries, destinationEntries, sectionName) {
    let added = 0
    for (const entry of sourceEntries.values()) {
      if (entry.libraries.length === 0) {
        continue
      }
      const existing = destinationEntries.getEntry(entry.name)
      if (existing === undefined) {
        destinationEntries.addEntry(entry.name, entry)
        added++
      } else {
        this._checkCompatible(existing, entry, sectionName, this._entryDifferences(existing, entry))
      }
    }
    return added
  }

  /**
   * Merge the unit classes and their units.
   *
   * @returns {number} The number of units added to the destination (the units of new classes included).
   * @private
   */
  _mergeUnitClasses() {
    const destinationClasses = this.destination.entries.unitClasses
    let added = 0
    for (const unitClass of this.currentSource.entries.unitClasses.values()) {
      const target = destinationClasses.getEntry(unitClass.name)
      if (unitClass.libraries.length > 0 && target === undefined) {
        const copy = new SchemaUnitClass(
          unitClass.name,
          unitClass.booleanAttributes,
          unitClass.valueAttributes,
          new Map(unitClass.units),
        )
        copy.description = unitClass.description
        destinationClasses.addEntry(copy.name, copy)
        added += copy.units.size
        continue
      }
      if (unitClass.libraries.length > 0 && !PartneredSchemaMerger._isUnitClassPlaceholder(unitClass)) {
        // A redeclaration of an existing class; a bare one (inLibrary only) just adds units to it.
        this._checkCompatible(target, unitClass, 'unit classes', this._entryDifferences(target, unitClass))
      }
      if (target === undefined) {
        continue
      }
      for (const unit of unitClass.units.values()) {
        if (unit.libraries.length === 0) {
          continue
        }
        const existingUnit = target.units.get(unit.name)
        if (existingUnit === undefined) {
          target.addUnit(unit)
          added++
        } else {
          this._checkCompatible(existingUnit, unit, 'units', this._entryDifferences(existingUnit, unit))
        }
      }
    }
    return added
  }

  /**
   * Whether a unit class declaration only adds units to an existing class (inLibrary and nothing else).
   *
   * @param {SchemaUnitClass} unitClass The unit class declaration.
   * @returns {boolean} Whether it is a placeholder.
   * @private
   */
  static _isUnitClassPlaceholder(unitClass) {
    return (
      unitClass.booleanAttributeNames.size === 0 &&
      unitClass.valueAttributeNames.size === 1 &&
      unitClass.valueAttributeNames.has('inLibrary') &&
      unitClass.description === ''
    )
  }

  /**
   * Merge the library-declared tags.
   * @private
   */
  _mergeTags() {
    for (const tag of this.sourceTags.values()) {
      if (tag.libraries.length === 0) {
        continue
      }
      const existing = this.destinationTags.getEntry(tag.name.toLowerCase())
      if (existing === undefined) {
        this._checkRooting(tag)
        this._copyTagToSchema(tag)
        continue
      }
      const differences = this._entryDifferences(existing, tag)
      if (existing.longName.toLowerCase() !== tag.longName.toLowerCase()) {
        differences.push(`ancestor path differs ("${existing.longName}" vs "${tag.longName}")`)
      } else if (
        !(tag instanceof SchemaValueTag) &&
        (existing.valueTag !== undefined) !== (tag.valueTag !== undefined)
      ) {
        differences.push('"#" child present in only one declaration')
      }
      this._checkCompatible(existing, tag, 'tags', differences)
    }
  }

  /**
   * Check that an element already in the destination may be shared with the current source's declaration.
   *
   * @param {SchemaEntry} existing The destination's entry.
   * @param {SchemaEntry} entry The source's declaration.
   * @param {string} sectionName The section name for messages.
   * @param {string[]} differences The differences found between the two declarations.
   * @throws {IssueError} If the declarations differ, or the element cannot be shared at all.
   * @private
   */
  _checkCompatible(existing, entry, sectionName, differences) {
    const library = this.currentSource.library
    if (existing.libraries.length === 0) {
      differences.unshift('a library may not redeclare a standard schema element')
    } else if (existing.libraries.includes(library)) {
      differences.unshift('declared twice by the same library')
    }
    if (differences.length > 0) {
      IssueError.generateAndThrow('schemaElementConflict', {
        element: entry.name,
        section: sectionName,
        first: existing.libraries.length === 0 ? 'the standard schema' : existing.libraries.join(','),
        second: library,
        differences: differences.join('; '),
      })
    }
    existing.addLibrary(library)
  }

  /**
   * Describe how two declarations of the same-named element differ, ignoring inLibrary.
   *
   * @param {SchemaEntry} existing The destination's entry.
   * @param {SchemaEntry} entry The source's declaration.
   * @returns {string[]} The differences; empty when the declarations are compatible.
   * @private
   */
  _entryDifferences(existing, entry) {
    const differences = []
    if (existing.description !== entry.description) {
      differences.push('description differs')
    }
    const left = PartneredSchemaMerger._attributeSummary(existing)
    const right = PartneredSchemaMerger._attributeSummary(entry)
    if (left !== right) {
      differences.push(`attributes differ (${left} vs ${right})`)
    }
    return differences
  }

  /**
   * Summarize an entry's attributes (or properties) as a canonical string, ignoring inLibrary.
   *
   * @param {SchemaEntry} entry A schema entry.
   * @returns {string} The summary.
   * @private
   */
  static _attributeSummary(entry) {
    if (entry instanceof SchemaAttribute) {
      return `{${[...entry.propertyNames].sort().join(', ')}}`
    }
    const parts = [...(entry.booleanAttributeNames ?? [])].sort()
    for (const [name, values] of [...(entry.valueAttributeNames ?? [])].sort(([a], [b]) => (a < b ? -1 : 1))) {
      if (name !== 'inLibrary') {
        parts.push(`${name}=${[...values].sort().join('|')}`)
      }
    }
    if (entry instanceof SchemaTag && entry.hasUnitClasses) {
      parts.push(`unitClass=${entry.unitClasses.map((unitClass) => unitClass.name).join('|')}`)
    }
    return `{${parts.join(', ')}}`
  }

  /**
   * Check that a rooted tag sits under its anchor.
   *
   * @param {SchemaTag} tag The tag to check.
   * @private
   */
  _checkRooting(tag) {
    const rootedTagShortName = tag.getAttributeValue('rooted')
    if (rootedTagShortName) {
      const parentTag = tag.parent
      if (parentTag?.name?.toLowerCase() !== rootedTagShortName?.toLowerCase()) {
        IssueError.generateAndThrowInternalError(`Node ${tag.name} is improperly rooted.`)
      }
    }
  }

  /**
   * Copy a tag from one schema to another.
   *
   * @param {SchemaTag} tag The tag to copy.
   * @private
   */
  _copyTagToSchema(tag) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    for (const attribute of tag.booleanAttributes) {
      booleanAttributes.add(this.destination.entries.attributes.getEntry(attribute.name) ?? attribute)
    }
    for (const [key, value] of tag.valueAttributes) {
      valueAttributes.set(this.destination.entries.attributes.getEntry(key.name) ?? key, value)
    }

    /**
     * @type {SchemaUnitClass[]}
     */
    const unitClasses = tag.unitClasses.map(
      (unitClass) => this.destination.entries.unitClasses.getEntry(unitClass.name) ?? unitClass,
    )

    let newTag
    if (tag instanceof SchemaValueTag) {
      newTag = new SchemaValueTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    } else {
      newTag = new SchemaTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    }
    newTag.description = tag.description
    const destinationParentTag = this.destinationTags.getEntry(tag.parent?.name?.toLowerCase())
    if (destinationParentTag) {
      newTag.parent = destinationParentTag
      if (newTag instanceof SchemaValueTag) {
        newTag.parent.valueTag = newTag
      }
    }

    this.destinationTags.addEntry(newTag.name.toLowerCase(), newTag)
  }
}

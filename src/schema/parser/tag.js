import flattenDeep from 'lodash/flattenDeep'
import zip from 'lodash/zip'

import { getElementName } from '../xmlType'
import { SchemaEntryWithAttributesParser } from './schemaEntry'

import SchemaTag from '../entries/tag'
import SchemaValueTag from '../entries/valueTag'

import { IssueError } from '../../issues/issues'

const lc = (str) => str.toLowerCase()

/**
 * A parser for tags.
 */
export default class TagParser extends SchemaEntryWithAttributesParser {
  /**
   * The unit classes.
   * @type {SchemaEntryManager<SchemaUnitClass>}
   */
  unitClasses

  /**
   * The value classes.
   * @type {SchemaEntryManager<SchemaValueClass>}
   */
  valueClasses

  /**
   * The tags of the schema being parsed, keyed by lowercase short name.
   * @type {Map<string, SchemaTag>}
   */
  schemaTags

  /**
   * Constructor.
   *
   * @param {HedSchemaXMLCollection} xmlCollection A collection of XML data for a given prefix.
   * @param {SchemaEntryManager<SchemaAttribute>} attributes The parsed schema attributes.
   * @param {SchemaEntryManager<SchemaUnitClass>} unitClasses The parsed unit classes.
   * @param {SchemaEntryManager<SchemaValueClass>} valueClasses The parsed value classes.
   */
  constructor(xmlCollection, attributes, unitClasses, valueClasses) {
    super(xmlCollection, attributes)
    this.unitClasses = unitClasses
    this.valueClasses = valueClasses
  }

  /**
   * Parse the schema's tags.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @protected
   */
  _parseSchema(schemaXml) {
    const tags = this.getAllTags(schemaXml)
    const shortTags = this.getShortTags(tags)
    const parentMap = this.generateParentMap(shortTags)
    const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseAttributeElements(
      tags.keys(),
      (element) => shortTags.get(element) ?? '',
    )
    // A library never extends a tag of its partner by naming it again, so every tag of an unmerged file is marked;
    // one that redeclares a partner tag is then rejected as in the merged form (addEntry).
    this._addInLibrary(schemaXml, valueAttributeDefinitions, () => false)
    this.processRootedElements(parentMap, valueAttributeDefinitions)

    const tagUnitClassDefinitions = this.processTagClasses(valueAttributeDefinitions, 'unitClass', this.unitClasses)
    const tagValueClassDefinitions = this.processTagClasses(
      valueAttributeDefinitions,
      'valueClass',
      this.valueClasses,
      false,
    )
    this.processRecursiveAttributes(parentMap, booleanAttributeDefinitions)

    this.createSchemaTags(
      booleanAttributeDefinitions,
      valueAttributeDefinitions,
      descriptions,
      tagUnitClassDefinitions,
      tagValueClassDefinitions,
      parentMap,
    )
    this.mergeSchemaEntries()
  }

  /**
   * Retrieve all the tags in the schema.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @returns {Map<Object, string>} The tag elements and their names, in document order.
   * @private
   */
  getAllTags(schemaXml) {
    const nodeRoot = schemaXml.HED.schema
    const tagElements = []
    const tagElementChildren = nodeRoot.node ?? []
    tagElements.push(...flattenDeep(tagElementChildren.map((child) => this.getAllChildTags(child, false))))
    const tags = tagElements.map((element) => getElementName(element))
    return new Map(zip(tagElements, tags))
  }

  /**
   * Retrieve an element and its descendant tags, in document order.
   *
   * @param {Object} parentElement The element.
   * @param {boolean} excludeTakeValueTags Whether to leave out "#" elements and their descendants.
   * @returns {Object[]} The elements.
   * @private
   */
  getAllChildTags(parentElement, excludeTakeValueTags = true) {
    if (excludeTakeValueTags && getElementName(parentElement) === '#') {
      return []
    }
    const childTags = [parentElement]
    const tagElementChildren = parentElement.node ?? []
    return childTags.concat(
      flattenDeep(tagElementChildren.map((child) => this.getAllChildTags(child, excludeTakeValueTags))),
    )
  }

  /**
   * Generate the map from tag elements to shortened tag names ("Parent-#" for a "#" child).
   *
   * @param {Map<Object, string>} tags The map from tag elements to tag strings.
   * @returns {Map<Object, string>} The map from tag elements to shortened tag names.
   * @private
   */
  getShortTags(tags) {
    const shortTags = new Map()
    for (const tagElement of tags.keys()) {
      const shortKey =
        getElementName(tagElement) === '#' ? TagParser.getParentTagName(tagElement) + '-#' : getElementName(tagElement)
      shortTags.set(tagElement, shortKey)
    }
    return shortTags
  }

  /**
   * The name of a tag element's parent tag.
   *
   * @param {Object} tagElement The tag element.
   * @returns {string} The parent's name, or '' for a top-level tag.
   * @private
   */
  static getParentTagName(tagElement) {
    const parentTagElement = tagElement.$parent
    if (parentTagElement) {
      return getElementName(parentTagElement)
    } else {
      return ''
    }
  }

  /**
   * Generate a map from each lowercase tag name to its parent's lowercase tag name.
   *
   * @param {Map<Object, string>} shortTags The map from tag elements to shortened tag names.
   * @returns {Map<string, string>} The parent map (top-level tags are absent).
   * @private
   */
  generateParentMap(shortTags) {
    const parentMap = new Map()
    for (const tagElement of shortTags.keys()) {
      if (!tagElement.$parent) {
        continue
      }

      const tagName = lc(shortTags.get(tagElement) ?? '')
      const parentTagName = lc(shortTags.get(tagElement.$parent) ?? '')
      parentMap.set(tagName, parentTagName)
    }
    return parentMap
  }

  /**
   * Place top-level tags with a "rooted" attribute under their anchor (unmerged library files list them at the
   * top level; merged files already place them).
   *
   * @param {Map<string, string>} parentMap The parent map, modified in place.
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by short name.
   * @throws {IssueError} If a rooted attribute has more than one value.
   * @private
   */
  processRootedElements(parentMap, valueAttributeDefinitions) {
    const rootedAttribute = this.attributes.getEntry('rooted')
    if (!rootedAttribute) {
      return
    }
    for (const [shortName, valueAttributes] of valueAttributeDefinitions) {
      const root = valueAttributes.get(rootedAttribute)
      if (root !== undefined && !parentMap.has(lc(shortName))) {
        if (root.length !== 1) {
          IssueError.generateAndThrow('invalidSchema', {
            error: `Tag "${shortName}" has a rooted attribute with several values`,
          })
        }
        parentMap.set(lc(shortName), lc(root[0]))
      }
    }
  }

  /**
   * Resolve a class-valued tag attribute (unitClass or valueClass) to the class entries.
   *
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by short name.
   * @param {string} attributeName The attribute name.
   * @param {SchemaEntryManager} classes The class entries.
   * @param {boolean} removeAttribute Whether to remove the attribute from the tag's value attributes.
   * @returns {Map<string, Array>} The class entries of each tag that has the attribute, by short name.
   * @private
   */
  processTagClasses(valueAttributeDefinitions, attributeName, classes, removeAttribute = true) {
    const attribute = this.attributes.getEntry(attributeName)
    const tagClassDefinitions = new Map()
    if (!attribute) {
      return tagClassDefinitions
    }

    for (const [tagName, valueAttributes] of valueAttributeDefinitions) {
      const classNames = valueAttributes.get(attribute)
      if (classNames === undefined) {
        continue
      }
      // A class name without an entry (anyUnits before HED 8.5.0) is kept as undefined.
      tagClassDefinitions.set(
        tagName,
        classNames.map((className) => classes.getEntry(className)),
      )
      if (removeAttribute) {
        valueAttributes.delete(attribute)
      }
    }

    return tagClassDefinitions
  }

  /**
   * Propagate recursive boolean attributes to descendant tags.
   *
   * Descendants follow the parent map, which includes the tags placed by a "rooted" attribute, so a tag whose parent
   * an earlier schema of the group declared (a rooted tag of an unmerged library) inherits from that parent tag.
   * "#" children inherit nothing.
   *
   * @param {Map<string, string>} parentMap The parent map (lowercase short names), with the rooted tags placed.
   * @param {Map<string, Set<SchemaAttribute>>} booleanAttributeDefinitions The boolean attributes by short name,
   *     modified in place.
   * @throws {IssueError} If two tag names differ only by case.
   * @private
   */
  processRecursiveAttributes(parentMap, booleanAttributeDefinitions) {
    const recursiveAttributes = new Set(this.attributes.filter(([, attribute]) => attribute.recursive).values())
    const namesByKey = new Map([...booleanAttributeDefinitions.keys()].map((name) => [lc(name), name]))
    // Names that differ only by case would make a tag its own parent ("Item" under "Item"); report them as
    // createSchemaTags does, before walking the parent map.
    if (namesByKey.size !== booleanAttributeDefinitions.size) {
      IssueError.generateAndThrow('duplicateTagsInSchema')
    }
    const passedDown = new Map()
    // The recursive attributes a tag passes to its children: its own and those it inherits.
    const passedDownBy = (key) => {
      if (passedDown.has(key)) {
        return passedDown.get(key)
      }
      // Marked before recursing, so a cycle in the parent map (rooted tags anchored on each other) ends.
      passedDown.set(key, new Set())
      const name = namesByKey.get(key)
      let attributes
      if (name === undefined) {
        // A parent from an earlier schema of the group already carries everything it inherited.
        attributes = this.entryTypeMap.get(key)?.booleanAttributes.intersection(recursiveAttributes) ?? new Set()
      } else {
        const own = booleanAttributeDefinitions.get(name).intersection(recursiveAttributes)
        const parentKey = parentMap.get(key)
        attributes = parentKey === undefined ? own : own.union(passedDownBy(parentKey))
      }
      passedDown.set(key, attributes)
      return attributes
    }
    for (const name of booleanAttributeDefinitions.keys()) {
      const parentKey = parentMap.get(lc(name))
      if (parentKey !== undefined && !name.endsWith('-#')) {
        booleanAttributeDefinitions.set(name, booleanAttributeDefinitions.get(name).union(passedDownBy(parentKey)))
      }
    }
  }

  /**
   * Create the {@link SchemaTag} objects of the schema being parsed.
   *
   * A parent that an earlier schema of the group already contributed is reused, so that the tags of every schema
   * hang off one tree; a "#" child is attached to its own schema's parent, which is the same object or an equivalent
   * one that the merge discards.
   *
   * @param {Map<string, Set<SchemaAttribute>>} booleanAttributeDefinitions The boolean attributes by short name.
   * @param {Map<string, Map<SchemaAttribute, string[]>>} valueAttributeDefinitions The value attributes by short name.
   * @param {Map<string, string|undefined>} descriptions The descriptions by short name.
   * @param {Map<string, SchemaUnitClass[]>} tagUnitClassDefinitions The unit classes by short name.
   * @param {Map<string, SchemaValueClass[]>} tagValueClassDefinitions The value classes by short name.
   * @param {Map<string, string>} parentMap The parent map.
   * @throws {IssueError} If two tags of the schema share a name, or a "#" child is added to an earlier schema's tag.
   * @private
   */
  createSchemaTags(
    booleanAttributeDefinitions,
    valueAttributeDefinitions,
    descriptions,
    tagUnitClassDefinitions,
    tagValueClassDefinitions,
    parentMap,
  ) {
    this.schemaTags = new Map()

    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const key = lc(name)
      if (this.schemaTags.has(key)) {
        IssueError.generateAndThrow('duplicateTagsInSchema')
      }
      const booleanAttributes = booleanAttributeDefinitions.get(name) ?? new Set()
      const description = descriptions.get(name)
      const unitClasses = tagUnitClassDefinitions.get(name) ?? []
      const valueClasses = tagValueClassDefinitions.get(name) ?? []
      const parentTagName = parentMap.get(key)
      const isValueTag = name.endsWith('-#')
      let parentTag
      if (parentTagName !== undefined) {
        parentTag = isValueTag
          ? (this.schemaTags.get(parentTagName) ?? this.entryTypeMap.get(parentTagName))
          : (this.entryTypeMap.get(parentTagName) ?? this.schemaTags.get(parentTagName))
      }

      if (isValueTag) {
        if (this.entryTypeMap.has(parentTagName) && !this.entryTypeMap.has(key)) {
          // A "#" child added to a tag that an earlier schema declared without one.
          IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: name.replace('-#', '/#') })
        }
        this.schemaTags.set(
          key,
          new SchemaValueTag(
            name,
            description,
            parentTag,
            booleanAttributes,
            valueAttributes,
            unitClasses,
            valueClasses,
          ),
        )
      } else {
        this.schemaTags.set(
          key,
          new SchemaTag(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses),
        )
      }
    }
  }

  /**
   * Merge the per-schema tag map into the main tag map.
   * @private
   */
  mergeSchemaEntries() {
    for (const [shortTagName, newTag] of this.schemaTags) {
      this.addEntry(shortTagName, newTag)
    }
  }

  /**
   * Add a new tag while checking for duplicates.
   *
   * Override of {@link SchemaEntryParser.addEntry} to change the issue message.
   *
   * @param {string} shortTagName The short tag name.
   * @param {SchemaTag} newTag The new tag object to add.
   * @throws {IssueError} If a library redeclares a standard tag, or two schemas declare a tag incompatibly.
   */
  addEntry(shortTagName, newTag) {
    const lowercaseName = lc(shortTagName)
    if (this.entryTypeMap.has(lowercaseName)) {
      const existingTag = this.entryTypeMap.get(lowercaseName)
      if (newTag.hasAttribute('inLibrary') && !existingTag.hasAttribute('inLibrary')) {
        IssueError.generateAndThrow('lazyPartneredSchemaOverloadsStandardTag', { tag: newTag.name.replace('-#', '/#') })
      }
      if (!newTag.equivalent(existingTag)) {
        IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: newTag.name.replace('-#', '/#') })
      }
    } else {
      this.entryTypeMap.set(lowercaseName, newTag)
    }
  }
}

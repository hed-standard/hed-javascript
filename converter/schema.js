import { Schemas } from '../common/schema/types'
import { buildSchema as validatorBuildSchema } from '../validator/schema/init'

import { Mapping, TagEntry } from './types'
import { getTagName } from '../utils/hedStrings'
import { generateIssue, IssueError } from '../common/issues/issues'

/**
 * Build a short-long mapping object from schema XML data.
 *
 * @param {SchemaEntries} entries The schema XML data.
 * @return {Mapping} The mapping object.
 */
export const buildMappingObject = function (entries) {
  /**
   * @type {Map<string, TagEntry>}
   */
  const nodeData = new Map()
  /**
   * @type {Set<string>}
   */
  const takesValueTags = new Set()
  /**
   * @type {SchemaEntryManager<SchemaTag>}
   */
  const schemaTags = entries.definitions.get('tags')
  for (const tag of schemaTags.values()) {
    const shortTag = getTagName(tag.name)
    if (shortTag === '#') {
      takesValueTags.add(getTagName(tag.parent.name).toLowerCase())
      continue
    }
    const tagObject = new TagEntry(shortTag, tag.name)
    if (!nodeData.has(shortTag)) {
      nodeData.set(shortTag.toLowerCase(), tagObject)
    } else {
      throw new IssueError(generateIssue('duplicateTagsInSchema', {}))
    }
  }
  for (const tag of takesValueTags) {
    nodeData.get(tag).takesValue = true
  }
  return new Mapping(nodeData)
}

/**
 * Build a schema container object containing a short-long mapping from a base schema version or path description.
 *
 * @param {{path: string?, version: string?}} schemaDef The description of which schema to use.
 * @return {Promise<never>|Promise<Schemas>} The schema container object or an error.
 * @deprecated
 */
export const buildSchema = (schemaDef) => validatorBuildSchema(schemaDef)

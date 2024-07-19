import { generateIssue, IssueError } from '../common/issues/issues'
import { getTagSlashIndices } from '../utils/hedStrings'

/**
 * Retrieve the {@link SchemaTag} object for a tag specification.
 *
 * @param {TagSpec} tagSpec The tag specification to convert.
 * @param {Schemas} hedSchemas The HED schema collection.
 * @returns {[SchemaTag, string]} The schema's corresponding tag object and the remainder of the tag string.
 */
export default function convertTagSpecToSchemaTag(tagSpec, hedSchemas) {
  const tagString = tagSpec.tag
  const tagLevels = tagString.split('/')
  const tagSlashes = getTagSlashIndices(tagString)
  const tagMapping = hedSchemas.getSchema(tagSpec.library).entries.tags
  let schemaTag1 = tagMapping.getEntry(tagLevels[0].toLowerCase())
  if (!schemaTag1) {
    throw new IssueError(generateIssue('invalidTag', { tag: tagString, bounds: tagSpec.bounds }))
  } else if (tagLevels.length === 1) {
    return [schemaTag1, '']
  }
  for (let i = 1; i < tagLevels.length; i++) {
    if (schemaTag1.valueTag) {
      return [schemaTag1.valueTag, tagLevels.slice(i).join('/')]
    }
    const schemaTag2 = tagMapping.getEntry(tagLevels[i].toLowerCase())
    if (!schemaTag2) {
      return [schemaTag1, tagLevels.slice(i).join('/')]
    }
    if (schemaTag2.parent !== schemaTag1) {
      throw new IssueError(
        generateIssue('invalidParentNode', {
          tag: tagLevels[i],
          parentTag: schemaTag2.longName,
          bounds: [tagSpec.bounds[0] + tagSlashes[i - 1] + 1, tagSpec.bounds[0] + (tagSlashes[i] ?? tagString.length)],
        }),
      )
    }
    schemaTag1 = schemaTag2
  }
  return [schemaTag1, '']
}

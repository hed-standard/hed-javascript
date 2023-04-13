import lt from 'semver/functions/lt'

import { ParsedHed3Tag } from '../validator/parser/parsedHedTag'

/**
 * Determine the HED generation for a base schema version number.
 *
 * @param {string} version A HED base schema version number.
 * @return {number} The HED generation the base schema belongs to.
 */
export const getGenerationForSchemaVersion = function (version) {
  if (lt(version, '4.0.0')) {
    return 1
  } else if (lt(version, '8.0.0-alpha')) {
    return 2
  } else {
    return 3
  }
}

export const mergeParsingIssues = function (previousIssues, currentIssues) {
  for (const key of Object.keys(currentIssues)) {
    previousIssues[key] =
      previousIssues[key] !== undefined ? previousIssues[key].concat(currentIssues[key]) : currentIssues[key]
  }
}

/**
 * Get the parent tag objects for a given short tag.
 *
 * @param {Schemas} hedSchemas The HED schema collection.
 * @param {string} shortTag A short-form HED 3 tag.
 * @return {Map<Schema, ParsedHedTag>} A Map mapping a {@link Schema} to a {@link ParsedHedTag} object representing the full tag.
 */
export const getParsedParentTags = function (hedSchemas, shortTag) {
  const parentTags = new Map()
  for (const [schemaNickname, schema] of hedSchemas.schemas) {
    const parentTag = new ParsedHed3Tag(shortTag, shortTag, [0, shortTag.length - 1], hedSchemas, schemaNickname)
    parentTags.set(schema, parentTag)
    parentTag.conversionIssues = parentTag.conversionIssues.filter((issue) => issue.internalCode !== 'invalidTag')
  }
  return parentTags
}

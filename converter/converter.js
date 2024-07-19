import { HedStringTokenizer } from '../parser/tokenizer'
import { parseHedString } from '../parser/main'
import TagConverter from '../parser/converter'

const doubleSlashPattern = /[\s/]*\/+[\s/]*/g

/**
 * Remove extra slashes and spaces from a HED string.
 *
 * @param {string} hedString The HED string to clean.
 * @returns {string} The cleaned HED string.
 */
export const removeSlashesAndSpaces = function (hedString) {
  return hedString.replace(doubleSlashPattern, '/')
}

/**
 * Convert a HED tag to long form.
 *
 * The seemingly redundant code for duplicate tag entries (which are errored out
 * on for HED 3 schemas) allow for similar HED 2 validation with minimal code
 * duplication.
 *
 * @param {Schemas} hedSchemas The schema object containing a short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {string} hedString The full HED string (for error messages).
 * @param {number} offset The offset of this tag within the HED string.
 * @returns {[string, Issue[]]} The long-form tag and any issues.
 */
export const convertTagToLong = function (hedSchemas, hedTag, hedString, offset) {
  const tokenizer = new HedStringTokenizer(hedTag)
  const [tagSpecs, groupSpecs, issues] = tokenizer.tokenize()
  const flattenedIssues = Object.values(issues).flat()
  if (flattenedIssues.length > 0) {
    return [hedTag, flattenedIssues]
  }
  try {
    const [schemaTag, remainder] = new TagConverter(tagSpecs[0], hedSchemas).convert()
    return [schemaTag.longExtend(remainder), []]
  } catch (issueError) {
    return [hedTag, [issueError.issue]]
  }
}

/**
 * Convert a HED tag to short form.
 *
 * @param {Hed3Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {string} hedString The full HED string (for error messages).
 * @param {number} offset The offset of this tag within the HED string.
 * @returns {[string, Issue[]]} The short-form tag and any issues.
 */
export const convertTagToShort = function (hedSchemas, hedTag, hedString, offset) {
  const tokenizer = new HedStringTokenizer(hedTag)
  const [tagSpecs, groupSpecs, issues] = tokenizer.tokenize()
  const flattenedIssues = Object.values(issues).flat()
  if (flattenedIssues.length > 0) {
    return [hedTag, flattenedIssues]
  }
  try {
    const [schemaTag, remainder] = new TagConverter(tagSpecs[0], hedSchemas).convert()
    return [schemaTag.extend(remainder), []]
  } catch (issueError) {
    return [hedTag, [issueError.issue]]
  }
}

/**
 * Convert a HED tag to long form.
 *
 * The seemingly redundant code for duplicate tag entries (which are errored out
 * on for HED 3 schemas) allow for similar HED 2 validation with minimal code
 * duplication.
 *
 * @param {Hed3Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {string} hedString The full HED string (for error messages).
 * @param {number} offset The offset of this tag within the HED string.
 * @returns {[string, Issue[]]} The long-form tag and any issues.
 */
/*export const convertTagToLong = function (schema, hedTag, hedString, offset) {
  const schemaTags = schema.entries.tags

  if (hedTag.startsWith('/')) {
    hedTag = hedTag.slice(1)
  }
  if (hedTag.endsWith('/')) {
    hedTag = hedTag.slice(0, -1)
  }

  const cleanedTag = hedTag.toLowerCase()
  const splitTag = cleanedTag.split('/')

  /!**
   * @type {SchemaTag}
   *!/
  let foundTagEntry = null
  let takesValueTag = false
  let endingIndex = 0
  let foundUnknownExtension = false
  let foundEndingIndex = 0

  /!**
   * Generate an issue for an invalid parent node.
   *
   * @param {SchemaTag[]} schemaTags The invalid schema tags.
   * @param {number} startingIndex The starting index in the string.
   * @param {number} endingIndex The ending index in the string.
   * @returns {[string, Issue[]]} The original HED string and the issue.
   *!/
  const generateParentNodeIssue = (schemaTags, startingIndex, endingIndex) => {
    return [
      hedTag,
      [
        generateIssue(
          'invalidParentNode',
          hedString,
          {
            parentTag:
              schemaTags.length > 1
                ? schemaTags.map((tagEntry) => {
                    return tagEntry.longName
                  })
                : schemaTags[0].longName,
          },
          [startingIndex + offset, endingIndex + offset],
        ),
      ],
    ]
  }

  for (const tag of splitTag) {
    if (endingIndex !== 0) {
      endingIndex++
    }
    const startingIndex = endingIndex
    endingIndex += tag.length

    const tagEntries = castArray(schemaTags.getEntry(tag))

    if (foundUnknownExtension) {
      if (schemaTags.hasEntry(tag)) {
        return generateParentNodeIssue(tagEntries, startingIndex, endingIndex)
      } else {
        continue
      }
    }
    if (!schemaTags.hasEntry(tag)) {
      if (foundTagEntry === null) {
        return [hedTag, [generateIssue('invalidTag', hedString, {}, [startingIndex + offset, endingIndex + offset])]]
      }

      foundUnknownExtension = true
      continue
    }

    let tagFound = false
    for (const tagEntry of tagEntries) {
      const tagString = tagEntry.longName.toLowerCase()
      const mainHedPortion = cleanedTag.slice(0, endingIndex)

      if (tagString.endsWith(mainHedPortion)) {
        tagFound = true
        foundEndingIndex = endingIndex
        foundTagEntry = tagEntry
        if (tagEntry.valueTag) {
          takesValueTag = true
        }
        break
      }
    }
    if (!tagFound && !takesValueTag) {
      return generateParentNodeIssue(tagEntries, startingIndex, endingIndex)
    }
  }

  const remainder = hedTag.slice(foundEndingIndex)
  const longTagString = foundTagEntry.longName + remainder
  return [longTagString, []]
}*/

/**
 * Convert a HED tag to short form.
 *
 * @param {Hed3Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {string} hedString The full HED string (for error messages).
 * @param {number} offset The offset of this tag within the HED string.
 * @returns {[string, Issue[]]} The short-form tag and any issues.
 */
/*export const convertTagToShort = function (schema, hedTag, hedString, offset) {
  const schemaTags = schema.entries.tags

  if (hedTag.startsWith('/')) {
    hedTag = hedTag.slice(1)
  }
  if (hedTag.endsWith('/')) {
    hedTag = hedTag.slice(0, -1)
  }

  const cleanedTag = hedTag.toLowerCase()
  const splitTag = cleanedTag.split('/')
  splitTag.reverse()

  /!**
   * @type {SchemaTag}
   *!/
  let foundTagEntry = null
  let index = hedTag.length
  let lastFoundIndex = index

  for (const tag of splitTag) {
    if (schemaTags.hasEntry(tag)) {
      foundTagEntry = schemaTags.getEntry(tag)
      lastFoundIndex = index
      index -= tag.length
      break
    }

    lastFoundIndex = index
    index -= tag.length

    if (index !== 0) {
      index--
    }
  }

  if (foundTagEntry === null) {
    return [hedTag, [generateIssue('invalidTag', hedString, {}, [index + offset, lastFoundIndex + offset])]]
  }

  const mainHedPortion = cleanedTag.slice(0, lastFoundIndex)
  const tagString = foundTagEntry.longName.toLowerCase()
  if (!tagString.endsWith(mainHedPortion)) {
    return [
      hedTag,
      [
        generateIssue('invalidParentNode', hedString, { parentTag: foundTagEntry.longName }, [
          index + offset,
          lastFoundIndex + offset,
        ]),
      ],
    ]
  }

  const remainder = hedTag.slice(lastFoundIndex)
  const shortTagString = foundTagEntry.name + remainder
  return [shortTagString, []]
}*/

/**
 * Convert a partial HED string to long form.
 *
 * This is for the internal string parsing for the validation side.
 *
 * @param {Hed3Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} partialHedString The partial HED string to convert to long form.
 * @param {string} fullHedString The full HED string.
 * @param {number} offset The offset of the partial HED string within the full string.
 * @returns {[string, Issue[]]} The converted string and any issues.
 */
/*export const convertPartialHedStringToLong = function (schema, partialHedString, fullHedString, offset) {
  let issues = []

  const hedString = removeSlashesAndSpaces(partialHedString)

  if (hedString === '') {
    issues.push(generateIssue('emptyTagFound', ''))
    return [hedString, issues]
  }

  const hedTags = splitHedString(hedString)
  let finalString = ''

  for (const [isHedTag, [startPosition, endPosition]] of hedTags) {
    const tag = hedString.slice(startPosition, endPosition)
    if (isHedTag) {
      const [shortTagString, singleError] = convertTagToLong(schema, tag, fullHedString, startPosition + offset)
      issues = issues.concat(singleError)
      finalString += shortTagString
    } else {
      finalString += tag
    }
  }

  return [finalString, issues]
}*/

/**
 * Convert a HED string.
 *
 * @param {Schemas} hedSchemas The HED schema collection.
 * @param {string} hedString The HED tag to convert.
 * @param {boolean} long Whether the tags should be in long form.
 * @returns {[string, Issue[]]} The converted string and any issues.
 */
const convertHedString = function (hedSchemas, hedString, long) {
  const [parsedString, issues] = parseHedString(hedString, hedSchemas)
  const convertedString = parsedString.format(long)
  return [convertedString, Object.values(issues).flat()]
}

/**
 * Convert a HED string to long form.
 *
 * @param {Schemas} schemas The schema container object containing short-to-long mappings.
 * @param {string} hedString The HED tag to convert.
 * @returns {[string, Issue[]]} The long-form string and any issues.
 * @deprecated
 */
export const convertHedStringToLong = function (schemas, hedString) {
  return convertHedString(schemas, hedString, true)
}

/**
 * Convert a HED string to short form.
 *
 * @param {Schemas} schemas The schema container object containing short-to-long mappings.
 * @param {string} hedString The HED tag to convert.
 * @returns {[string, Issue[]]} The short-form string and any issues.
 * @deprecated
 */
export const convertHedStringToShort = function (schemas, hedString) {
  return convertHedString(schemas, hedString, false)
}

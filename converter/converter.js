import castArray from 'lodash/castArray'

import { TagEntry } from './types'
import generateIssue from './issues'
import splitHedString from './splitHedString'

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
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {string} hedString The full HED string (for error messages).
 * @param {number} offset The offset of this tag within the HED string.
 * @returns {[string, Issue[]]} The long-form tag and any issues.
 */
export const convertTagToLong = function (schema, hedTag, hedString, offset) {
  const mapping = schema.mapping

  if (hedTag.startsWith('/')) {
    hedTag = hedTag.slice(1)
  }
  if (hedTag.endsWith('/')) {
    hedTag = hedTag.slice(0, -1)
  }

  const cleanedTag = hedTag.toLowerCase()
  const splitTag = cleanedTag.split('/')

  /**
   * @type {TagEntry}
   */
  let foundTagEntry = null
  let takesValueTag = false
  let endingIndex = 0
  let foundUnknownExtension = false
  let foundEndingIndex = 0

  const generateParentNodeIssue = (tagEntries, startingIndex, endingIndex) => {
    return [
      hedTag,
      [
        generateIssue(
          'invalidParentNode',
          hedString,
          {
            parentTag:
              tagEntries.length > 1
                ? tagEntries.map((tagEntry) => {
                    return tagEntry.longTag
                  })
                : tagEntries[0].longTag,
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

    const tagEntries = castArray(mapping.shortToTags.get(tag))

    if (foundUnknownExtension) {
      if (mapping.shortToTags.has(tag)) {
        return generateParentNodeIssue(tagEntries, startingIndex, endingIndex)
      } else {
        continue
      }
    }
    if (!mapping.shortToTags.has(tag)) {
      if (foundTagEntry === null) {
        return [hedTag, [generateIssue('invalidTag', hedString, {}, [startingIndex + offset, endingIndex + offset])]]
      }

      foundUnknownExtension = true
      continue
    }

    let tagFound = false
    for (const tagEntry of tagEntries) {
      const tagString = tagEntry.longFormattedTag
      const mainHedPortion = cleanedTag.slice(0, endingIndex)

      if (tagString.endsWith(mainHedPortion)) {
        tagFound = true
        foundEndingIndex = endingIndex
        foundTagEntry = tagEntry
        if (tagEntry.takesValue) {
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
  const longTagString = foundTagEntry.longTag + remainder
  return [longTagString, []]
}

/**
 * Convert a HED tag to short form.
 *
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {string} hedString The full HED string (for error messages).
 * @param {number} offset The offset of this tag within the HED string.
 * @returns {[string, Issue[]]} The short-form tag and any issues.
 */
export const convertTagToShort = function (schema, hedTag, hedString, offset) {
  const mapping = schema.mapping

  if (hedTag.startsWith('/')) {
    hedTag = hedTag.slice(1)
  }
  if (hedTag.endsWith('/')) {
    hedTag = hedTag.slice(0, -1)
  }

  const cleanedTag = hedTag.toLowerCase()
  const splitTag = cleanedTag.split('/')
  splitTag.reverse()

  /**
   * @type {TagEntry}
   */
  let foundTagEntry = null
  let index = hedTag.length
  let lastFoundIndex = index

  for (const tag of splitTag) {
    if (mapping.shortToTags.has(tag)) {
      foundTagEntry = mapping.shortToTags.get(tag)
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
  const tagString = foundTagEntry.longFormattedTag
  if (!tagString.endsWith(mainHedPortion)) {
    return [
      hedTag,
      [
        generateIssue('invalidParentNode', hedString, { parentTag: foundTagEntry.longTag }, [
          index + offset,
          lastFoundIndex + offset,
        ]),
      ],
    ]
  }

  const remainder = hedTag.slice(lastFoundIndex)
  const shortTagString = foundTagEntry.shortTag + remainder
  return [shortTagString, []]
}

/**
 * Convert a partial HED string to long form.
 *
 * This is for the internal string parsing for the validation side.
 *
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} partialHedString The partial HED string to convert to long form.
 * @param {string} fullHedString The full HED string.
 * @param {number} offset The offset of the partial HED string within the full string.
 * @returns {[string, Issue[]]} The converted string and any issues.
 */
export const convertPartialHedStringToLong = function (schema, partialHedString, fullHedString, offset) {
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
}

/**
 * Convert a HED string.
 *
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedString The HED tag to convert.
 * @param {function (Schema, string, string, number): [string, Issue[]]} conversionFn The conversion function for a tag.
 * @returns {[string, Issue[]]} The converted string and any issues.
 */
const convertHedString = function (schema, hedString, conversionFn) {
  let issues = []

  hedString = removeSlashesAndSpaces(hedString)

  if (hedString === '') {
    issues.push(generateIssue('emptyTagFound', ''))
    return [hedString, issues]
  }

  const hedTags = splitHedString(hedString)
  let finalString = ''

  for (const [isHedTag, [startPosition, endPosition]] of hedTags) {
    const tag = hedString.slice(startPosition, endPosition)
    if (isHedTag) {
      const [shortTagString, singleError] = conversionFn(schema, tag, hedString, startPosition)
      issues = issues.concat(singleError)
      finalString += shortTagString
    } else {
      finalString += tag
    }
  }

  return [finalString, issues]
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
  return convertHedString(schemas.baseSchema, hedString, convertTagToLong)
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
  return convertHedString(schemas.baseSchema, hedString, convertTagToShort)
}

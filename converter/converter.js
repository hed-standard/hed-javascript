const types = require('./types')
const TagEntry = types.TagEntry
const Mapping = types.Mapping

const generateIssue = require('./issues')
const splitHedString = require('./splitHedString')

const doubleSlashPattern = /[\s/]*\/+[\s/]*/g

/**
 * Remove extra slashes and spaces from a HED string.
 *
 * @param {string} hedString The HED string to clean.
 * @return {string} The cleaned HED string.
 */
const removeSlashesAndSpaces = function(hedString) {
  return hedString.replace(doubleSlashPattern, '/')
}

/**
 * Convert a HED tag to long form.
 *
 * @param {Mapping} mapping The short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {number} offset The offset of this tag within the HED string.
 * @return {[string, []]} The long-form tag and any issues.
 */
const convertTagToLong = function(mapping, hedTag, offset) {
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
  let endingIndex = 0
  let foundUnknownExtension = false
  let foundEndingIndex = 0

  for (const tag of splitTag) {
    if (endingIndex !== 0) {
      endingIndex++
    }
    const startingIndex = endingIndex
    endingIndex += tag.length

    if (!foundUnknownExtension) {
      if (!(tag in mapping.mappingData)) {
        foundUnknownExtension = true
        if (foundTagEntry === null) {
          return [
            hedTag,
            [
              generateIssue('noValidTagFound', hedTag, {}, [
                startingIndex + offset,
                endingIndex + offset,
              ]),
            ],
          ]
        }
        continue
      }

      const tagEntry = mapping.mappingData[tag]
      const tagString = tagEntry.longFormattedTag
      const mainHedPortion = cleanedTag.slice(0, endingIndex)

      if (!tagString.endsWith(mainHedPortion)) {
        return [
          hedTag,
          [
            generateIssue(
              'invalidParentNode',
              hedTag,
              { parentTag: tagEntry.longTag },
              [startingIndex + offset, endingIndex + offset],
            ),
          ],
        ]
      }

      foundEndingIndex = endingIndex
      foundTagEntry = tagEntry
    } else if (tag in mapping.mappingData) {
      return [
        hedTag,
        [
          generateIssue(
            'invalidParentNode',
            hedTag,
            { parentTag: mapping.mappingData[tag].longTag },
            [startingIndex + offset, endingIndex + offset],
          ),
        ],
      ]
    }
  }

  const remainder = hedTag.slice(foundEndingIndex)
  const longTagString = foundTagEntry.longTag + remainder
  return [longTagString, []]
}

/**
 * Convert a HED tag to short form.
 *
 * @param {Mapping} mapping The short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @param {number} offset The offset of this tag within the HED string.
 * @return {[string, []]} The short-form tag and any issues.
 */
const convertTagToShort = function(mapping, hedTag, offset) {
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
    if (tag in mapping.mappingData) {
      foundTagEntry = mapping.mappingData[tag]
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
    return [
      hedTag,
      [
        generateIssue('noValidTagFound', hedTag, {}, [
          index + offset,
          lastFoundIndex + offset,
        ]),
      ],
    ]
  }

  const mainHedPortion = cleanedTag.slice(0, lastFoundIndex)
  const tagString = foundTagEntry.longFormattedTag
  if (!tagString.endsWith(mainHedPortion)) {
    return [
      hedTag,
      [
        generateIssue(
          'invalidParentNode',
          hedTag,
          { parentTag: foundTagEntry.longTag },
          [index + offset, lastFoundIndex + offset],
        ),
      ],
    ]
  }

  const remainder = hedTag.slice(lastFoundIndex)
  const shortTagString = foundTagEntry.shortTag + remainder
  return [shortTagString, []]
}

/**
 * Convert a HED string.
 *
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedString The HED tag to convert.
 * @param {function (Mapping, string, number): [string, []]} conversionFn The conversion function for a tag.
 * @return {[string, []]} The converted string and any issues.
 */
const convertHedString = function(schema, hedString, conversionFn) {
  let issues = []
  const mapping = schema.mapping

  if (!mapping.hasNoDuplicates) {
    issues.push(generateIssue('duplicateTagsInSchema', ''))
    return [hedString, issues]
  }

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
      const [shortTagString, singleError] = conversionFn(
        mapping,
        tag,
        startPosition,
      )
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
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedString The HED tag to convert.
 * @return {[string, []]} The long-form string and any issues.
 */
const convertHedStringToLong = function(schema, hedString) {
  return convertHedString(schema, hedString, convertTagToLong)
}

/**
 * Convert a HED string to short form.
 *
 * @param {Schema} schema The schema object containing a short-to-long mapping.
 * @param {string} hedString The HED tag to convert.
 * @return {[string, []]} The short-form string and any issues.
 */
const convertHedStringToShort = function(schema, hedString) {
  return convertHedString(schema, hedString, convertTagToShort)
}

module.exports = {
  convertHedStringToShort: convertHedStringToShort,
  convertHedStringToLong: convertHedStringToLong,
  convertTagToShort: convertTagToShort,
  convertTagToLong: convertTagToLong,
  removeSlashesAndSpaces: removeSlashesAndSpaces,
}

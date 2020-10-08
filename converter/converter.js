const types = require('./types')
const TagEntry = types.TagEntry
const Mapping = types.Mapping

const generateIssue = require('./issues')
const splitHedString = require('./stringSplitter')

const doubleSlashPattern = /[\s/]*\/+[\s/]*/

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
 * Convert a HED tag to short form.
 *
 * @param {Mapping} mapping The short-to-long mapping.
 * @param {string} hedTag The HED tag to convert.
 * @return {[string, []]} The short-form tag and any issues.
 */
const convertTagToShort = function(mapping, hedTag) {
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
      [generateIssue('noValidTagFound', hedTag, {}, [index, lastFoundIndex])],
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
          [index, lastFoundIndex],
        ),
      ],
    ]
  }

  const remainder = hedTag.slice(lastFoundIndex)
  const shortTagString = foundTagEntry.shortTag + remainder
  return [shortTagString, []]
}

/**
 * Convert a HED string to short form.
 *
 * @param {Mapping} mapping The short-to-long mapping.
 * @param {string} hedString The HED tag to convert.
 * @return {[string, []]} The short-form string and any issues.
 */
const convertHedStringToShort = function(mapping, hedString) {
  let issues = []
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
      const [shortTagString, singleError] = convertTagToShort(mapping, tag)
      issues = issues.concat(singleError)
      finalString += shortTagString
    } else {
      finalString += tag
    }
  }

  return [finalString, issues]
}

module.exports = {
  convertHedStringToShort: convertHedStringToShort,
}

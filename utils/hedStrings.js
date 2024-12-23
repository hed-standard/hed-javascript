import pluralize from 'pluralize'
pluralize.addUncountableRule('hertz')

/**
 * Replace the end of a HED tag with a pound sign.
 */
export const replaceTagNameWithPound = function (formattedTag) {
  const lastTagSlashIndex = formattedTag.lastIndexOf('/')
  if (lastTagSlashIndex !== -1) {
    return formattedTag.substring(0, lastTagSlashIndex) + '/#'
  } else {
    return '#'
  }
}

/**
 * Get the indices of all slashes in a HED tag.
 */
export const getTagSlashIndices = function (tag) {
  const indices = []
  let i = -1
  while ((i = tag.indexOf('/', i + 1)) >= 0) {
    indices.push(i)
  }
  return indices
}

// /**
//  * Get the levels of a tag.
//  *
//  * @param {string} tag A HED tag string.
//  * @returns {string[]} The levels of this tag.
//  */
// export const getTagLevels = function (tag) {
//   const tagSlashIndices = getTagSlashIndices(tag)
//   return tagSlashIndices.map((tagSlashIndex) => tag.slice(0, tagSlashIndex))
// }

/**
 * Get the last part of a HED tag.
 *
 * @param {string} tag A HED tag
 * @param {string} character The character to use as a separator.
 * @returns {string} The last part of the tag using the given separator.
 */
export const getTagName = function (tag, character = '/') {
  const lastSlashIndex = tag.lastIndexOf(character)
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(lastSlashIndex + 1)
  }
}

/**
 * Get the HED tag prefix (up to the last slash).
 */
export const getParentTag = function (tag, character = '/') {
  const lastSlashIndex = tag.lastIndexOf(character)
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(0, lastSlashIndex)
  }
}

const openingGroupCharacter = '('
const closingGroupCharacter = ')'

/**
 * Determine whether a HED string is a group (surrounded by parentheses).
 *
 * @param {string} hedString A HED string.
 */
export const hedStringIsAGroup = function (hedString) {
  const trimmedHedString = hedString.trim()
  return trimmedHedString.startsWith(openingGroupCharacter) && trimmedHedString.endsWith(closingGroupCharacter)
}

/**
 * Return a copy of a group tag with the surrounding parentheses removed.
 *
 * @param {string} tagGroup A tag group string.
 */
export const removeGroupParentheses = function (tagGroup) {
  return tagGroup.slice(1, -1)
}

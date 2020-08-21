const date = require('date-and-time')
const parseISO = require('date-fns/parseISO')
const dateIsValid = require('date-fns/isValid')
const rfc3339ish = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?$/

/**
 * Check if a string is empty or only whitespace.
 *
 * @param string The string to check.
 * @returns {boolean} Whether the string is empty.
 */
const stringIsEmpty = function(string) {
  return !string.trim()
}

/**
 * Get number of instances of an character in a string.
 *
 * @param string The string to search.
 * @param characterToCount The character to search for.
 * @returns {number} The number of instances of the character in the string.
 */
const getCharacterCount = function(string, characterToCount) {
  return string.split(characterToCount).length - 1
}

/**
 * Get a copy of a string with the first letter capitalized.
 *
 * @param string The string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalizeString = function(string) {
  return string.charAt(0).toUpperCase() + string.substring(1)
}

/**
 * Determine if a string is a valid clock face time.
 *
 * @param timeString The string to check.
 * @return {boolean} Whether the string is a valid clock face time.
 */
const isClockFaceTime = function(timeString) {
  return (
    date.isValid(timeString, 'HH:mm') || date.isValid(timeString, 'HH:mm:ss')
  )
}

/**
 * Determine if a string is a valid date-time.
 *
 * @param dateTimeString The string to check.
 * @return {boolean} Whether the string is a valid date-time.
 */
const isDateTime = function(dateTimeString) {
  return (
    dateIsValid(parseISO(dateTimeString)) && rfc3339ish.test(dateTimeString)
  )
}

module.exports = {
  stringIsEmpty: stringIsEmpty,
  getCharacterCount: getCharacterCount,
  capitalizeString: capitalizeString,
  isClockFaceTime: isClockFaceTime,
  isDateTime: isDateTime,
}

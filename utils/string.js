const stringIsEmpty = function(string) {
  return !string.trim()
}

const getCharacterCount = function(string, characterToCount) {
  return string.split(characterToCount).length - 1
}

const capitalizeString = function(string) {
  return string.charAt(0).toUpperCase() + string.substring(1)
}

module.exports = {
  stringIsEmpty: stringIsEmpty,
  getCharacterCount: getCharacterCount,
  capitalizeString: capitalizeString,
}

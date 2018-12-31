const stringIsEmpty = function(string) {
  return !string.trim()
}

const getCharacterCount = function(string, characterToCount) {
  return string.split(characterToCount).length - 1
}

module.exports = {
  stringIsEmpty: stringIsEmpty,
  getCharacterCount: getCharacterCount,
}

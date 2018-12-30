const stringParser = require('./stringParser')

const validateHedTag = function(tag, issues) {
  issues.push('Not yet implemented')
  return true
}

const validateHedString = function(hedString, issues) {
  const parsedString = stringParser.parseHedString(hedString, issues)
  const hedTags = parsedString.tags
  let valid = true
  for (let hedTag of hedTags) {
    valid = valid && validateHedTag(hedTag, issues)
  }
  return valid
}

module.exports = {
  validateHedTag: validateHedTag,
  validateHedString: validateHedString,
}

/**
 * Generate an issue object for tag conversion.
 *
 * @param {string} code The issue code.
 * @param {string} hedString The source HED string.
 * @param {object} parameters The parameters to the format string.
 * @param {number[]} bounds The bounds of the problem tag.
 * @return {{code: string, sourceString: string, message: string}} The issue object.
 */
const generateIssue = function(code, hedString, parameters = {}, bounds = []) {
  const issueObject = { code: code, sourceString: hedString }
  const problemTag = hedString.slice(bounds[0], bounds[1])
  switch (code) {
    case 'invalidParentNode':
      issueObject.message = `ERROR: "${problemTag}" appears as "${parameters.parentTag}" and cannot be used as an extension. Indices (${bounds[0]}, ${bounds[1]}).`
      break
    case 'noValidTagFound':
      issueObject.message = `ERROR: "${problemTag}" is not a valid base HED tag. Indices (${bounds[0]}, ${bounds[1]}).`
      break
    case 'emptyTagFound':
      issueObject.message = `ERROR: Empty tag cannot be converted.`
      break
    case 'duplicateTagsInSchema':
      issueObject.message = `ERROR: Source HED schema is invalid as it contains duplicate tags.`
      break
    default:
      issueObject.message = `ERROR: Unknown HED error.`
      break
  }
  return issueObject
}

module.exports = generateIssue

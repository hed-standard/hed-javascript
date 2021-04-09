/**
 * A HED validation error or warning.
 *
 * @param {string} code The HED error code.
 * @param {string} message The detailed error message.
 * @constructor
 */
const Issue = function (code, message) {
  /**
   * The HED error code.
   * @type {string}
   */
  this.code = code
  /**
   * The detailed error message.
   * @type {string}
   */
  this.message = message
}

/**
 * Generate a new issue object.
 *
 * @param {string} code The HED error code.
 * @param {object} parameters The error string parameters.
 * @return {Issue} An object representing the issue.
 */
const generateIssue = function (code, parameters) {
  let message
  switch (code) {
    case 'parentheses':
      message = `ERROR: Number of opening and closing parentheses are unequal. ${parameters.opening} opening parentheses. ${parameters.closing} closing parentheses.`
      break
    case 'invalidTag':
      message = `ERROR: Invalid tag - "${parameters.tag}"`
      break
    case 'extraDelimiter':
      message = `ERROR: Extra delimiter "${parameters.character}" at index ${parameters.index} of string "${parameters.string}"`
      break
    case 'commaMissing':
      message = `ERROR: Comma missing after - "${parameters.tag}"`
      break
    case 'capitalization':
      message = `WARNING: First word not capitalized or camel case - "${parameters.tag}"`
      break
    case 'duplicateTag':
      message = `ERROR: Duplicate tag - "${parameters.tag}"`
      break
    case 'multipleUniqueTags':
      message = `ERROR: Multiple unique tags with prefix - "${parameters.tag}"`
      break
    case 'tooManyTildes':
      message = `ERROR: Too many tildes - group "${parameters.tagGroup}"`
      break
    case 'childRequired':
      message = `ERROR: Descendant tag required - "${parameters.tag}"`
      break
    case 'requiredPrefixMissing':
      message = `WARNING: Tag with prefix "${parameters.tagPrefix}" is required`
      break
    case 'unitClassDefaultUsed':
      message = `WARNING: No unit specified. Using "${parameters.defaultUnit}" as the default - "${parameters.tag}"`
      break
    case 'unitClassInvalidUnit':
      message = `ERROR: Invalid unit - "${parameters.tag}" - valid units are "${parameters.unitClassUnits}"`
      break
    case 'extraCommaOrInvalid':
      message = `ERROR: Either "${parameters.previousTag}" contains a comma when it should not or "${parameters.tag}" is not a valid tag`
      break
    case 'invalidCharacter':
      message = `ERROR: Invalid character "${parameters.character}" at index ${parameters.index} of string "${parameters.string}"`
      break
    case 'extension':
      message = `WARNING: Tag extension found - "${parameters.tag}"`
      break
    case 'invalidPlaceholder':
      message = `ERROR: Invalid placeholder - "${parameters.tag}"`
      break
    case 'invalidParentNode':
      message = `ERROR: "${parameters.tag}" appears as "${parameters.parentTag}" and cannot be used as an extension. Indices (${parameters.bounds[0]}, ${parameters.bounds[1]}).`
      break
    case 'emptyTagFound':
      message = `ERROR: Empty tag cannot be converted.`
      break
    case 'duplicateTagsInSchema':
      message = `ERROR: Source HED schema is invalid as it contains duplicate tags.`
      break
    case 'illegalDefinitionGroupTag':
      message = `ERROR: Illegal tag "${parameters.tag}" in tag group for definition "${parameters.definition}"`
      break
    case 'nestedDefinition':
      message = `ERROR: Illegal nested definition in tag group for definition "${parameters.definition}"`
      break
    case 'multipleTagGroupsInDefinition':
      message = `ERROR: Multiple inner tag groups found in definition "${parameters.definition}"`
      break
    case 'topLevelDefinitionTag':
      message = `ERROR: Illegal top-level definition tag - "${parameters.tag}"`
      break
    default:
      message = `ERROR: Unknown HED error.`
      break
  }

  return new Issue(code, message)
}

module.exports = {
  generateIssue: generateIssue,
  Issue: Issue,
}

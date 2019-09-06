const generateIssue = function(code, parameters) {
  const issueObject = { code: code }
  switch (code) {
    case 'parentheses':
      issueObject.message = `ERROR: Number of opening and closing parentheses are unequal. ${
        parameters.opening
      } opening parentheses. ${parameters.closing} closing parentheses.`
      break
    case 'invalidTag':
      issueObject.message = `ERROR: Invalid tag - "${parameters.tag}"`
      break
    case 'extraDelimiter':
      issueObject.message = `ERROR: Extra delimiter "${
        parameters.character
      }" at index ${parameters.index} of string "${parameters.string}"`
      break
    case 'commaMissing':
      issueObject.message = `ERROR: Comma missing after - "${parameters.tag}"`
      break
    case 'capitalization':
      issueObject.message = `WARNING: First word not capitalized or camel case - "${
        parameters.tag
      }"`
      break
    case 'duplicateTag':
      issueObject.message = `ERROR: Duplicate tag - "${parameters.tag}"`
      break
    case 'multipleUniqueTags':
      issueObject.message = `ERROR: Multiple unique tags with prefix - "${
        parameters.tag
      }"`
      break
    case 'tooManyTildes':
      issueObject.message = `ERROR: Too many tildes - group "${
        parameters.tagGroup
      }"`
      break
    case 'childRequired':
      issueObject.message = `ERROR: Descendant tag required - "${
        parameters.tag
      }"`
      break
    case 'requiredPrefixMissing':
      issueObject.message = `WARNING: Tag with prefix "${
        parameters.tagPrefix
      }" is required`
      break
    case 'unitClassDefaultUsed':
      issueObject.message = `WARNING: No unit specified. Using "${
        parameters.defaultUnit
      }" as the default - "${parameters.tag}"`
      break
    case 'unitClassInvalidUnit':
      issueObject.message = `ERROR: Invalid unit - "${
        parameters.tag
      }" - valid units are "${parameters.unitClassUnits}"`
      break
    case 'extraCommaOrInvalid':
      issueObject.message = `ERROR: Either "${
        parameters.previousTag
      }" contains a comma when it should not or "${
        parameters.tag
      }" is not a valid tag`
      break
    case 'invalidCharacter':
      issueObject.message = `ERROR: Invalid character "${
        parameters.character
      }" at index ${parameters.index} of string "${parameters.string}"`
      break
    default:
      issueObject.message = `ERROR: Unknown HED error.`
      break
  }

  return issueObject
}

module.exports = generateIssue

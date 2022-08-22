const { stringTemplate } = require('../../utils/string')

const issueData = {
  // Syntax issues
  parentheses: {
    hedCode: 'HED_PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Number of opening and closing parentheses are unequal. ${'opening'} opening parentheses. ${'closing'} closing parentheses.`,
  },
  unopenedParentheses: {
    hedCode: 'HED_PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Closing parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding opening parenthesis.`,
  },
  unclosedParentheses: {
    hedCode: 'HED_PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Opening parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding closing parenthesis.`,
  },
  extraDelimiter: {
    hedCode: 'HED_TAG_EMPTY',
    level: 'error',
    message: stringTemplate`Extra delimiter "${'character'}" at index ${'index'} of string "${'string'}"`,
  },
  commaMissing: {
    hedCode: 'HED_COMMA MISSING',
    level: 'error',
    message: stringTemplate`Comma missing after - "${'tag'}"`,
  },
  duplicateTag: {
    hedCode: 'HED_TAG_REPEATED',
    level: 'error',
    message: stringTemplate`Duplicate tag at indices (${0}, ${1}) - "${'tag'}"`,
  },
  invalidCharacter: {
    hedCode: 'HED_CHARACTER_INVALID',
    level: 'error',
    message: stringTemplate`Invalid character "${'character'}" at index ${'index'} of string "${'string'}"`,
  },
  // Common semantic validation issues
  invalidTag: {
    hedCode: 'HED_TAG_INVALID',
    level: 'error',
    message: stringTemplate`Invalid tag - "${'tag'}"`,
  },
  extraCommaOrInvalid: {
    hedCode: 'HED_TAG_INVALID',
    level: 'error',
    message: stringTemplate`Either "${'previousTag'}" contains a comma when it should not or "${'tag'}" is not a valid tag`,
  },
  multipleUniqueTags: {
    hedCode: 'HED_TAG_NOT_UNIQUE',
    level: 'error',
    message: stringTemplate`Multiple unique tags with prefix - "${'tag'}"`,
  },
  childRequired: {
    hedCode: 'HED_TAG_REQUIRES_CHILD',
    level: 'error',
    message: stringTemplate`Descendant tag required - "${'tag'}"`,
  },
  requiredPrefixMissing: {
    hedCode: 'HED_REQUIRED_TAG_MISSING',
    level: 'warning',
    message: stringTemplate`Tag with prefix "${'tagPrefix'}" is required`,
  },
  unitClassDefaultUsed: {
    hedCode: 'HED_UNITS_MISSING',
    level: 'warning',
    message: stringTemplate`No unit specified. Using "${'defaultUnit'}" as the default - "${'tag'}"`,
  },
  unitClassInvalidUnit: {
    hedCode: 'HED_UNITS_INVALID',
    level: 'error',
    message: stringTemplate`Invalid unit - "${'tag'}" - valid units are "${'unitClassUnits'}"`,
  },
  invalidValue: {
    hedCode: 'HED_VALUE_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder value for tag "${'tag'}"`,
  },
  invalidPlaceholder: {
    hedCode: 'HED_PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder - "${'tag'}"`,
  },
  missingPlaceholder: {
    hedCode: 'HED_PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`HED value string "${'string'}" is missing a required placeholder.`,
  },
  extension: {
    hedCode: 'HED_TAG_EXTENDED',
    level: 'warning',
    message: stringTemplate`Tag extension found - "${'tag'}"`,
  },
  // HED 3-specific validation issues
  invalidPlaceholderInDefinition: {
    hedCode: 'HED_PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder in definition - "${'definition'}"`,
  },
  nestedDefinition: {
    hedCode: 'HED_DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Illegal nested definition in tag group for definition "${'definition'}"`,
  },
  duplicateDefinition: {
    hedCode: 'HED_DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Definition "${'definition'}" is declared multiple times. This instance's tag group is "${'tagGroup'}"`,
  },
  multipleTagGroupsInDefinition: {
    hedCode: 'HED_DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Multiple inner tag groups found in definition "${'definition'}"`,
  },
  illegalDefinitionGroupTag: {
    hedCode: 'HED_DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Illegal tag "${'tag'}" in tag group for definition "${'definition'}"`,
  },
  invalidTopLevelTagGroupTag: {
    hedCode: 'HED_TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is only allowed inside of a top-level tag group.`,
  },
  multipleTopLevelTagGroupTags: {
    hedCode: 'HED_TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" found in top-level tag group where "${'otherTag'}" was already defined.`,
  },
  invalidTopLevelTag: {
    hedCode: 'HED_TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is only allowed inside of a tag group.`,
  },
  // Tag conversion issues
  invalidParentNode: {
    hedCode: 'HED_VALUE_IS_NODE',
    level: 'error',
    message: stringTemplate`"${'tag'}" appears as "${'parentTag'}" and cannot be used as an extension. Indices (${0}, ${1}).`,
  },
  emptyTagFound: {
    hedCode: 'HED_NODE_NAME_EMPTY',
    level: 'error',
    message: stringTemplate`Empty tag cannot be converted.`,
  },
  duplicateTagsInSchema: {
    hedCode: 'HED_GENERIC_ERROR',
    level: 'error',
    message: stringTemplate`Source HED schema is invalid as it contains duplicate tags.`,
  },
  // Schema issues
  invalidSchemaNickname: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The prefix nickname "${'nickname'}" in schema "${'schemaVersion'}" is duplicated or invalid.`,
  },
  invalidSchemaSpecification: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The supplied schema specification is invalid. Specification: ${'spec'}`,
  },
  requestedSchemaLoadFailedFallbackUsed: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'warning',
    message: stringTemplate`The requested schema failed to load. The fallback schema bundled with this validator will be used instead. Specification: ${'spec'}`,
  },
  requestedSchemaLoadFailedNoFallbackUsed: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The requested schema failed to load. The validator did not attempt to load a fallback schema. Specification: ${'spec'}`,
  },
  fallbackSchemaLoadFailed: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The fallback schema bundled with this validator failed to load. No HED validation was performed.`,
  },
  localSchemaLoadFailed: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not load HED schema from path "${'path'}" - "${'error'}".`,
  },
  remoteStandardSchemaLoadFailed: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not load HED standard schema, version "${'version'}", from remote repository - "${'error'}".`,
  },
  remoteLibrarySchemaLoadFailed: {
    hedCode: 'HED_SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not load HED library schema "${'library'}", version "${'version'}", from remote repository - "${'error'}".`,
  },
  unmatchedBaseSchema: {
    hedCode: 'HED_LIBRARY_UNMATCHED',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is declared to use a base schema in the dataset's schema listing, but no such schema was defined.`,
  },
  unmatchedLibrarySchema: {
    hedCode: 'HED_LIBRARY_UNMATCHED',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is declared to use a library schema nicknamed "${'library'}" in the dataset's schema listing, but no such schema was found.`,
  },
  // Generic errors
  genericError: {
    hedCode: 'HED_GENERIC_ERROR',
    level: 'error',
    message: stringTemplate`Unknown HED error "${'internalCode'}" - parameters: "${'parameters'}".`,
  },
}

module.exports = issueData

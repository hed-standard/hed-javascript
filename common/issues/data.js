import { stringTemplate } from '../../utils/string'

export default {
  // Syntax issues
  parentheses: {
    hedCode: 'PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Number of opening and closing parentheses are unequal. ${'opening'} opening parentheses. ${'closing'} closing parentheses.`,
  },
  unopenedParentheses: {
    hedCode: 'PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Closing parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding opening parenthesis.`,
  },
  unclosedParentheses: {
    hedCode: 'PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Opening parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding closing parenthesis.`,
  },
  extraDelimiter: {
    hedCode: 'TAG_EMPTY',
    level: 'error',
    message: stringTemplate`Extra delimiter "${'character'}" at index ${'index'} of string "${'string'}".`,
  },
  commaMissing: {
    hedCode: 'COMMA MISSING',
    level: 'error',
    message: stringTemplate`Comma missing after - "${'tag'}".`,
  },
  duplicateTag: {
    hedCode: 'TAG_EXPRESSION_REPEATED',
    level: 'error',
    message: stringTemplate`Duplicate tag at indices (${0}, ${1}) - "${'tag'}".`,
  },
  invalidCharacter: {
    hedCode: 'CHARACTER_INVALID',
    level: 'error',
    message: stringTemplate`Invalid character "${'character'}" at index ${'index'} of string "${'string'}".`,
  },
  // Common semantic validation issues
  invalidTag: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Invalid tag - "${'tag'}".`,
  },
  extraCommaOrInvalid: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Either "${'previousTag'}" contains a comma when it should not or "${'tag'}" is not a valid tag.`,
  },
  multipleUniqueTags: {
    hedCode: 'TAG_NOT_UNIQUE',
    level: 'error',
    message: stringTemplate`Multiple unique tags with prefix - "${'tag'}".`,
  },
  childRequired: {
    hedCode: 'TAG_REQUIRES_CHILD',
    level: 'error',
    message: stringTemplate`Descendant tag required - "${'tag'}".`,
  },
  requiredPrefixMissing: {
    hedCode: 'REQUIRED_TAG_MISSING',
    level: 'warning',
    message: stringTemplate`Tag with prefix "${'tagPrefix'}" is required.`,
  },
  unitClassDefaultUsed: {
    hedCode: 'UNITS_MISSING',
    level: 'warning',
    message: stringTemplate`No unit specified. Using "${'defaultUnit'}" as the default - "${'tag'}".`,
  },
  unitClassInvalidUnit: {
    hedCode: 'UNITS_INVALID',
    level: 'error',
    message: stringTemplate`Invalid unit - "${'tag'}" - valid units are "${'unitClassUnits'}".`,
  },
  invalidValue: {
    hedCode: 'VALUE_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder value for tag "${'tag'}".`,
  },
  extension: {
    hedCode: 'TAG_EXTENDED',
    level: 'warning',
    message: stringTemplate`Tag extension found - "${'tag'}".`,
  },
  // HED 3-specific validation issues
  invalidPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder - "${'tag'}".`,
  },
  missingPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`HED value string "${'string'}" is missing a required placeholder.`,
  },
  invalidPlaceholderInDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder in definition - "${'definition'}".`,
  },
  nestedDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Illegal nested definition in tag group for definition "${'definition'}".`,
  },
  missingDefinition: {
    hedCode: 'DEF_INVALID',
    level: 'error',
    message: stringTemplate`Def tag found for definition name "${'definition'}" does not correspond to an existing definition.`,
  },
  duplicateDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Definition "${'definition'}" is declared multiple times. This instance's tag group is "${'tagGroup'}".`,
  },
  multipleTagGroupsInDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Multiple inner tag groups found in definition "${'definition'}".`,
  },
  illegalDefinitionGroupTag: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Illegal tag "${'tag'}" in tag group for definition "${'definition'}".`,
  },
  inactiveOnset: {
    hedCode: 'ONSET_OFFSET_ERROR',
    level: 'error',
    message: stringTemplate`Offset found for inactive onset with definition name and value "${'definition'}".`,
  },
  temporalWithoutInnerGroup: {
    hedCode: 'ONSET_OFFSET_ERROR',
    level: 'error',
    message: stringTemplate`Onset or offset found without an included inner top-level tag group. This instance's tag group is "${'tagGroup'}".`,
  },
  temporalWithMultipleDefinitions: {
    hedCode: 'ONSET_OFFSET_ERROR',
    level: 'error',
    message: stringTemplate`Onset or offset found with multiple included definitions. This instance's tag group is "${'tagGroup'}".`,
  },
  temporalWithoutDefinition: {
    hedCode: 'ONSET_OFFSET_ERROR',
    level: 'error',
    message: stringTemplate`Onset or offset found without an included definition. This instance's tag group is "${'tagGroup'}".`,
  },
  extraTagsInTemporal: {
    hedCode: 'ONSET_OFFSET_ERROR',
    level: 'error',
    message: stringTemplate`Extra non-definition top-level tags or tag groups found in onset or offset group with definition "${'definition'}".`,
  },
  duplicateTemporal: {
    hedCode: 'ONSET_OFFSET_ERROR',
    level: 'error',
    message: stringTemplate`HED event string "${'string'}" has onset/offset tags with duplicated definition "${'definition'}".`,
  },
  invalidTopLevelTagGroupTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is only allowed inside of a top-level tag group.`,
  },
  multipleTopLevelTagGroupTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" found in top-level tag group where "${'otherTag'}" was already defined.`,
  },
  invalidTopLevelTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is only allowed inside of a tag group.`,
  },
  // Tag conversion issues
  invalidParentNode: {
    hedCode: 'TAG_EXTENSION_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" appears as "${'parentTag'}" and cannot be used as an extension. Indices (${0}, ${1}).`,
  },
  emptyTagFound: {
    hedCode: 'TAG_EMPTY',
    level: 'error',
    message: stringTemplate`Empty tag cannot be converted.`,
  },
  duplicateTagsInSchema: {
    hedCode: 'SCHEMA_DUPLICATE_NODE',
    level: 'error',
    message: stringTemplate`Source HED schema is invalid as it contains duplicate tags.`,
  },
  // Schema issues
  invalidSchemaNickname: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The prefix nickname "${'nickname'}" in specification "${'spec'}" is duplicated or invalid.`,
  },
  invalidSchemaSpecification: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The supplied schema specification is invalid. Specification: ${'spec'}.`,
  },
  requestedSchemaLoadFailedFallbackUsed: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'warning',
    message: stringTemplate`The requested schema failed to load. The fallback schema bundled with this validator will be used instead. Specification: ${'spec'}.`,
  },
  requestedSchemaLoadFailedNoFallbackUsed: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The requested schema failed to load. The validator did not attempt to load a fallback schema. Specification: ${'spec'}.`,
  },
  fallbackSchemaLoadFailed: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The fallback schema bundled with this validator failed to load. No HED validation was performed.`,
  },
  bundledSchemaLoadFailed: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not load HED schema for spec "${'spec'}" from bundled copy - "${'error'}".`,
  },
  localSchemaLoadFailed: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not load HED schema from path "${'path'}" - "${'error'}".`,
  },
  remoteSchemaLoadFailed: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not load HED schema "${'spec'}" from remote repository - "${'error'}".`,
  },
  unmatchedBaseSchema: {
    hedCode: 'TAG_PREFIX_INVALID',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is declared to use a base schema in the dataset's schema listing, but no such schema was defined.`,
  },
  unmatchedLibrarySchema: {
    hedCode: 'TAG_PREFIX_INVALID',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is declared to use a library schema nicknamed "${'library'}" in the dataset's schema listing, but no such schema was found.`,
  },
  // BIDS issues
  sidecarKeyMissing: {
    hedCode: 'SIDECAR_KEY_MISSING',
    level: 'warning',
    message: stringTemplate`Key "${'key'}" was referenced in column "${'column'}" of file "${'file'}", but it was not found in any associated sidecar.`,
  },
  // Generic errors
  genericError: {
    hedCode: 'GENERIC_ERROR',
    level: 'error',
    message: stringTemplate`Unknown HED error "${'internalCode'}" - parameters: "${'parameters'}".`,
  },
}

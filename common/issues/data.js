import { stringTemplate } from '../../utils/string'

export default {
  // Syntax issues
  parentheses: {
    hedCode: 'PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Number of opening and closing parentheses are unequal. ${'opening'} opening parentheses. ${'closing'} closing parentheses.`,
  },
  unopenedParenthesis: {
    hedCode: 'PARENTHESES_MISMATCH',
    level: 'error',
    message: stringTemplate`Closing parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding opening parenthesis.`,
  },
  unclosedParenthesis: {
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
    hedCode: 'COMMA_MISSING',
    level: 'error',
    message: stringTemplate`Comma missing after - "${'tag'}".`,
  },
  duplicateTag: {
    hedCode: 'TAG_EXPRESSION_REPEATED',
    level: 'error',
    message: stringTemplate`Duplicate tag - "${'tag'}".`,
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
  extraSlash: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Tag has extra slash at index ${'index'} of string "${'string'}".`,
  },
  extraBlank: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Tag has extra blank at index ${'index'} of string "${'string'}".`,
  },
  extraCommaOrInvalid: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Either "${'previousTag'}" contains a comma when it should not or "${'tag'}" is not a valid tag.`,
  },
  invalidTagPrefix: {
    hedCode: 'TAG_NAMESPACE_PREFIX_INVALID',
    level: 'error',
    message: stringTemplate`Either tag prefix at index ${'index'} contains non-alphabetic characters or does not have an associated schema.`,
  },
  multipleUniqueTags: {
    hedCode: 'TAG_NOT_UNIQUE',
    level: 'error',
    message: stringTemplate`Multiple unique "${'tag'}" tags in "${'string'}".`,
  },
  childRequired: {
    hedCode: 'TAG_REQUIRES_CHILD',
    level: 'error',
    message: stringTemplate`Descendant tag required - "${'tag'}".`,
  },
  valueRequired: {
    hedCode: 'TAG_REQUIRES_CHILD',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" requires a value.`,
  },
  childForbidden: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Child tag or value not allowed - "${'tag'}".`,
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
    message: stringTemplate`Invalid unit - "${'tag'}".`,
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
  invalidPlaceholderContext: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`"${'string'}" has "#" placeholders, which are not allowed in this context.`,
  },
  invalidSidecarPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`"${'string'}" of column "${'column'}" has an invalid # placeholder.`,
  },
  // HED 3-specific validation issues
  invalidPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`Invalid # placeholder - "${'tag'}".`,
  },
  missingPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`HED value string "${'string'}" is missing a required # placeholder for column "${'column'}".`,
  },
  extraPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`HED value string "${'string'}" has too many placeholders in column "${'column'}".`,
  },
  invalidPlaceholderInDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder or missing placeholder in definition - "${'definition'}".`,
  },
  invalidDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Invalid definition - "${'definition'}".`,
  },
  nestedDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Illegal nested definition in tag group for definition "${'definition'}".`,
  },
  missingDefinitionForDef: {
    hedCode: 'DEF_INVALID',
    level: 'error',
    message: stringTemplate`Def tag found for definition name "${'definition'}" does not correspond to an existing definition.`,
  },
  missingDefinitionForDefExpand: {
    hedCode: 'DEF_EXPAND_INVALID',
    level: 'error',
    message: stringTemplate`Def-expand tag found for definition name "${'definition'}" does not correspond to an existing definition.`,
  },
  duplicateDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Definition "${'definition'}" is declared multiple times. This instance's tag group is "${'tagGroup'}".`,
  },
  conflictingDefinitions: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Definition "${'definition1'}" and "${'definition2'}' conflict.`,
  },
  duplicateDefinitionNames: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Definition "${'definition1'}" and "${'definition2'}" have same name but are not equivalent.`,
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
  illegalDefinitionContext: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Definitions "${'definitions'}" were found in string "${'string'}" in a context where definitions are not allowed.`,
  },
  illegalInExclusiveContext: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" can only appear in groups of the same type but "${'string'}" has other groups or tags.`,
  },
  inactiveOnset: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`${'tag'} found for inactive onset with definition name and value "${'definition'}".`,
  },
  temporalWithoutInnerGroup: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`${'tag'} found without an included inner top-level tag group. This instance's tag group is "${'tagGroup'}".`,
  },
  temporalWithMultipleDefinitions: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`${'tag'} found with multiple included definitions. This instance's tag group is "${'tagGroup'}".`,
  },
  temporalWithoutDefinition: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`${'tag'} found without an included definition. This instance's tag group is "${'tagGroup'}".`,
  },
  extraTagsInTemporal: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`Extra non-definition top-level tags or tag groups found in onset or offset group with definition "${'definition'}".`,
  },
  duplicateTemporal: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`HED event string "${'string'}" has onset/offset tags with duplicated definition "${'definition'}".`,
  },
  missingTagGroup: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" must appear in a tag group.`,
  },
  invalidTagGroup: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`"${'tagGroup'}" has invalid group tags or invalid number of subgroups.`,
  },
  invalidTopLevelTagGroupTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is only allowed inside of a top-level tag group, but is not at top level in "${'string'}".`,
  },
  invalidGroupTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tags "${'tags'}" in "${'string'}" cannot be in a subgroups together.`,
  },
  invalidGroupTopTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tags "${'tags'}" cannot be at the same level in group "${'string'}".`,
  },
  tooManyGroupTopTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Group "${'string'}" has too many or too few tags at the top level.`,
  },
  multipleTopLevelTagGroupTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" found in top-level tag group where "${'otherTag'}" was already defined.`,
  },
  invalidNumberOfSubgroups: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`The tags "${'tags'} in "${'string'} require groups that do not agree or are not present in their group .`,
  },
  invalidTopLevelTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is only allowed inside of a tag group.`,
  },
  invalidGroupTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" should be in a group in "${'string'}" but is not.`,
  },
  // Tag conversion issues
  invalidParentNode: {
    hedCode: 'TAG_EXTENSION_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" appears as "${'parentTag'}" and cannot be used as an extension. Indices (${0}, ${1}).`,
  },
  invalidExtension: {
    hedCode: 'TAG_EXTENSION_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" appears as an extension of "${'parentTag'}", which does not allow this tag extension.`,
  },
  emptyTagFound: {
    hedCode: 'TAG_EMPTY',
    level: 'error',
    message: stringTemplate`Empty tag at index ${'index'} cannot be converted.`,
  },
  invalidTagString: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`Tag string is null or undefined.`,
  },
  duplicateTagsInSchema: {
    hedCode: 'SCHEMA_DUPLICATE_NODE',
    level: 'error',
    message: stringTemplate`Source HED schema is invalid as it contains duplicate tags.`,
  },
  // Curly brace issues
  unopenedCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Closing curly brace at index ${'index'} of string "${'string'}" does not have a corresponding opening curly brace.`,
  },
  unclosedCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Opening curly brace at index ${'index'} of string "${'string'}" does not have a corresponding closing curly brace.`,
  },
  nestedCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Opening curly brace at index ${'index'} of string "${'string'}" when curly brace expression is already open.`,
  },
  emptyCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Curly brace expression of string "${'string'}" is empty.`,
  },
  curlyBracesInDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Curly brace expression "${'column'}" found in definition "${'definition'}".`,
  },
  curlyBracesInHedColumn: {
    hedCode: 'CHARACTER_INVALID',
    level: 'error',
    message: stringTemplate`Curly brace expression "${'string'}" found in the HED column of a TSV file.`,
  },
  curlyBracesNotAllowed: {
    hedCode: 'CHARACTER_INVALID',
    level: 'error',
    message: stringTemplate`Curly brace expression not allowed in "${'string'}".`,
  },
  recursiveCurlyBraces: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Column name "${'column'}", which has curly braces, is illegally referred to by a string using curly braces.`,
  },
  recursiveCurlyBracesWithKey: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Column name "${'column'}", which has curly braces, is referred to by column "${'referrer'}", which also has curly braces.`,
  },
  undefinedCurlyBraces: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Column name "${'column'}", used in curly braces, is not mapped to a defined column.`,
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
  missingSchemaSpecification: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`No schema specification was supplied.`,
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
  differentWithStandard: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Could not merge lazy partnered schemas with different "withStandard" values: "${'first'}" and "${'second'}".`,
  },
  lazyPartneredSchemasShareTag: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`Lazy partnered schemas are incompatible because they share the short tag "${'tag'}". These schemas require different prefixes.`,
  },
  deprecatedStandardSchemaVersion: {
    hedCode: 'VERSION_DEPRECATED',
    level: 'error',
    message: stringTemplate`HED standard schema version ${'version'} is deprecated. Please upgrade to a newer version.`,
  },
  // BIDS issues
  sidecarKeyMissing: {
    hedCode: 'SIDECAR_KEY_MISSING',
    level: 'warning',
    message: stringTemplate`Key "${'key'}" was referenced in column "${'column'}" of file "${'file'}", but it was not found in any associated sidecar.`,
  },
  illegalSidecarHedType: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The HED data for sidecar key "${'key'}" of file "${'file'}" is not either a key-value dictionary or a string.`,
  },
  illegalSidecarHedKey: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The string 'HED' or 'n/a' was illegally used as a sidecar key.`,
  },
  illegalSidecarHedCategoricalValue: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The string 'HED' or 'n/a' was illegally used as a sidecar categorical value.`,
  },
  illegalSidecarHedDeepKey: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The key 'HED' was illegally used within a non-HED sidecar column.`,
  },
  // Generic errors
  genericError: {
    hedCode: 'GENERIC_ERROR',
    level: 'error',
    message: stringTemplate`Unknown HED error "${'internalCode'}" - parameters: "${'parameters'}".`,
  },
  internalError: {
    hedCode: 'GENERIC_ERROR',
    level: 'error',
    message: stringTemplate`Internal error - message: "${'message'}".`,
  },
  internalConsistencyError: {
    hedCode: 'GENERIC_ERROR',
    level: 'error',
    message: stringTemplate`Internal consistency error - message: "${'message'}".`,
  },
}

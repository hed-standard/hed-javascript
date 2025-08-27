/** This module contains the templates for the issues.
 * @module issues/data
 */

import { stringTemplate } from '../utils/string'

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
  commaMissing: {
    hedCode: 'COMMA_MISSING',
    level: 'error',
    message: stringTemplate`Comma missing at position ${'index'} of string "${'string'}". ${'msg'}`,
  },
  deprecatedTag: {
    hedCode: 'ELEMENT_DEPRECATED',
    level: 'warning',
    message: stringTemplate`Tags "${'tags'} in "${'string'} are deprecated. Please see tag description for instructions on replacement.".`,
  },
  duplicateTag: {
    hedCode: 'TAG_EXPRESSION_REPEATED',
    level: 'error',
    message: stringTemplate`Duplicate tags - "${'tags'} in "${'string'}".`,
  },
  extendedTag: {
    hedCode: 'TAG_EXTENDED',
    level: 'warning',
    message: stringTemplate`Tag extensions found for ${'tags'} in "${'string'}".`,
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
    message: stringTemplate`Invalid tag - "${'tag'}". ${'msg'}`,
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
    message: stringTemplate`Either tag prefix at index ${'index'} contains non-alphabetic characters or does not have an associated schema. ${'msg'}`,
  },
  multipleUniqueTags: {
    hedCode: 'TAG_NOT_UNIQUE',
    level: 'error',
    message: stringTemplate`Multiple unique "${'tag'}" tags in "${'string'}".`,
  },
  childRequired: {
    hedCode: 'TAG_REQUIRES_CHILD',
    level: 'error',
    message: stringTemplate`Descendant tag required - "${'tag'}". ${'msg'}`,
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
  unitClassInvalidUnit: {
    hedCode: 'UNITS_INVALID',
    level: 'error',
    message: stringTemplate`Invalid unit - "${'tag'}".`,
  },
  invalidValue: {
    hedCode: 'VALUE_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder value for tag "${'tag'}". ${'msg'}`,
  },
  invalidPlaceholderContext: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`"${'string'}" has "#" placeholders, which are not allowed in this context.`,
  },
  invalidSidecarPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`"${'string'}" of sidecar key "${'sidecarKey'}" has an invalid # placeholder.`,
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
    message: stringTemplate`HED value string "${'string'}" is missing a required # placeholder for sidecar key "${'sidecarKey'}".`,
  },
  extraPlaceholder: {
    hedCode: 'PLACEHOLDER_INVALID',
    level: 'error',
    message: stringTemplate`HED value string "${'string'}" has too many placeholders in sidecar key "${'sidecarKey'}".`,
  },
  invalidPlaceholderInDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Invalid placeholder or missing placeholder in definition - "${'definition'}". ${'msg'}`,
  },
  invalidDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Invalid definition - "${'definition'}". ${'msg'}`,
  },
  invalidDefinitionManager: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Invalid definition manager "${'defManager'}", usually because invalid external definitions were provided to a sidecar or tsv.`,
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
  invalidDefinitionGroupStructure: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`The Definition or Def-expand tag "${'tag'} in "${'tagGroup'}" has multiple top tags or more than one top group.`,
  },
  invalidDefinitionForbidden: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`The Definition or Def-expand tag "${'tag'} in "${'tagGroup'}" has other definition-related tags in subgroups.`,
  },
  defExpandContentsInvalid: {
    hedCode: 'DEF_EXPAND_INVALID',
    level: 'error',
    message: stringTemplate`Def-expand contents "${'contents'}" disagree with evaluated definition "${'contentsDef'}".`,
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
    message: stringTemplate`Definition "${'definition'}" was found in string "${'string'}" in a context where definitions are not allowed.`,
  },
  illegalInExclusiveContext: {
    hedCode: 'TAG_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" can only appear in groups with other definitions but "${'string'}" has other types of groups or tags.`,
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
  temporalWithWrongNumberDefs: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`${'tag'} found in tag group "${'tagGroup'}" with the wrong number of Def tags and Def-expand groups.`,
  },
  temporalWithoutDefinition: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`${'tag'} found in tag group "${'tagGroup'}" without an included definition.`,
  },
  extraTagsInTemporal: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`Extra top-level tags or tag groups found in onset, inset, or offset group "${'tagGroup'}" with definition "${'definition'}".`,
  },
  temporalTagInNonTemporalContext: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`HED event string "${'string'}" has temporal tags on line(s) [${'tsvline'}] in a tsv file without an onset time.`,
  },
  duplicateTemporal: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`HED event string "${'string'}" has onset/offset/inset tags with duplicated definition "${'definition'}".`,
  },
  multipleTemporalTags: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`HED event string "${'string'}" has multiple temporal tags ${'tags'} in the same group.`,
  },
  multipleRequiresDefTags: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`HED event string "${'string'}" has multiple temporal tags ${'tags'} that require a definition in the same group.`,
  },
  simultaneousDuplicateEvents: {
    hedCode: 'TEMPORAL_TAG_ERROR',
    level: 'error',
    message: stringTemplate`Temporal tag group "${'tagGroup1'}" at ${'onset1'} line ${'tsvLine1'} is simultaneous with "${'tagGroup2'}" at ${'onset2'} line ${'tsvLine2'}.`,
  },
  missingTagGroup: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag(s) "${'tag'}" must appear in a tag group.`,
  },
  invalidTagGroup: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`"${'tagGroup'}" has invalid group tags or invalid number of subgroups.`,
  },
  forbiddenSubgroupTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" in "${'string'}" cannot have tags "${'tagList'}" in a subgroup.`,
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
    message: stringTemplate`Group "${'string'}" has too many or too few tags or Def-expand groups at the top level.`,
  },
  multipleTopLevelTagGroupTags: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" found in top-level tag group where "${'otherTag'}" was already defined.`,
  },
  invalidNumberOfSubgroups: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`The tag "${'tag'} is in a "${'string'} with too many or too few subgroups.`,
  },
  invalidTopLevelTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag(s) "${'tag'}" should be in a top group in "${'string'}".`,
  },
  invalidGroupTag: {
    hedCode: 'TAG_GROUP_ERROR',
    level: 'error',
    message: stringTemplate`Tag(s) "${'tag'}" should be in a group in "${'string'}".`,
  },
  // Tag conversion issues
  invalidParentNode: {
    hedCode: 'TAG_EXTENSION_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" does not have "${'parentTag'}" as its parent in the schema. ${'msg'}`,
  },
  invalidExtension: {
    hedCode: 'TAG_EXTENSION_INVALID',
    level: 'error',
    message: stringTemplate`"${'tag'}" appears as an extension of "${'parentTag'}". ${'msg'}`,
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
    message: stringTemplate`Closing curly brace at index ${'index'} of string "${'string'}" does not have a corresponding opening curly brace. ${'msg'}`,
  },
  unclosedCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Opening curly brace at index ${'index'} of string "${'string'}" does not have a corresponding closing curly brace. ${'msg'}`,
  },
  nestedCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Opening curly brace at index ${'index'} of string "${'string'}" when curly brace expression is already open.`,
  },
  emptyCurlyBrace: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Curly brace expression of string "${'string'}" is empty. ${'msg'}`,
  },
  curlyBracesInDefinition: {
    hedCode: 'DEFINITION_INVALID',
    level: 'error',
    message: stringTemplate`Illegal curly brace expression "${'sidecarKey'}" found in HED string containing definition "${'definition'}".`,
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
    message: stringTemplate`Sidecar key "${'sidecarKey'}", which has curly braces, is illegally referred to by a string using curly braces.`,
  },
  recursiveCurlyBracesWithKey: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Sidecar key "${'sidecarKey'}", which has curly braces, is referred to by sidecar key "${'referrer'}", which also has curly braces.`,
  },
  undefinedCurlyBraces: {
    hedCode: 'SIDECAR_BRACES_INVALID',
    level: 'error',
    message: stringTemplate`Sidecar key "${'sidecarKey'}", used in curly braces, is not mapped to a defined column.`,
  },
  // Schema issues
  invalidSchemaSpecification: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`The supplied HED schema specification is invalid. Specification: ${'spec'}.`,
  },
  missingSchemaSpecification: {
    hedCode: 'SCHEMA_LOAD_FAILED',
    level: 'error',
    message: stringTemplate`No valid HED schema specification was supplied.`,
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
    hedCode: 'TAG_NAMESPACE_PREFIX_INVALID',
    level: 'error',
    message: stringTemplate`Tag "${'tag'}" is declared to use a base schema in the dataset's schema listing, but no such schema was defined.`,
  },
  unmatchedLibrarySchema: {
    hedCode: 'TAG_NAMESPACE_PREFIX_INVALID',
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
    message: stringTemplate`Values "${'values'}" appear for sidecar key "${'sidecarKey'}" of file "${'file'}", but were not defined in any associated sidecar.`,
  },
  hedUsedAsSpliceButNoTsvHed: {
    hedCode: 'SIDECAR_KEY_MISSING',
    level: 'warning',
    message: stringTemplate`Key "{HED}" was referenced in sidecar for file "${'file'}", but this file does not have a HED column.`,
  },
  illegalSidecarHedType: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The HED data for sidecar key "${'sidecarKey'}" of file "${'filePath'}" is not either a key-value dictionary or a string.`,
  },
  illegalSidecarHedKey: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The string 'HED' or 'n/a' was illegally used as a top-level sidecar key.`,
  },
  illegalSidecarData: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The data associated with sidecar key "${'sidecarKey'}" cannot be parsed.`,
  },
  illegalSidecarHedCategoricalValue: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`The string 'HED' or 'n/a' was illegally used as a sidecar categorical value for sidecar key "${'sidecarKey'}" in sidecar "${'filePath'}".`,
  },
  illegalSidecarHedDeepKey: {
    hedCode: 'SIDECAR_INVALID',
    level: 'error',
    message: stringTemplate`An illegal "HED" appeared as a key below level 2 in a sidecar entry with top-level key "${'sidecarKey'}".`,
  },
  // Internal errors
  internalError: {
    hedCode: 'INTERNAL_ERROR',
    level: 'error',
    message: stringTemplate`Internal error - message: "${'message'}".`,
  },
  networkReadError: {
    hedCode: 'INTERNAL_ERROR',
    level: 'error',
    message: stringTemplate`I/O error when reading from network - server responded to URL "${'url'}" with HTTP status code ${'statusCode'} ${'statusText'}.`,
  },
  fileReadError: {
    hedCode: 'INTERNAL_ERROR',
    level: 'error',
    message: stringTemplate`I/O error when reading file or directory "${'fileName'}" - message: "${'message'}".`,
  },
  genericError: {
    hedCode: 'INTERNAL_ERROR',
    level: 'error',
    message: (parameters) =>
      `Unknown HED error "${parameters.internalCode}" - parameters: "${JSON.stringify(parameters)}".`,
  },
}

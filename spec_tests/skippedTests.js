/**
 * hed-tests cases that this validator does not pass yet, keyed by test case name.
 *
 * The runner (jsonTests.spec.js) skips a whole case by name and reports the reason in the jest
 * summary. Remove an entry once the case passes. Reasons record what was observed when the entry
 * was added, not a diagnosis. Set HED_RUN_SKIPPED=1 to run the listed cases anyway.
 *
 */
export const skippedTests = {
  'definition-invalid-identical-in-one-string':
    'Two identical definitions in one string are reported as TAG_EXPRESSION_REPEATED or DEFINITION_INVALID (issue #993).',
  'definition-invalid-name-case':
    'Definition names that differ only in case are reported as DEFINITION_INVALID (issue #993).',
  'tag-expression-repeated-value-case':
    'Repeats whose extension or definition name differs in case are not reported (issue #995).',
  'element-deprecated-unit': 'No ELEMENT_DEPRECATED warning for a deprecated unit or unit modifier (issue #994).',
  'sidecar-invalid-annotation-empty':
    'An n/a annotation gives TAG_INVALID; empty and blank annotations are not SIDECAR_INVALID (issue #996).',
  'placeholder-invalid-json-value-column':
    'An empty, blank, or n/a value-column annotation is not PLACEHOLDER_INVALID (issue #996).',
  'sidecar-key-missing': 'An n/a annotation gives TAG_INVALID (issue #996).',
  'tag-expression-repeated-hed-column-reference':
    'Curly-brace substitutions of a sidecar annotation are not checked (issue #997, rule 10 of 3.2.9.3).',
  'tag-expression-repeated-reference-removed':
    'Curly-brace substitutions of a sidecar annotation are not checked (issue #997, rule 10 of 3.2.9.3).',
  'tag-expression-repeated-curly-brace-substitution':
    'Curly-brace substitutions of a sidecar annotation are not checked (issue #997, rule 10 of 3.2.9.3).',
}

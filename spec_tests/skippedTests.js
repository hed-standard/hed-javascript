/**
 * hed-tests cases that this validator does not pass yet, keyed by test case name.
 *
 * The runner (jsonTests.spec.js) skips a whole case by name and reports the reason in the jest
 * summary. Remove an entry once the case passes. Reasons record what was observed when the entry
 * was added, not a diagnosis. Set HED_RUN_SKIPPED=1 to run the listed cases anyway.
 *
 */
export const skippedTests = {
  'tag-namespace-prefix-case-insensitive':
    'Namespace prefixes are matched with case (namespace names are case-insensitive since specification 3.1.1).',
  'tag-namespace_prefix-with-colon-values':
    'Namespace prefixes are matched with case (namespace names are case-insensitive since specification 3.1.1).',
  'tag-expression-repeated-namespace-case':
    'Namespace prefixes are matched with case (namespace names are case-insensitive since specification 3.1.1).',
  'standard-version-twice-in-namespace-differing-case':
    'Namespace prefixes are matched with case (namespace names are case-insensitive since specification 3.1.1).',
  'tag-blank-next-to-slash-in-value':
    'A blank next to a slash inside a value is reported as TAG_INVALID (specification TAG_INVALID b).',
}

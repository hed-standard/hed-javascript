/**
 * hed-tests cases that hed-javascript does not pass yet, keyed by test case name.
 *
 * The runner (hedTests.spec.js) skips a whole case by name and reports the reason in the jest
 * summary. Remove an entry once the case passes. Reasons record what was observed when the entry
 * was added, not a diagnosis. Set HED_RUN_SKIPPED=1 to run the listed cases anyway.
 *
 */
export const skippedTests = {
  'temporal-tag-error-delay-with-anchored-marker':
    'two string_tests passes (a lone Inset and a lone Offset) fail: the runner validates each string as a one-row ' +
    'timeline file, where an Offset or Inset with no earlier Onset is TEMPORAL_TAG_ERROR (hed-tests 07ac29a, 2026-10-12)',
}

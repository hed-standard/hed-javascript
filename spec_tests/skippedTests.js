/**
 * hed-tests cases that hed-javascript does not pass yet, keyed by test case name.
 *
 * The runner (hedTests.spec.js) skips a whole case by name and reports the reason in the jest
 * summary. Remove an entry once the case passes. Reasons record what was observed when the entry
 * was added, not a diagnosis. Set HED_RUN_SKIPPED=1 to run the listed cases anyway.
 *
 * Empty since 2026-10-07 (hed-tests 183c235): every validation case passes.
 */
export const skippedTests = {}

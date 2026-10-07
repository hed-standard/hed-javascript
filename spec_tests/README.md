# HED spec tests

This directory runs the official HED JSON test suite from the
[hed-tests](https://github.com/hed-standard/hed-tests) repository against this validator.

## Getting the test data

The suite lives in the git submodule `spec_tests/hed-tests`, pinned to a specific hed-tests
commit. It is empty in a plain clone until you fetch it:

```powershell
git submodule update --init
```

or clone with `git clone --recurse-submodules`. The runner fails with a message pointing here if
the submodule is missing.

## Running the tests

```powershell
npm run testSpecs
```

This is equivalent to `npx jest --testPathPatterns='/spec_tests/'`.

## Files

- **hedTests.spec.js** - the runner. Reads
  `hed-tests/json_test_data/validation_tests.json` and runs every case's string, sidecar,
  events and sidecar+events sub-tests through the BIDS validation entry points. A failing case
  passes when one of its `error_code` or `alt_codes` is among the errors returned (among the
  warnings, with no errors, when the case has `warning: true`). A passing case passes when no
  errors are returned (and no warnings when `warning: true`).
- **skippedTests.js** - cases this validator does not pass yet, keyed by test case name with a
  one-line reason. Each listed case is reported as skipped in the jest summary. Remove the entry
  once the case passes.
- **hed-tests/** - the submodule. Do not edit files inside it; changes to the test suite go to
  the hed-tests repository.

## Schema loading

Cases name schemas by version string (`8.4.0`, `ts:testconflict_2.1.0`, ...). Following the
convention in `hed-tests/json_test_data/test_schemas/README.md`, the runner resolves each version
string against `hed-tests/json_test_data/test_schemas/hedxml/` by cache-convention file name
(`HED<version>.xml` or `HED_<library>_<version>.xml`) when such a file exists, and otherwise
against the schemas bundled in `src/data/schemas/`. The test-only libraries (`testconflict`,
`testclash`, `testminimal`, `testaux`) and the vendored 8.5.0 prerelease therefore need no
network access. When building the schemas for a case throws, that issue is the result of every
sub-test of the case, which is how the SCHEMA_LOAD_FAILED cases are checked.

## Schema tests are not run

hed-tests also ships `schema_tests.json`, which checks that validators detect errors in HED
schema files themselves (the cases are mediawiki schema source text). hed-javascript assumes the
schemas it loads are valid and does not implement schema validation, so that file is skipped as a
block in `hedTests.spec.js` and is not part of this validator's conformance target.

## Updating the pin

```powershell
git -C spec_tests/hed-tests fetch origin
git -C spec_tests/hed-tests checkout <commit-or-origin/main>
npm run testSpecs
```

Add any newly failing case to `skippedTests.js` with a reason (or fix it), then commit the
submodule pointer together with the skip-list change.

## Debugging one case

At the top of `hedTests.spec.js`, set `runAll` to `false` and put the error code and case names
in `runMap`, or keep `runAll` and list cases in `skipMap`. `runOnly` restricts the sub-test kinds
(`stringPass`, `stringFail`, `sidecarPass`, `sidecarFail`, `eventsPass`, `eventsFail`,
`comboPass`, `comboFail`).

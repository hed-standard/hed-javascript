# HED spec tests

This directory contains the HED specification-level test suite.

## Running tests

Run the spec tests using the npm script:

```powershell
npm run testSpecs
```

This is equivalent to:

```powershell
npx jest --testPathPatterns='spec_tests/'
```

## Test files

- **jsonTests.spec.js** — The main spec test suite that runs HED validation tests against test cases defined in `javascriptTests.json`. It validates parser behavior, BIDS support, and schema compliance using a comprehensive set of test vectors.

- **javascriptTests.json** — Data file containing the test cases used by `jsonTests.spec.js`. Includes test scenarios for tag parsing, definition validation, BIDS file validation, and error handling.

## About spec tests

Spec tests validate the validator against the HED specification and ensure that all validator behavior is correct according to the spec. These are distinct from unit tests in `tests/` which test individual modules and functions.

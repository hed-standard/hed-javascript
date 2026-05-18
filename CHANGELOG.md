# Changelog

## 4.2.0 — 2026-05-18

### Added

- `BidsWebAccessor` — a new browser-compatible BIDS file accessor that 
  reads dataset files from browser `File` objects provided via an
  `<input webkitdirectory>` element or drag-and-drop upload. Schema loading is
  performed via remote HTTPS fetching. This enables in-browser BIDS/HED
  validation without a server. ([#718])

- Tests for `BidsWebAccessor` covering core accessor behavior. ([#718])

- The main package is now fully browser-friendly via its ESM build
  (`dist/esm/index.js`). The `exports` map exposes both `browser` and
  `import` conditions pointing to the ESM bundle. ([#719])

### Changed

- The browser UI application (`browser/`) has been removed from this package
  and moved to a dedicated repository:
  [hed-standard/hed-web](https://github.com/hed-standard/hed-web). ([#721])

- CI GitHub Actions: the `deploy-pages` workflow now deploys documentation
  only; browser app build steps have been removed. ([#720])

- Bundling refactored for better ESM/browser compatibility (stage 1). ([#719])

- `ts-jest` removed from dev dependencies; TypeScript upgraded to 6.0.2, then
  6.0.3. ([#697])

- `tsconfig.json` handling revised to address TypeScript 6.x deprecations. ([#692])

- README updated to reflect separation of browser interface into `hed-web`. ([#721])

### Fixed

- Picomatch security vulnerability addressed. ([#692])

- CI workflow permissions tightened to reduce attack surface. ([#692])

### Dependencies

- `fast-xml-parser` updated through 5.5.8 → 5.8.0 ([#728], [#732])
- `fast-xml-builder` updated 1.1.5 → 1.2.0 ([#722])
- `eslint` updated through 10.1.0 → 10.4.0 ([#730])
- `@babel/preset-env` updated 7.29.0 → 7.29.5 ([#724])
- `@babel/plugin-transform-modules-systemjs` updated 7.29.0 → 7.29.4 ([#723])
- `jest` / `jest-environment-node` / `@jest/globals` updated 30.3.0 → 30.4.2 ([#725], [#727], [#734])
- `semver` updated 7.7.4 → 7.8.0 ([#726])
- `tsx` updated 4.21.0 → 4.22.2 ([#731])
- `globals` updated 17.4.0 → 17.6.0
- `prettier` updated 3.8.1 → 3.8.3
- `typedoc` updated 0.28.18 → 0.28.19
- `@types/node` updated 25.5.0 → 25.9.0 ([#733])
- `typescript` updated 6.0.2 → 6.0.3
- `actions/deploy-pages` updated 4 → 5
- `actions/upload-pages-artifact` updated 4 → 5

[#692]: https://github.com/hed-standard/hed-javascript/pull/692
[#697]: https://github.com/hed-standard/hed-javascript/pull/697
[#718]: https://github.com/hed-standard/hed-javascript/pull/718
[#719]: https://github.com/hed-standard/hed-javascript/pull/719
[#720]: https://github.com/hed-standard/hed-javascript/pull/720
[#721]: https://github.com/hed-standard/hed-javascript/pull/721
[#722]: https://github.com/hed-standard/hed-javascript/pull/722
[#723]: https://github.com/hed-standard/hed-javascript/pull/723
[#724]: https://github.com/hed-standard/hed-javascript/pull/724
[#725]: https://github.com/hed-standard/hed-javascript/pull/725
[#726]: https://github.com/hed-standard/hed-javascript/pull/726
[#727]: https://github.com/hed-standard/hed-javascript/pull/727
[#728]: https://github.com/hed-standard/hed-javascript/pull/728
[#730]: https://github.com/hed-standard/hed-javascript/pull/730
[#731]: https://github.com/hed-standard/hed-javascript/pull/731
[#732]: https://github.com/hed-standard/hed-javascript/pull/732
[#733]: https://github.com/hed-standard/hed-javascript/pull/733
[#734]: https://github.com/hed-standard/hed-javascript/pull/734

---

## 4.1.4 — 2025-08-11

### Changed

- Replaced the `xml2js` XML parser with `fast-xml-parser`. `xml2js` was
  causing multiple downstream build issues as well as problems in this package
  itself.

- Simplified and refactored schema XML parsing code: merged the mini-XPath
  parser into the main parser class and refactored several methods.

- CI GitHub Actions updated to use OpenID Connect for npm publishing instead
  of long-lived access tokens.

- Package `repository` URL shortened to canonical short form in
  `package.json`.

- Type test infrastructure: added a Unix shell script for running type tests
  locally; switched to standard Bourne shell.

---

## 4.1.3 — 2025-08-11

### Changed

- Merged the ESM build configurations, which had been split in 4.1.0, using
  the browser configuration as the base. This resolves remaining build issues
  introduced by the split. ([#527])

- Updated test configuration for compatibility with Node 22.

[#527]: https://github.com/hed-standard/hed-javascript/pull/527

---

## 4.1.2 — 2025-08-09

### Changed

- Replaced the `cross-fetch` polyfill with Node's built-in `fetch`. As a
  result the minimum Node.js version has been bumped from 18 to 22. ([#526])

- JSON spec tests are now excluded from the default `npm test` run; they only
  execute via `npm run testSpecs`. ([#526])

[#526]: https://github.com/hed-standard/hed-javascript/pull/526

---

## 4.1.1 — 2025-08-09

This patch release fixes type declaration issues discovered in 4.1.0.

### Fixed

- TypeScript type declarations corrected to match the intended public interface
  and the BIDS validator integration code. ([#524])

- Potential null-pointer dereferences in `BidsFile` subclasses fixed. ([#524])

- Windows CR-LF line endings converted to Unix LF throughout the repository.
  ([#525])

[#524]: https://github.com/hed-standard/hed-javascript/pull/524
[#525]: https://github.com/hed-standard/hed-javascript/pull/525

---

## 4.1.0 — 2025-08-05

### Added

- Initial browser-based HED validation application (`browser/`): dataset
  upload, sidecar merging, and JSON validation; interface elements including
  validation buttons, clear/reset, and issue-report download; full support for
  both web and filesystem workflows. ([#400], [#403], [#416], [#417])

- TypeScript type declarations (`types/index.d.ts`) for the public API. ([#496])

- Scripts for local type testing:
  `scripts/test-types-local-windows.ps1`,
  `scripts/test-types-local-unix.sh`, and
  `scripts/test-types-local.js`. ([#496])

- Bundled HED schemas expanded: now includes HED 8.4.0 and other current
  schema versions, with proper access across environments. ([#381], [#443],
  [#496])

- Static factory methods on BIDS file classes for constructing objects directly
  from file paths. ([#384], [#397])

- Jekyll-based GitHub Pages site hosting the TypeDoc API documentation and the
  browser validator. ([#426], [#428])

### Changed

- TypeDoc API documentation reorganized and enhanced. ([#426], [#428], [#436])

- Test framework split into separate paths for Node and browser environments.
  ([#344], [#445], [#446])

- Code coverage configuration moved from Code Climate to Qlty. ([#520])

- GitHub Actions CI workflows updated: added browser test automation and
  stabilized the deployment flow. ([#344], [#445], [#446])

- Internal file-loading, schema-parsing, and environment-separation code
  reorganized. ([#468], [#510])

- Tokenizer and sidecar context-based error reporting improved. ([#468])

- Legacy dependencies removed; Jest and Vite configurations improved.

### Dependencies

- `eslint` updated 9.22.0 → 9.31.0
- `typedoc` updated 0.28.0 → 0.28.7
- `typescript` updated 5.8.2 → 5.8.3
- `jest` updated 29.7.0 → 30.0.5
- `prettier` updated 3.5.3 → 3.6.2
- `esbuild` updated 0.25.1 → 0.25.8
- Related plugins (`eslint-plugin-prettier`, `eslint-config-prettier`, etc.)
  updated accordingly

[#344]: https://github.com/hed-standard/hed-javascript/pull/344
[#381]: https://github.com/hed-standard/hed-javascript/pull/381
[#384]: https://github.com/hed-standard/hed-javascript/pull/384
[#397]: https://github.com/hed-standard/hed-javascript/pull/397
[#400]: https://github.com/hed-standard/hed-javascript/pull/400
[#403]: https://github.com/hed-standard/hed-javascript/pull/403
[#416]: https://github.com/hed-standard/hed-javascript/pull/416
[#417]: https://github.com/hed-standard/hed-javascript/pull/417
[#426]: https://github.com/hed-standard/hed-javascript/pull/426
[#428]: https://github.com/hed-standard/hed-javascript/pull/428
[#436]: https://github.com/hed-standard/hed-javascript/pull/436
[#443]: https://github.com/hed-standard/hed-javascript/pull/443
[#445]: https://github.com/hed-standard/hed-javascript/pull/445
[#446]: https://github.com/hed-standard/hed-javascript/pull/446
[#468]: https://github.com/hed-standard/hed-javascript/pull/468
[#496]: https://github.com/hed-standard/hed-javascript/pull/496
[#510]: https://github.com/hed-standard/hed-javascript/pull/510
[#520]: https://github.com/hed-standard/hed-javascript/pull/520

---

## 4.0.1 — 2025-03-17

### Fixed

- Fixed a bug in which top-level tags used inside column splices were not
  correctly validated as part of a group when appearing in sidecars. ([#321],
  [#322], [#324])

- Added a stronger validity check for spliced group issues. ([#326])

- Added tests for `n/a` handling in the onset column. ([#319])

### Changed

- Private fields and methods reverted from JavaScript `#`-prefix syntax back
  to underscore-prefix convention, due to a lack of tool support for the
  number-sign syntax.

- GitHub Actions test configuration restructured. ([#323])

- Code Climate issues addressed. ([#320])

### Dependencies

- `esbuild` updated 0.25.0 → 0.25.1 ([#316])
- `eslint` / `@eslint/js` updated 9.21.0 → 9.22.0 ([#313], [#314])
- `eslint-config-prettier` updated 10.0.2 → 10.1.1 ([#317])
- `pretty-quick` updated 4.0.0 → 4.1.1 ([#315])
- `typedoc` updated 0.27.9 → 0.28.0 ([#325])

[#313]: https://github.com/hed-standard/hed-javascript/pull/313
[#314]: https://github.com/hed-standard/hed-javascript/pull/314
[#315]: https://github.com/hed-standard/hed-javascript/pull/315
[#316]: https://github.com/hed-standard/hed-javascript/pull/316
[#317]: https://github.com/hed-standard/hed-javascript/pull/317
[#319]: https://github.com/hed-standard/hed-javascript/pull/319
[#320]: https://github.com/hed-standard/hed-javascript/pull/320
[#321]: https://github.com/hed-standard/hed-javascript/issues/321
[#322]: https://github.com/hed-standard/hed-javascript/pull/322
[#323]: https://github.com/hed-standard/hed-javascript/pull/323
[#324]: https://github.com/hed-standard/hed-javascript/pull/324
[#325]: https://github.com/hed-standard/hed-javascript/pull/325
[#326]: https://github.com/hed-standard/hed-javascript/pull/326

---

## 4.0.0 — 2025-03-08

This is the fourth major version of `hed-validator` — a substantial rewrite of
the code and public interface. It delivers full compliance with the current
HED-3G specification and correct implementation of definition and temporal tag
validation, which were not properly implemented in earlier versions.

> **Note:** This release was inadvertently published to npm as version 5.0.0 due
> to a typo. That npm release has been pulled. Use v4.0.0.

### Added

- Complete new validation pipeline: tokenizer, splitter, parser, and tag
  converter rewritten from scratch with HED-3G compliance. ([#208], [#212],
  [#213], [#219], [#227])

- Object-based JSON test datasets replacing the previous inline JavaScript
  test cases; test data separated from test scripts. ([#208], [#209], [#210],
  [#220])

- JSON-based spec tests shared with the Python HED validator, run as a
  separate GitHub Actions workflow. ([#236], [#275])

- Full support for definition and temporal tag validation: `Definition`,
  `Onset`, `Offset`, `Duration`, and `Delay` tags handled correctly,
  including duplicate-onset detection. ([#225], [#226], [#228], [#237],
  [#238], [#239], [#243])

- Warning support added alongside errors: `deprecated` and `extension`
  warnings, missing sidecar key warnings. ([#293], [#294], [#295])

- Bundled Score 2.0.0 schema data. ([#204], [#302])

- `esbuild` build producing `dist/commonjs/` and `dist/esm/` outputs. ([#267])

- Dependabot configuration for automated dependency updates. ([#254])

- JSON spec test support extended to handle multi-schema versions. ([#276])

### Changed

- **Public API redesigned.** The previous APIs giving direct access to
  parsing, schema-loading, and validation internals have been removed. The
  dataset-level validation API (`BidsDataset`) has also been removed due to
  performance issues with large datasets. ([#279])

  The public API is:
  - `BidsSidecar` — JSON sidecar files
  - `BidsJsonFile` — non-sidecar JSON files (e.g. `dataset_description.json`)
  - `BidsTsvFile` — TSV event files
  - `BidsHedIssue` — issue objects type-compatible with the BIDS `Issue` type
  - `buildBidsSchemas(datasetDescription)` — async function returning a
    `Schemas` object (opaque to callers) from a `BidsJsonFile` of
    `dataset_description.json`
  - Validation is performed by calling `.validate(schemas)` on any `BidsFile`
    subclass

- Source code reorganized under `src/`, with issues moved to `src/issues/`.
  ([#248], [#251])

- Validation now stops at the first error found rather than attempting to
  collect all errors, reducing spurious cascading error messages.

- Issue handling revamped: `IssueError` used throughout; special issue
  parameters moved to a static `Map`. ([#287], [#288], [#311])

- Error codes updated and aligned with the HED spec. ([#288])

- `BidsFile` constructor parameter order changed: file object before data
  arguments. ([#285])

- `BidsFile` constructor signatures finalized for BIDS validator
  compatibility. ([#301], [#310])

- Private fields on `SchemaTag` converted to use setters. ([#241])

- Documentation (JSDoc) corrected and improved; sphinx-js removed due to
  security issues; TypeDoc adopted. ([#245], [#246], [#247], [#249], [#250])

- Unused code removed: `RegexClass`, skipped tests, legacy dependencies.
  ([#244], [#252])

- husky configuration updated. ([#309])

- Date-time value class parsing corrected to avoid confusion with namespace
  syntax. ([#272])

### Removed

- HED version 2 support removed entirely. ([#216])

- Syntax-only validation mode removed.

- `BidsDataset` and whole-dataset validation API removed. ([#279])

- `sphinx` and `sphinx-js` dev dependencies removed. ([#249], [#250])

### Dependencies

- `typedoc` updated 0.25.13 → 0.27.9 ([#255])
- `typescript` updated 5.4.5 → 5.8.2 ([#260], [#305])
- `eslint` updated 8.22.0 → 9.22.0 ([#261], then incrementally)
- `prettier` updated 3.2.5 → 3.5.3 ([#266], [#282], [#291], [#298], [#307])
- `esbuild` updated 0.20.2 → 0.25.0 ([#267], [#284])
- `semver` updated 7.6.0 → 7.7.1 ([#257], [#277], [#289])
- `globals` updated 15.14.0 → 16.0.0 ([#290], [#308])
- `husky` updated 9.0.11 → 9.1.7 ([#256])
- `cross-fetch` updated 4.0.0 → 4.1.0 ([#259])
- `unicode-name` updated 1.0.2 → 1.0.4 ([#262])
- `date-fns` updated 3.6.0 → 4.1.0 ([#264])
- `date-and-time` updated 3.1.1 → 3.6.0 ([#265])
- `eslint-config-prettier` updated 9.1.0 → 10.0.2 ([#258])
- `eslint-plugin-prettier` updated 5.1.3 → 5.2.3 ([#263])

[#204]: https://github.com/hed-standard/hed-javascript/pull/204
[#208]: https://github.com/hed-standard/hed-javascript/pull/208
[#209]: https://github.com/hed-standard/hed-javascript/pull/209
[#210]: https://github.com/hed-standard/hed-javascript/pull/210
[#212]: https://github.com/hed-standard/hed-javascript/pull/212
[#213]: https://github.com/hed-standard/hed-javascript/pull/213
[#216]: https://github.com/hed-standard/hed-javascript/pull/216
[#219]: https://github.com/hed-standard/hed-javascript/pull/219
[#220]: https://github.com/hed-standard/hed-javascript/pull/220
[#225]: https://github.com/hed-standard/hed-javascript/pull/225
[#226]: https://github.com/hed-standard/hed-javascript/pull/226
[#227]: https://github.com/hed-standard/hed-javascript/pull/227
[#228]: https://github.com/hed-standard/hed-javascript/pull/228
[#236]: https://github.com/hed-standard/hed-javascript/pull/236
[#237]: https://github.com/hed-standard/hed-javascript/pull/237
[#238]: https://github.com/hed-standard/hed-javascript/pull/238
[#239]: https://github.com/hed-standard/hed-javascript/pull/239
[#241]: https://github.com/hed-standard/hed-javascript/pull/241
[#243]: https://github.com/hed-standard/hed-javascript/pull/243
[#244]: https://github.com/hed-standard/hed-javascript/pull/244
[#245]: https://github.com/hed-standard/hed-javascript/pull/245
[#246]: https://github.com/hed-standard/hed-javascript/pull/246
[#247]: https://github.com/hed-standard/hed-javascript/pull/247
[#248]: https://github.com/hed-standard/hed-javascript/pull/248
[#249]: https://github.com/hed-standard/hed-javascript/pull/249
[#250]: https://github.com/hed-standard/hed-javascript/pull/250
[#251]: https://github.com/hed-standard/hed-javascript/pull/251
[#252]: https://github.com/hed-standard/hed-javascript/pull/252
[#254]: https://github.com/hed-standard/hed-javascript/pull/254
[#255]: https://github.com/hed-standard/hed-javascript/pull/255
[#256]: https://github.com/hed-standard/hed-javascript/pull/256
[#257]: https://github.com/hed-standard/hed-javascript/pull/257
[#258]: https://github.com/hed-standard/hed-javascript/pull/258
[#259]: https://github.com/hed-standard/hed-javascript/pull/259
[#260]: https://github.com/hed-standard/hed-javascript/pull/260
[#261]: https://github.com/hed-standard/hed-javascript/pull/261
[#262]: https://github.com/hed-standard/hed-javascript/pull/262
[#263]: https://github.com/hed-standard/hed-javascript/pull/263
[#264]: https://github.com/hed-standard/hed-javascript/pull/264
[#265]: https://github.com/hed-standard/hed-javascript/pull/265
[#266]: https://github.com/hed-standard/hed-javascript/pull/266
[#267]: https://github.com/hed-standard/hed-javascript/pull/267
[#272]: https://github.com/hed-standard/hed-javascript/pull/272
[#275]: https://github.com/hed-standard/hed-javascript/pull/275
[#276]: https://github.com/hed-standard/hed-javascript/pull/276
[#277]: https://github.com/hed-standard/hed-javascript/pull/277
[#279]: https://github.com/hed-standard/hed-javascript/pull/279
[#282]: https://github.com/hed-standard/hed-javascript/pull/282
[#284]: https://github.com/hed-standard/hed-javascript/pull/284
[#285]: https://github.com/hed-standard/hed-javascript/pull/285
[#287]: https://github.com/hed-standard/hed-javascript/pull/287
[#288]: https://github.com/hed-standard/hed-javascript/pull/288
[#289]: https://github.com/hed-standard/hed-javascript/pull/289
[#290]: https://github.com/hed-standard/hed-javascript/pull/290
[#291]: https://github.com/hed-standard/hed-javascript/pull/291
[#293]: https://github.com/hed-standard/hed-javascript/pull/293
[#294]: https://github.com/hed-standard/hed-javascript/pull/294
[#295]: https://github.com/hed-standard/hed-javascript/pull/295
[#298]: https://github.com/hed-standard/hed-javascript/pull/298
[#301]: https://github.com/hed-standard/hed-javascript/pull/301
[#302]: https://github.com/hed-standard/hed-javascript/pull/302
[#305]: https://github.com/hed-standard/hed-javascript/pull/305
[#307]: https://github.com/hed-standard/hed-javascript/pull/307
[#308]: https://github.com/hed-standard/hed-javascript/pull/308
[#309]: https://github.com/hed-standard/hed-javascript/pull/309
[#310]: https://github.com/hed-standard/hed-javascript/pull/310
[#311]: https://github.com/hed-standard/hed-javascript/pull/311

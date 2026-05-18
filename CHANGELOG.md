# Changelog

All notable changes to `hed-validator` will be documented in this file.

<!-- scriv-insert-here -->

<a id='changelog-4.2.0'></a>
## 4.2.0 — 2026-05-11

### Added

- `BidsWebAccessor` — a new browser-compatible BIDS file accessor that reads
  dataset files from browser `File` objects provided via an
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

- `fast-xml-parser` updated through 5.5.8 → 5.7.2
- `eslint` updated through 10.1.0 → 10.3.0
- `@babel/preset-env` updated 7.29.0 → 7.29.3
- `@babel/plugin-transform-modules-systemjs` updated
- `globals` updated 17.4.0 → 17.6.0
- `prettier` updated 3.8.1 → 3.8.3
- `typedoc` updated 0.28.18 → 0.28.19
- `@types/node` updated 25.5.0 → 25.6.0
- `typescript` updated 6.0.2 → 6.0.3
- `actions/deploy-pages` updated 4 → 5
- `actions/upload-pages-artifact` updated 4 → 5

[#692]: https://github.com/hed-standard/hed-javascript/pull/692
[#697]: https://github.com/hed-standard/hed-javascript/pull/697
[#718]: https://github.com/hed-standard/hed-javascript/pull/718
[#719]: https://github.com/hed-standard/hed-javascript/pull/719
[#720]: https://github.com/hed-standard/hed-javascript/pull/720
[#721]: https://github.com/hed-standard/hed-javascript/pull/721

---

<a id='changelog-4.1.4'></a>
## 4.1.4 — 2025-08-11

- Package repository URL shortened to short form in `package.json`.
- Type test infrastructure: added Unix shell script for running type tests
  locally; switched to standard Bourne shell.
- ESM build configurations merged.

---

<a id='changelog-4.1.3'></a>
## 4.1.3 — 2025-08-11

- Updated test configuration to be compatible with Node 22.

---

<a id='changelog-4.1.2'></a>
## 4.1.2 — 2025-08-09

- Replaced `xml2js` with `fast-xml-parser`.
- Switched from `cross-fetch` to Node's internal `fetch` (requires Node ≥ 22).

---

<a id='changelog-4.1.1'></a>
## 4.1.1 — 2025-08-07

- Fixed type declaration issues from 4.1.0 release.

---

<a id='changelog-4.1.0'></a>
## 4.1.0 — 2025-08-05

- Added `types/index.d.ts` — full TypeScript type declarations for the public API.
- Added scripts for local type testing (`scripts/test-types-local*.{js,sh,ps1}`).
- Upgraded to Jest 30.

---

<a id='changelog-4.0.1'></a>
## 4.0.1 — 2025-03-17

- Recursive attribute processing refactored.
- Upgraded esbuild, eslint, typedoc.

---

<a id='changelog-4.0.0'></a>
## 4.0.0 — 2025-03-08

Major rewrite. Key changes:
- Full ESM module structure.
- New BIDS integration layer: `BidsDataset`, `BidsTsvFile`, `BidsJsonFile`,
  `BidsSidecar`, `BidsHedIssue`, `buildBidsSchemas`.
- Browser-compatible build via esbuild (`dist/esm/`, `dist/commonjs/`).
- Replaced `xml2js` dependency pipeline with `fast-xml-parser`.
- Removed `date-and-time` and `path` runtime dependencies.

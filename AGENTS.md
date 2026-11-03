# hed-javascript

Purpose: the `hed-validator` npm package, a JavaScript validator for HED (Hierarchical Event Descriptor) strings, sidecars, TSV files and BIDS datasets, for Node.js (CommonJS and ESM) and the browser. Not in scope: the HED schemas themselves (hed-schemas), the specification and its test suite (hed-specification, hed-tests), and the web front end (hed-web).

## Commands

Test framework: Jest (with babel-jest). Tests are `*.spec.js` files. Never convert the suite to another framework as a side effect of other work.

- Install dev env: `npm install` (CI uses `npm ci`). Node.js 22 or later.
- Fetch the spec test submodule: `git submodule update --init` (`spec_tests/hed-tests`).
- Run unit tests: `npm test` (everything under `tests/`).
- Run spec tests: `npm run testSpecs` (the hed-tests suite through `spec_tests/jsonTests.spec.js`; skips are listed in `spec_tests/skippedTests.js`).
- Single test file: `npx jest tests/otherTests/hed.spec.js`
- Lint: `npm run lint` (ESLint on `src/`).
- Format check: `npx prettier --check "src/**/*.js"` (settings in `.prettierrc.yaml`).
- Build: `npm run build` (esbuild -> `dist/`, not committed).
- Type declarations: `npm run build`, then `npm run test-types-local`.
- API docs: `npm run docs` (TypeDoc -> `docs/html/`, not committed).

The husky pre-commit hook runs pretty-quick on staged `src/` files, `npm test` and `npm run testSpecs`.

## Layout

- `index.js` - the public API; re-exports from `src/`.
- `src/bids/` - BIDS datasets, sidecars and TSV files: parsing, file accessors (`accessors/`, with `.browser.js` variants) and validation (`validator/`).
- `src/parser/` - HED string parsing: tokenizer, splitter, parsed tag/group/string classes, definition and reserved-tag checks.
- `src/schema/` - schema loading and merging. `loader.js` is the Node.js loader and `browserLoader.js` the browser one (switched by the `browser` field in `package.json`); `entries/` has one schema entry class per file and `parser/` one entry-type parser per file.
- `src/issues/` - issue codes and messages.
- `src/data/schemas/` - bundled HED XML schemas. `src/data/json/` - JSON files copied from hed-specification.
- `src/utils/` - general utilities.
- `tests/` - unit tests: `jsonTests/` with data in `jsonTestData/`, `otherTests/`, `schemaData/`, `bidsDemoData/` (a sample BIDS dataset) and `testHelpers/`.
- `spec_tests/` - runs the hed-tests suite; `spec_tests/hed-tests` is a git submodule.
- `types/` - hand-written TypeScript declarations (`index.d.ts`) and their test (`test.ts`).
- `scripts/` - helpers for the type-declaration tests.
- `.status/` - working notes. Gitignored; local to each machine.

## Conventions that differ from defaults

- **ASCII only** in prose, code, comments, and filenames: `-` not em or en dashes, `->` not arrows, `...` not an ellipsis character, straight quotes. Exception: genuine data (author names, dataset titles, recorded API responses) keeps whatever characters it actually contains.
- Markdown headers use sentence case: capitalize the first word and proper nouns only.
- Source is plain JavaScript, formatted by Prettier: single quotes, no semicolons, trailing commas, 120 columns.
- Private class members are written `_x` with a JSDoc `@private` tag, never ECMAScript `#x`. ESLint's `no-restricted-syntax` rule rejects `#x`.
- In Markdown, command blocks are fenced as `shell`; other code keeps its language tag.

## Rules that are easy to get wrong

- `src/data/json/reservedTags.json` and `src/data/json/characterSets.json` are verbatim copies of hed-specification files. `reserved_tags.yml` and `character_sets.yml` check them byte for byte, and `.prettierignore` keeps Prettier off them. Never edit or reformat them; replace them with the upstream file.
- `jest.config.js` has a `transformIgnorePatterns` entry that lets `unicode-name` and `semver` be transformed. Removing it breaks those imports in tests.
- `npm run testSpecs` and part of `npm test` read schemas from the `spec_tests/hed-tests` submodule. A checkout without the submodule fails there; CI checks it out with `submodules: true`.
- The type-declaration tests need a fresh `npm run build` first.
- Changes reach `main` only by pull request.
- CI fails on any tracked text file with CRLF line endings. `.gitattributes` and `.editorconfig` keep files LF.

## Related repositories

- `hed-typescript` - the TypeScript implementation of the same validator. The two are kept portable in both directions: behavior is defined here and style follows hed-typescript.
- `hed-tests` - the specification test suite, included as the `spec_tests/hed-tests` submodule.
- `hed-specification` - the source of the JSON files in `src/data/json/`.
- `hed-schemas` - the source of the bundled schemas in `src/data/schemas/`.
- `hed-web` - a consumer of this package in the browser.

None of them are vendored here except the submodule; a session that needs one must be granted access to that checkout.

## Where the thinking lives

`.status/` is gitignored, so it exists only on the machine that wrote it and never in a fresh clone or worktree.

- `.status/README.md` - current state, unfinished work, and an ordered `Next` list. Read this first.
- `.status/development_history.md` - what has shipped, newest first, with pointers to the records. History only; append at the top when a PR merges.
- `.status/decisions.md` - why things are the way they are. Read before proposing structural changes. Append entries; never rewrite one.
- `.status/plans/*.md` - unfinished plans only. Check the `Status:` header and the `[ ]` / `[x]` markers before starting work. A finished plan moves to `.status/archive/completed_plans/`, renamed `archived_YYYY-MM-DD_<name>` with the day it was archived; split any still-open boxes into a new plan first.
- `.status/notes/` - dated records, always named `YYYY-MM-DD_<slug>.md`. Write-once.
- `.status/local-environment.md` - this machine's paths, interpreter, and quirks. Tool-agnostic. Never copy its contents into a committed file.
- IMPORTANT: do not read `.status/archive/` unless a file is named for you. The `.status/` root holds only `README.md`, `decisions.md`, `development_history.md`, and `local-environment.md`; nothing else is created there.

## Working agreements

- IMPORTANT: every file written to `.status/` opens with a `For humans:` summary - three or four sentences, at the very top: what the file is and what a person needs to take from it. The same applies to a long answer in a session: lead with the conclusion.
- IMPORTANT: temporary scripts, experiments, and one-off test files go in `.status/scratch/` - **never the repository root**. Delete them when the experiment ends; anything in `scratch/` may be deleted unread.
- IMPORTANT: never delete or rewrite a file under `.status/` without asking first. Appending is fine.
- For a change spanning more than three files, write a plan to `.status/plans/` and stop for review before editing.
- When you are guessing about an external API or data format, say so explicitly rather than assuming.
- Show evidence, not assertions: the command you ran and its actual output.
- When reporting a finding or a change, give the file name and line number.
- Do not commit, push, or create branches unless asked.

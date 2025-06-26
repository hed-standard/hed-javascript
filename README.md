[![Maintainability](https://api.codeclimate.com/v1/badges/f570007079eed004a81b/maintainability)](https://codeclimate.com/github/hed-standard/hed-javascript/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f570007079eed004a81b/test_coverage)](https://codeclimate.com/github/hed-standard/hed-javascript/test_coverage)
[![npm](https://img.shields.io/npm/v/hed-validator)](https://www.npmjs.com/package/hed-validator)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8172804.svg)](https://doi.org/10.5281/zenodo.8172804)

# hed-validator

This package contains a JavaScript validator for HED (Hierarchical Event Descriptor) annotations for
tabular files and their associated JSON metadata files such as those found in datasets formatted
in [BIDS (Brain Imaging Data Structure)](https://bids.neuroimaging.io/).

[HED](https://www.hedtags.org/) is a system for annotating events using comma-separated path strings.
Any type of event can be annotated using HED-type syntax.
The HED annotation strategy is very general and a standardized vocabulary in the form of a
[HED schema](https://github.com/hed-standard/hed-specification) enables
annotation of events in an understandable, machine-actionable format.

The current focus of the `hed-validator` package is to support full validation of HED in
[BIDS datasets](https://bids-specification.readthedocs.io/en/stable/) under the BIDS validator 2.0.

## Online validation

A browser-based validator that uses this package is available at
[www.hedtags.org/hed-javascript](https://www.hedtags.org/hed-javascript).
This online validator allows users to validate HED annotations in a web
browser without needing to install any software or upload files to a server.

A number of tools for HED, including validation are also available in a Python-based
[online validator](https://hedtools.org/hed).

All source code for these tools as well as
the HED specification and other resources are available on the GitHub [hed-standard](https://github.com/hed-standard)
organization. The HED project homepage is [www.hedtags.org](https://www.hedtags.org).

## Usage in node environment

The `hed-validator` package can be used in a Node.js environment to validate HED annotations.

```javascript
// In a Node.js environment:
const { BidsDataset, BidsDirectoryAccessor } = require('hed-validator')
const path = require('path')

async function main() {
  const dataRoot = path.join(__dirname, 'path/to/bids/dataset')
  const [dataset, issues] = await BidsDataset.create(dataRoot, BidsDirectoryAccessor)
  if (dataset) {
    const validationIssues = await dataset.validate()
    // process issues
  } else {
    // process creation issues
  }
}

main()
```

## Usage from JavaScript

The JavaScript version of the HED validator, implemented in this package, is meant primarily to be
called during validation of BIDS datasets and is called by the
[bids-validator](https://github.com/bids-standard/bids-validator).
This package has been deployed on npm as [hed-validator](https://www.npmjs.com/package/hed-validator).

To use the `hed-validator`, you must install the npm `hed-validator` package and add:
`import hedValidator from 'hed-validator'` to your JavaScript program.

A sample of current `hed-validator` usage can be found in the BIDS validator in
[`hed.ts`](https://github.com/bids-standard/bids-validator/blob/43be01517aaf338aa8bf87676be192dd57087c50/src/validators/hed.ts).

## Repository notes:

The `main` branch is now the default branch. All changes to the repository should
be done as PRs (pull requests) to the `main` branch.

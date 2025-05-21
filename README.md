[![Maintainability](https://api.codeclimate.com/v1/badges/f570007079eed004a81b/maintainability)](https://codeclimate.com/github/hed-standard/hed-javascript/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f570007079eed004a81b/test_coverage)](https://codeclimate.com/github/hed-standard/hed-javascript/test_coverage)
[![npm](https://img.shields.io/npm/v/hed-validator)](https://www.npmjs.com/package/hed-validator)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8172804.svg)](https://doi.org/10.5281/zenodo.8172804)

# hed-validator

This package contains a JavaScript validator for HED (Hierarchical Event Descriptor) strings.

[HED](https://www.hedtags.org/) is a system for annotating events using comma-separated path strings.
Any type of event can be annotated using HED-type syntax.
The HED annotation strategy is very general and a standardized vocabulary in the form of a
[HED schema](https://github.com/hed-standard/hed-specification) enables
annotation of events in an understandable, machine-actionable format.

The current focus of the `hed-validator` package is to support full validation of HED in
[BIDS datasets](https://bids-specification.readthedocs.io/en/stable/) under the BIDS validator 2.0.

HED validation is currently also supported in an [online version of the HED validator](https://hedtools.org/hed),
which is implemented in Python and developed in a [public GitHub repository](https://github.com/hed-standard/hed-python/).
Validation and other HED operations are also available through web-services and a docker module.

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

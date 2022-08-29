# hed-validator

This package contains a JavaScript validator for HED (hierarchical event descriptor) strings.

**This is the first release of the HED validator that supports HED library schemas.**

[HED](https://www.hedtags.org/) is a system for annotating events using comma-separated path strings.
Any type of event can be annotated using HED-type syntax.
The HED annotation strategy is very general and a standardized vocabulary in the form of a
[HED schema](https://github.com/hed-standard/hed-specification) enables
annotation of events in an understandable, machine-actionable format.

Additional [library schemas](https://github.com/hed-standard/hed-schema-library)
with specialized vocabularies needed for particular subfields are under development.

HED validation occurs at several levels.
Syntactic validation checks that HED strings comply with the required syntax,
but not whether tags comply with the additional requirements of a HED schema.

Semantic validation verifies validity at many levels:

1. **Tag-level validation** checks that tags are in the schema
   and have correct units and value type.
2. **String-level validation** performs additional checks for correctness.
   In this implementation, tag-level and string-level validation occur at the same time.
3. **Event-level validation** checks that the entire assembled HED annotation for an event is valid.
   This includes checks for required tags, duplicate tags, top-level tags, top-level tag groups,
   and unique tags. This usually implies the existence of an events file and an accompanying JSON sidecar
   so that annotations for different columns of an events file can be assembled into a single string.
4. **Dataset-level validation** parses out the definitions
   and checks that the needed definitions are present and not duplications.
   Dataset-level validation also checks for `Onset`-`Offset` tag consistency.

The current version of `hed-validator` performs both syntactic and semantic validation.
Because full validation of all the features of HED-3G (versions >= 8.0.0) requires full knowledge
of an events file and its merged sidecars, the `hed-validator` currently only exposes its interface
at the dataset level.
The current focus of the `hed-validator` package is to support full validation of HED in
[BIDS datasets](https://bids-specification.readthedocs.io/en/stable/)

HED validation is currently also supported in an [online version of the HED validator](https://hedtools.ucsd.edu/hed),
which is implemented in Python and developed in a [public GitHub repository](https://github.com/hed-standard/hed-python/).
Validation and other HED operations are also available through web-services and a docker module.

## Usage from JavaScript

The JavaScript version of the HED validator, implemented in this package, is meant primarily to be
called during validation of BIDS datasets and is called by the
[bids-validator](https://github.com/bids-standard/bids-validator).
This package has been deployed on npm as [hed-validator](https://www.npmjs.com/package/hed-validator).

To use the `hed-validator`, you must install the npm `hed-validator` package and add:
`const hedValidator = require('hed-validator')` to your JavaScript program.

Currently, only validation at the BIDS dataset level is supported as an external interface,
because full HED-3G validation requires the entire events file and merged sidecars be available.

A sample call can be found in the BIDS validator in
[hed.js](https://github.com/bids-standard/bids-validator/blob/94ee5225fdc965afc45f0841ec8013f148048084/bids-validator/validators/events/hed.js#L17)

```javascript
...
const dataset = new hedValidator.validator.BidsDataset(eventData, sidecarData, datasetDescriptionData, dir)
const [schemaDefinition, schemaDefinitionIssues] = parseHedVersion(
 jsonContents,
 dir,
)
try {
 return hedValidator.validator
   .validateBidsDataset(dataset, schemaDefinition)
   .then(hedValidationIssues => {
     return schemaDefinitionIssues.concat(
       convertHedIssuesToBidsIssues(hedValidationIssues),
     )
   })
} catch (error) {
 const issues = schemaDefinitionIssues.concat(
   internalHedValidatorIssue(error),
 )
 return Promise.resolve(issues)
}
```

The `eventData` `sidecarData` are objects created from lists of BIDS `events.tsv` files and,
BIDS JSON sidecars, respectively. The `datasetDescriptionData` is the JSON representation
of the dataset's `dataset_description.json` file, and `dir` is the path to the dataset's root directory.
The `schemaDefinition` object follows a similar format as the BIDS `HEDVersion` object,
but with local `path` values pre-parsed to use the fully qualified path name.

The primary objects needed for HED validation can be found in
[validator/bids/types.js](https://github.com/hed-standard/hed-javascript/blob/master/validator/bids/types.js).

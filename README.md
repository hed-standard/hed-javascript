# hed-validator

This package contains a JavaScript validator for HED (hierarchical event descriptor) strings.

[HED](http://www.hedtags.org/) is a system for annotating events using comma-separated path strings.
Any type of event can be annotated using HED-type syntax.
The HED annotation strategy is very general and a standardized vocabulary for a particular domain
can be represented using a HED schema.
HED provides a [standardized schema](https://github.com/hed-standard/hed-specification)
for annotating events in neuroimaging experiments.
Additional [library schemas](https://github.com/hed-standard/hed-schema-library) are under development.
Validation of HED strings against a particular HED schema is called semantic validation.


HED validation occurs at several levels.
Syntactic validation checks that HED strings comply with the required syntax,
but not whether tags comply with the additional requirements of a HED schema.

Semantic validation verifies validity at many levels:
1. Tag-level validation checks that tags are in the schema and have correct units and value type.
1. String-level validation performs additional checks for correctness.
   Depending on implementation tag-level and string-level validation may occur at the same time.
1. Event-level validation checks that the entire assembled HED annotation for an event is valid.
   This includes checks for required tags, duplicate tags, top-level tags and groups, and unique tags.
   This usually implies the existence of an events file and an accompanying JSON sidecar.
1. Dataset-level validation parsing the strings and parses out the definitions,
   and checks that the needed definitions are present and not duplications.
   Dataset-level validation also checks for `Onset`-`Offset` tag consistency.

The current version of `hed-validator` performs both syntactic and semantic validation.
Because full validation of all the features of HED-3G (versions >= 8.0.0) requires full knowledge
of an events file and its merged sidecars, the `hed-validator` currently only exposes its interface
at the dataset level.
The current focus of the `hed-validator` package is to support full validation of HED in
[BIDS datasets](https://bids-specification.readthedocs.io/en/stable/)

HED validation is currently also supported for an [online version of the HED validator](http://hedtools.ucsd.edu/hed).
This online validator is implemented in Python.
Validation and other HED operations are also available through web-services.

## Usage from JavaScript

TTo use the `hed-validator` you must install the npm `hed-validator` package and add:
`const hedValidator = require('hed-validator')`.
Currently, only validation at the BIDS dataset level is supported as an external interface,
because full HED-3G validation requires the entire events file and merged sidecars be available.


The JavaScript version of the HED validator, implemented in this package is meant primarily to be
called during validation of BIDS datasets and is called by the 
[bids-validator](https://github.com/bids-standard/bids-validator).
This package has been deployed on npm as [hed-validator](https://www.npmjs.com/package/hed-validator).

The HED JavaScript validator is very much tied to the BIDS dataset format.

Because full validation of all the features of HED-3G (versions >= 8.0.0) requires full knowledge
of an events file and its merged sidecars, the `hed-validator` currently only exposes its interface
at the dataset level.

A sample call can be found in the BIDS validator in
[hed.js](https://github.com/bids-standard/bids-validator/blob/94ee5225fdc965afc45f0841ec8013f148048084/bids-validator/validators/events/hed.js#L17)

```javascript
...
const dataset = new hedValidator.validator.BidsDataset(eventData, sidecarData)
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
}
```
The BIDS dataset creates a HED schema from its `dataset_description.json` and is self-contained.
The primary objects created for BIDS validation can be found in 
[types.js](https://github.com/hed-standard/hed-javascript/blob/master/validator/bids/types.js).

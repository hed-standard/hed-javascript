# hed-validator

This package contains a JavaScript validator for HED (hierarchical event descriptor) strings.

[HED](http://www.hedtags.org/) is a system for annotating events using comma-separated path strings. Any type of event can be annotated using HED-type syntax, and the current version of `hed-validator` performs synatic validation only. 

The HED annotation strategy is very general and a standardized vocabulary for a particular domain can be represented using a HED schema. HED provides one [standardized schema](https://github.com/BigEEGConsortium/HED-schema/wiki/HED-Schema) for annotating events in neuroimaging experiments. Validation of HED strings against a particular HED schema is called semantic validation. Semantic validation is currently supported for the [web version of the HED validator](http://visual.cs.utsa.edu/hed). Development of a semantic validator in JavaScript is in progress.

## Usage

To use the validator, follow these instructions:

1. Install the npm package `hed-validator`.
1. Add `const hedValidator = require('hed-validator')`
1. Create an array in which to store any validation issues (we'll call it `issues`).
1. Call the validator as follows (assuming `hedString` is the string to validate):

```
    hedValidator.HED.validateHedString(
        hedString,
        issues
    )
```

To check for warnings, pass `true` as the optional third argument.

## Examples

All of the examples assume that the `hed-validator` has been loaded:

```
    // For all examples
    const hedValidator = require('hed-validator')
```

### Example 1: Calling `hed-validator` on a valid HED string

```
    // Initializing parameters and making the call
    const validHedString = 'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues1 = []
    const isValid1 = hedValidator.HED.validateHedString(validHedString, issues1)
 ```
 
 After the call the `isValid1` variable is `true` and `issues1` is empty.
  
### Example 2: Calling `hed-validator` when the HED string has an error (mismatched parentheses)

```
    // Initializing parameters and making the call
    const invalidHedString = '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px'
    const issues2 = []
    const isValid2 = hedValidator.HED.validateHedString(invalidHedString, issues2)
 ```
 
 After the call `isValid2` is `false` and `issues2` has the value `['ERROR: Number of opening and closing parentheses are unequal. 2 opening parentheses. 1 closing parentheses']`.
 
 ### Example 3: Calling `hed-validator` when the HED string has a warning (bad capitalization), but no errors
 
 ```
    const warningHedString = 'Event/something'
    const errorIssues = []
    const warningIssues = []
    const isErrorFree = hedValidator.HED.validateHedString(warningHedString, errorIssues)
    const isWarningFree = hedValidator.HED.validateHedString(warningHedString, warningIssues, true)
 ```
 
 After the call `isErrorFree` is `true` and `isWarningFree` is `false`. The `errorIssues` variable is empty, while the `warningIssues` variable contains `['WARNING: First word not capitalized or camel case - Event/something']`.
```

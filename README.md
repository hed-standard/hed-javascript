# hed-validator

This package contains a validator for HED strings.

[HED](http://www.hedtags.org/) is a standard for neuroimaging event tagging.

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

```
    // For all examples
    const hedValidator = require('hed-validator')

    // Example 1: Valid HED string
    const validHedString = 'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues1 = []
    const isValid1 = hedValidator.HED.validateHedString(validHedString, issues1)
    // isValid1 === true
    // issues1 is empty

    // Example 2: Invalid HED string (error for mismatched parentheses)
    const invalidHedString = '/Action/Reach/To touch,((/Attribute/Object side/Left,/Participant/Effect/Body part/Arm),/Attribute/Location/Screen/Top/70 px'
    const issues2 = []
    const isValid2 = hedValidator.HED.validateHedString(invalidHedString, issues2)
    // isValid2 === false
    // issues2 == ['ERROR: Number of opening and closing parentheses are unequal. 2 opening parentheses. 1 closing parentheses']

    // Example 3: Invalid HED string (warning for bad capitalization)
    const warningHedString = 'Event/something'
    const errorIssues = []
    const warningIssues = []
    const isErrorFree = hedValidator.HED.validateHedString(warningHedString, errorIssues)
    const isWarningFree = hedValidator.HED.validateHedString(warningHedString, warningIssues, true)
    // isErrorFree === true
    // isWarningFree === false
    // errorIssues is empty
    // warningIssues == ['WARNING: First word not capitalized or camel case - Event/something']
```

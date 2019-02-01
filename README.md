# hed-validator

This package has a validator for [HED](http://www.hedtags.org/) strings.

To use the validator, follow these instructions:

1. Install the npm package `hed-validator`.
1. Add `var hedValidator = require('hed-validator')`
1. Create an array in which to store any validation issues (we'll call it `issues`).
1. Call the validator as follows (assuming `hedString` is the string to validate):


    hedValidator.validators.hed.validateHedString(
        hedString,
        issues
    )

To check for warnings, pass `true` as the optional third argument.

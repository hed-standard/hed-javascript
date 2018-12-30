const assert = require('assert')
const validate = require('../index')

describe('HED Tags', function() {
  it('should comprise valid comma-separated paths', function() {
    const hedStr =
      'Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.validateHedString(hedStr, issues)
    assert.strictEqual(result, true)
  })

  it('should not have invalid paths', function() {
    const hedStr =
      'Event/Category|Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple'
    const issues = []
    const result = validate.HED.validateHedString(hedStr, issues)
    assert.strictEqual(result, false)
  })
})

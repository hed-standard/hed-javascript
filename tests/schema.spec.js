const assert = require('assert')
const validate = require('../index')

// Temporary test
describe('HED schemas', function() {
  it('has the current version', async done => {
    validate.schema.loadSchema('Latest').then(hedSchema => {
      const hedSchemaVersion = hedSchema
        .root()
        .attr('version')
        .value()
      assert.strictEqual(hedSchemaVersion, '7.0.2')
      done()
    })
  })
})

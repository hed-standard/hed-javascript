const assert = require('assert')
const validate = require('../index')

// Temporary test
describe('HED schemas', function() {
  it('has the current version', async done => {
    const issues = []
    validate.schema.loadSchema('Latest', issues).then(hedSchema => {
      const hedSchemaVersion = hedSchema
        .root()
        .attr('version')
        .value()
      assert.strictEqual(hedSchemaVersion, '7.0.2')
      assert.deepStrictEqual(issues, [])
      done()
    })
  })
})

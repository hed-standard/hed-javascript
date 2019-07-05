const assert = require('assert')
const validate = require('../index')

// Temporary test
describe('HED schemas', function() {
  it('has the current version', async done => {
    const issues = []
    validate.buildSchema('Latest', issues).then(hedSchema => {
      const hedSchemaVersion = hedSchema.rootElement.attr('version').value()
      assert.strictEqual(hedSchemaVersion, '7.0.2')
      assert.deepStrictEqual(issues, [])
      done()
    })
  })
})

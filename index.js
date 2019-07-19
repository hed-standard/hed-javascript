// Import
var validate = require('./validators')

// Export functions for use in other applications
module.exports = {
  buildSchema: validate.schema.buildSchema,
  validateHedString: validate.HED.validateHedString,
}

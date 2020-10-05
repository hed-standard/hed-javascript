// Import
var validate = require('./validator')

// Export functions for use in other applications
module.exports = {
  buildSchema: validate.schema.buildSchema,
  validateHedString: validate.HED.validateHedString,
}

const { validateHedString, validateHedEvent, validateHedEventWithDefinitions } = require('./init')

const { HedValidator, Hed2Validator } = require('./validator')
const { Hed3Validator } = require('./hed3')

module.exports = {
  HedValidator,
  Hed2Validator,
  Hed3Validator,
  validateHedString,
  validateHedEvent,
  validateHedEventWithDefinitions,
}

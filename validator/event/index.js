const {
  validateHedString,
  validateHedEvent,
  validateHedEventWithDefinitions,
} = require('./init')

const { HedValidator, Hed2Validator } = require('./validator')
const { Hed3Validator } = require('./hed3')

module.exports = {
  HedValidator: HedValidator,
  Hed2Validator: Hed2Validator,
  Hed3Validator: Hed3Validator,
  validateHedString: validateHedString,
  validateHedEvent: validateHedEvent,
  validateHedEventWithDefinitions: validateHedEventWithDefinitions,
}

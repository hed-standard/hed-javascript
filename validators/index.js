// dependencies ------------------------------------------------------

const HED = require('./hed')
const schema = require('./schema')
const stringParser = require('./stringParser')

// public api --------------------------------------------------------

const validate = {
  HED: HED,
  schema: schema,
  stringParser: stringParser,
}

// exports -----------------------------------------------------------

module.exports = validate

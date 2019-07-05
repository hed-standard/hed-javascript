// dependencies ------------------------------------------------------

const HED = require('./hed')
const buildSchema = require('./schema')
const stringParser = require('./stringParser')

// public api --------------------------------------------------------

const validate = {
  HED: HED,
  buildSchema: buildSchema,
  stringParser: stringParser,
}

// exports -----------------------------------------------------------

module.exports = validate

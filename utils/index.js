// dependencies ------------------------------------------------------

const HED = require('./hed')
const array = require('./array')
const files = require('./files')
const string = require('./string')
const generateIssue = require('./issues')

// public api --------------------------------------------------------

const utils = {
  HED: HED,
  array: array,
  files: files,
  string: string,
  generateIssue: generateIssue,
}

// exports -----------------------------------------------------------

module.exports = utils

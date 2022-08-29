const { BidsDataset, BidsEventFile, BidsJsonFile, BidsSidecar, validateBidsDataset } = require('./bids')
const { validateHedDataset } = require('./dataset')
const { validateHedEvent, validateHedString } = require('./event')
const { buildSchema, buildSchemas } = require('./schema/init')

module.exports = {
  BidsDataset,
  BidsEventFile,
  BidsJsonFile,
  BidsSidecar,
  buildSchema,
  buildSchemas,
  validateBidsDataset,
  validateHedDataset,
  validateHedEvent,
  validateHedString,
}

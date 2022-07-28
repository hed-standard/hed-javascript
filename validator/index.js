const BIDS = require('./bids')
const dataset = require('./dataset')
const event = require('./event')
const schema = require('./schema/init')

module.exports = {
  BidsDataset: BIDS.BidsDataset,
  BidsEventFile: BIDS.BidsEventFile,
  BidsJsonFile: BIDS.BidsJsonFile,
  BidsSidecar: BIDS.BidsSidecar,
  buildSchema: schema.buildSchema,
  buildSchemas: schema.buildSchemas,
  validateBidsDataset: BIDS.validateBidsDataset,
  validateHedDataset: dataset.validateHedDataset,
  validateHedEvent: event.validateHedEvent,
  validateHedString: event.validateHedString,
}

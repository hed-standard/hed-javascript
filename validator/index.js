const BIDS = require('./bids')
const dataset = require('./dataset')
const event = require('./event')
const schema = require('./schema')

module.exports = {
  BidsEventFile: BIDS.BidsEventFile,
  BidsSidecar: BIDS.BidsSidecar,
  buildSchema: schema.buildSchema,
  validateBidsDataset: BIDS.validateBidsDataset,
  validateHedDataset: dataset.validateHedDataset,
  validateHedEvent: event.validateHedEvent,
  validateHedString: event.validateHedString,
}

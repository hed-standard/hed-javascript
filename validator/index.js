import { BidsDataset, BidsEventFile, BidsJsonFile, BidsSidecar, validateBidsDataset } from './bids'
import { validateHedDataset } from './dataset'
import { validateHedEvent, validateHedString } from './event'
import { buildSchema, buildSchemas } from './schema/init'

export {
  BidsDataset,
  BidsEventFile,
  BidsJsonFile,
  BidsSidecar,
  validateBidsDataset,
  validateHedDataset,
  validateHedEvent,
  validateHedString,
  buildSchema,
  buildSchemas,
}

export default {
  BidsDataset,
  BidsEventFile,
  BidsJsonFile,
  BidsSidecar,
  validateBidsDataset,
  validateHedDataset,
  validateHedEvent,
  validateHedString,
  buildSchema,
  buildSchemas,
}
export { Hed2Validator } from './hed2/event/hed2Validator'

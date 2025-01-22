import { buildBidsSchemas } from './schema'
import validateBidsDataset from './validate'
import { BidsJsonFile, BidsSidecar } from './types/json'
import { BidsTsvFile } from './types/tsv'
import { BidsHedIssue, BidsIssue } from './types/issues'
import BidsHedSidecarValidator from './validator/sidecarValidator'
import BidsHedTsvValidator from './validator/tsvValidator'

export {
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsIssue,
  BidsHedIssue,
  BidsHedSidecarValidator,
  BidsHedTsvValidator,
  buildBidsSchemas,
  validateBidsDataset,
}

export default {
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsIssue,
  BidsHedIssue,
  BidsHedSidecarValidator,
  BidsHedTsvValidator,
  buildBidsSchemas,
  validateBidsDataset,
}

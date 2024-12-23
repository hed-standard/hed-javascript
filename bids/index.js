import { buildBidsSchemas } from './schema'
import validateBidsDataset from './validate'
import { BidsJsonFile, BidsSidecar } from './types/json'
import { BidsTsvFile } from './types/tsv'
import BidsDataset from './types/dataset'
import { BidsHedIssue, BidsIssue } from './types/issues'
import BidsHedSidecarValidator from './validator/sidecarValidator'
import BidsHedTsvValidator from './validator/tsvValidator'

export {
  BidsDataset,
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
  BidsDataset,
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

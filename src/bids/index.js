import { buildBidsSchemas } from './schema'
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
}

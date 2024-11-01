import buildBidsSchemas from './schema'
import validateBidsDataset from './validate'
import { BidsJsonFile, BidsSidecar } from './types/json'
import { BidsEventFile, BidsTabularFile, BidsTsvFile } from './types/tsv'
import BidsDataset from './types/dataset'
import { BidsHedIssue, BidsIssue } from './types/issues'
import SidecarValidator from './validator/sidecarValidator'
import TsvValidator from './validator/tsvValidator'

export {
  BidsDataset,
  BidsTsvFile,
  BidsEventFile,
  BidsTabularFile,
  BidsJsonFile,
  BidsSidecar,
  BidsIssue,
  BidsHedIssue,
  SidecarValidator,
  TsvValidator,
  buildBidsSchemas,
  validateBidsDataset,
}

export default {
  BidsDataset,
  BidsTsvFile,
  BidsEventFile,
  BidsTabularFile,
  BidsJsonFile,
  BidsSidecar,
  BidsIssue,
  BidsHedIssue,
  BidsHedSidecarValidator: SidecarValidator,
  BidsHedTsvValidator: TsvValidator,
  buildBidsSchemas,
  validateBidsDataset,
}

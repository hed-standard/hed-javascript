/**
 * This module is the entry point for the HED JavaScript library.
 *
 * It provides access to the main BIDS data structures and the schema
 * builder used for HED validation and processing.
 *
 * @module Bids
 */

import { buildBidsSchemas } from './schema'
import { BidsJsonFile, BidsSidecar } from './types/json'
import { BidsTsvFile } from './types/tsv'
import { BidsDataset } from './types/dataset'
import { BidsHedIssue } from './types/issues'
import { BidsFileAccessor, BidsDirectoryAccessor } from './datasetParser'

export {
  BidsDataset,
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsHedIssue,
  buildBidsSchemas,
  BidsFileAccessor,
  BidsDirectoryAccessor,
}

export default {
  BidsDataset,
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsHedIssue,
  buildBidsSchemas,
  BidsFileAccessor,
  BidsDirectoryAccessor,
}

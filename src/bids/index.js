/**
 * This module is the primary entry point for BIDS-related functionality.
 *
 * It exports the primary data structures and functions for working with BIDS datasets,
 * including {@link BidsDataset}, file-specific classes like {@link BidsTsvFile} and {@link BidsSidecar},
 * and the {@link buildBidsSchemas} function for schema management.
 *
 * @module bids
 */

import { buildBidsSchemas } from './schema'
import { BidsJsonFile, BidsSidecar } from './types/json'
import { BidsTsvFile } from './types/tsv'
import { BidsDataset } from './types/dataset'
import { BidsHedIssue } from './types/issues'
import { BidsFileAccessor } from './datasetParser'
import { BidsDirectoryAccessor } from './directoryAccessor'
import { BidsWebAccessor } from './webAccessor'

export {
  BidsDataset,
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsHedIssue,
  buildBidsSchemas,
  BidsFileAccessor,
  BidsDirectoryAccessor,
  BidsWebAccessor,
}

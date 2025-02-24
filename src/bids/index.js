import { buildBidsSchemas } from './schema'
import { BidsJsonFile, BidsSidecar } from './types/json'
import { BidsTsvFile } from './types/tsv'
import { BidsHedIssue } from './types/issues'

export { BidsTsvFile, BidsJsonFile, BidsSidecar, BidsHedIssue, buildBidsSchemas }

export default {
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsHedIssue,
  buildBidsSchemas,
}

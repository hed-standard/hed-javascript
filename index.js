/**
 * @module
 * @description This module is the entry point for the HED JavaScript library.
 */
export {
  BidsDataset,
  BidsTsvFile,
  BidsJsonFile,
  BidsSidecar,
  BidsHedIssue,
  buildBidsSchemas,
  BidsFileAccessor,
  BidsDirectoryAccessor,
} from './src/bids'

export { IssueError } from './src/issues/issues'

// Export parser functions for HED string validation

export { Definition, DefinitionManager } from './src/parser/definitionManager'

export { parseStandaloneString, parseHedString, parseHedStrings } from './src/parser/parser'

// Export schema functions
export { buildSchemas } from './src/schema/init'

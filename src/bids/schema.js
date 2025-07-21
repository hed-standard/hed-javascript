/**
 * This module contains functions for building HED schemas for BIDS datasets.
 * @module schema
 */

import { buildSchemas } from '../schema/init'
import { IssueError } from '../issues/issues'
import { SchemasSpec } from '../schema/specs'
import { BidsJsonFile } from './types/json'

/**
 * Build a HED schema collection based on the defined BIDS schemas.
 *
 * @param {BidsJsonFile} datasetDescription The description of the BIDS dataset being validated.
 * @returns {Promise} A Promise with the schema collection, or null if the specification is missing.
 * @throws {IssueError} If the schema specification is invalid.
 */
export async function buildBidsSchemas(datasetDescription) {
  if (datasetDescription?.jsonData?.HEDVersion) {
    const schemasSpec = SchemasSpec.parseVersionSpecs(datasetDescription.jsonData.HEDVersion)
    return buildSchemas(schemasSpec)
  } else {
    return null
  }
}

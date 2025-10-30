/**
 * Validator base class for HED data in BIDS TSV files.
 * @module bids/validator/validator
 */

import { BidsHedIssue } from '../types/issues'
import { HedSchemas } from '../../schema/containers'

/**
 * Validator base class for HED data in BIDS TSV files.
 */
export abstract class BidsValidator {
  /**
   * The HED schema collection being validated against.
   */
  hedSchemas: HedSchemas

  /**
   * The errors found during validation.
   */
  errors: BidsHedIssue[]

  /**
   * The warnings found during validation.
   */
  warnings: BidsHedIssue[]

  /**
   * Constructor.
   *
   * @param hedSchemas The HED schemas used for validation.
   */
  protected constructor(hedSchemas: HedSchemas) {
    this.hedSchemas = hedSchemas
    this.errors = []
    this.warnings = []
  }

  /**
   * Validate a BIDS file. Overridden by particular types of BIDS files.
   */
  public abstract validate(): void
}

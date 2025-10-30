/**
 * This module contains the {@link BidsFile} class, which is the base class for BIDS files.
 *
 * @module bids/types/file
 */

import { BidsHedIssue } from './issues'
import { BidsValidator } from '../validator/validator'
import { generateIssue } from '../../issues/issues'
import { HedSchemas } from '../../schema/containers'

type BidsValidatorConstructor<ValidatorClass extends BidsValidator> = {
  new (file: BidsFile<ValidatorClass>, schemas: HedSchemas): ValidatorClass
}

/**
 * A BIDS file.
 */
export class BidsFile<ValidatorClass extends BidsValidator> {
  /**
   * The name of this file.
   */
  public readonly name: string

  /**
   * The Object representing this file data.
   * This is used to generate {@link BidsHedIssue} objects.
   */
  public readonly file: any

  /**
   * The validator class used to validate this file.
   */
  readonly #validatorClass: BidsValidatorConstructor<ValidatorClass>

  /**
   * Constructor.
   *
   * @param name The name of this file.
   * @param file The Object representing this file data.
   * @param validatorClass The validator class used to validate this file.
   */
  protected constructor(name: string, file: any, validatorClass: BidsValidatorConstructor<ValidatorClass>) {
    this.name = name
    this.file = file
    this.#validatorClass = validatorClass
  }

  /**
   * Validate this validator's file.
   *
   * @param schemas The HED schemas used to validate this file.
   * @returns Any issues found during validation of this TSV file.
   */
  public validate(schemas: HedSchemas): BidsHedIssue[] {
    if (!this.hasHedData) {
      return []
    }
    if (!schemas) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('missingSchemaSpecification', {
            message: 'No valid HED schema specification was supplied.',
          }),
          this.file,
        ),
      ]
    }

    try {
      const validator = new this.validatorClass(this, schemas)
      validator.validate()
      return [...validator.errors, ...validator.warnings]
    } catch (error) {
      // The low-level parsing throws exceptions with the issue encapsulated.
      return BidsHedIssue.fromHedIssues(error, this.file)
    }
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns Whether this file has any HED data.
   */
  public get hasHedData(): boolean {
    return false
  }

  /**
   * The validator class used to validate this file.
   *
   * @returns The validator class used to validate this file.
   */
  public get validatorClass(): BidsValidatorConstructor<ValidatorClass> {
    return this.#validatorClass
  }
}

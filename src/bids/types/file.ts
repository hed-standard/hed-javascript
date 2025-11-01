/**
 * This module contains the {@link BidsFile} class, which is the base class for BIDS files.
 *
 * @module bids/types/file
 */

import { BidsHedIssue } from './issues'
import { BidsValidator } from '../validator/validator'
import { generateIssue } from '../../issues/issues'
import { HedSchemas } from '../../schema/containers'

type BidsValidatorConstructor = {
  new (file: BidsFile, schemas: HedSchemas): BidsValidator
}

/**
 * A BIDS file.
 */
export abstract class BidsFile {
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
  readonly #validatorClass: BidsValidatorConstructor

  /**
   * Constructor.
   *
   * @param name The name of this file.
   * @param file The Object representing this file data.
   * @param validatorClass The validator class used to validate this file.
   */
  protected constructor(name: string, file: any, validatorClass: BidsValidatorConstructor) {
    this.name = name
    this.file = file
    this.#validatorClass = validatorClass
  }

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns The file name.
   */
  public toString(): string {
    return this.name
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
  public get validatorClass(): BidsValidatorConstructor {
    return this.#validatorClass
  }
}

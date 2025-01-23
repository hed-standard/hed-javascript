declare abstract class ParsedHedSubstring {
  /**
   * The original pre-parsed version of the HED tag.
   */
  originalTag: string
  /**
   * The bounds of the HED tag in the original HED string.
   */
  originalBounds: number[]

  /**
   * Constructor.
   * @param originalTag The original HED tag.
   * @param originalBounds The bounds of the HED tag in the original HED string.
   */
  protected constructor(originalTag: string, originalBounds: number[])

  /**
   * Nicely format this substring. This is left blank for the subclasses to override.
   *
   * This is left blank for the subclasses to override.
   *
   * @param long Whether the tags should be in long form.
   */
  public abstract format(long: boolean): string

  /**
   * Get the normalized version of the object.
   */
  public abstract get normalized(): string

  /**
   * Override of {@link Object.prototype.toString}.
   *
   * @returns The original form of this HED substring.
   */
  public toString(): string
}

export = ParsedHedSubstring

import { replaceTagNameWithPound } from '../../../utils/hedStrings'
import { ParsedHedTag } from '../../parser/parsedHedTag'

export class ParsedHed2Tag extends ParsedHedTag {
  /**
   * Determine if this HED tag is in the schema.
   */
  get existsInSchema() {
    return this._memoize('existsInSchema', () => {
      return this.schema.attributes.tags.includes(this.formattedTag)
    })
  }

  /**
   * Determine value-taking form of this tag.
   */
  get takesValueFormattedTag() {
    return this._memoize('takesValueFormattedTag', () => {
      return replaceTagNameWithPound(this.formattedTag)
    })
  }

  /**
   * Checks if this HED tag has the 'takesValue' attribute.
   */
  get takesValue() {
    return this._memoize('takesValue', () => {
      return this.schema.tagHasAttribute(this.takesValueFormattedTag, 'takesValue')
    })
  }

  /**
   * Checks if this HED tag has the 'unitClass' attribute.
   */
  get hasUnitClass() {
    return this._memoize('hasUnitClass', () => {
      if (!this.schema.attributes.hasUnitClasses) {
        return false
      }
      return this.takesValueFormattedTag in this.schema.attributes.tagUnitClasses
    })
  }

  /**
   * Get the unit classes for this HED tag.
   */
  get unitClasses() {
    return this._memoize('unitClasses', () => {
      if (this.hasUnitClass) {
        return this.schema.attributes.tagUnitClasses[this.takesValueFormattedTag]
      } else {
        return []
      }
    })
  }

  /**
   * Get the default unit for this HED tag.
   */
  get defaultUnit() {
    return this._memoize('defaultUnit', () => {
      const defaultUnitForTagAttribute = 'default'
      const defaultUnitsForUnitClassAttribute = 'defaultUnits'
      if (!this.hasUnitClass) {
        return ''
      }
      const takesValueTag = this.takesValueFormattedTag
      let hasDefaultAttribute = this.schema.tagHasAttribute(takesValueTag, defaultUnitForTagAttribute)
      if (hasDefaultAttribute) {
        return this.schema.attributes.tagAttributes[defaultUnitForTagAttribute][takesValueTag]
      }
      hasDefaultAttribute = this.schema.tagHasAttribute(takesValueTag, defaultUnitsForUnitClassAttribute)
      if (hasDefaultAttribute) {
        return this.schema.attributes.tagAttributes[defaultUnitsForUnitClassAttribute][takesValueTag]
      }
      const unitClasses = this.schema.attributes.tagUnitClasses[takesValueTag]
      const firstUnitClass = unitClasses[0]
      return this.schema.attributes.unitClassAttributes[firstUnitClass][defaultUnitsForUnitClassAttribute][0]
    })
  }

  /**
   * Get the legal units for a particular HED tag.
   * @return {string[]}
   */
  get validUnits() {
    return this._memoize('validUnits', () => {
      const tagUnitClasses = this.unitClasses
      const units = []
      for (const unitClass of tagUnitClasses) {
        const unitClassUnits = this.schema.attributes.unitClasses[unitClass]
        units.push(...unitClassUnits)
      }
      return units
    })
  }
}

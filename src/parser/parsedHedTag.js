/** This module holds the class representing a parsed HED tag.
 * @module parser/parsedHedTag
 */
import { IssueError } from '../issues/issues'
import ParsedHedSubstring from './parsedHedSubstring'
import { SchemaValueTag } from '../schema/entries'
import TagConverter from './tagConverter'
import { ReservedChecker } from './reservedChecker'
import { characterSets, codePoint } from '../schema/characterSets'

// The characters of a value whose placeholder declares no valueClass (character_sets.json; hed-python does the same).
const UNCLASSED_VALUE_SETS = ['value-text']

/**
 * A parsed HED tag.
 */
export default class ParsedHedTag extends ParsedHedSubstring {
  /**
   * The formatted canonical version of the HED tag.
   * @type {string}
   */
  formattedTag

  /**
   * The canonical form of the HED tag.
   * @type {string}
   */
  canonicalTag

  /**
   * The HED schema this tag belongs to.
   * @type {Schema}
   */

  schema
  /**
   * The schema's representation of this tag.
   *
   * @type {SchemaTag}
   * @private
   */

  _schemaTag

  /**
   * The remaining part of the tag after the portion actually in the schema.
   * @type {string}
   * @private
   */
  _remainder

  /**
   * The value of the tag, if any.
   * @type {string}
   * @private
   */
  _value

  /**
   * If definition, this is the second value, otherwise empty string.
   * @type {string}
   * @private
   */
  _splitValue

  /**
   * The units if any.
   * @type {string}
   * @private
   */
  _units

  /**
   * The schema unit matching the units, if any.
   * @type {SchemaUnit|null}
   * @private
   */
  _unit

  /**
   * Constructor.
   *
   * @param {TagSpec} tagSpec The token for this tag.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} hedString The original HED string.
   * @throws {IssueError} If tag conversion or parsing fails.
   */
  constructor(tagSpec, hedSchemas, hedString) {
    super(tagSpec.tag, tagSpec.bounds) // Sets originalTag and originalBounds
    this._convertTag(hedSchemas, hedString, tagSpec)
    this._normalized = this.format(false) // Sets various forms of the tag.
  }

  /**
   * Convert this tag to its various forms
   *
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} hedString The original HED string.
   * @param {TagSpec} tagSpec The token for this tag.
   * @throws {IssueError} If tag conversion or parsing fails.
   */
  _convertTag(hedSchemas, hedString, tagSpec) {
    const schemaName = tagSpec.library
    this.schema = hedSchemas.getSchema(schemaName)
    if (this.schema === undefined) {
      if (schemaName !== '') {
        IssueError.generateAndThrow('unmatchedLibrarySchema', {
          tag: this.originalTag,
          library: schemaName,
        })
      } else {
        IssueError.generateAndThrow('unmatchedBaseSchema', {
          tag: this.originalTag,
        })
      }
    }

    const [schemaTag, remainder] = new TagConverter(tagSpec, hedSchemas).convert()
    this._schemaTag = schemaTag
    this._remainder = remainder
    this.canonicalTag = this._schemaTag.longExtend(remainder)
    this.formattedTag = this.canonicalTag.toLowerCase()
    this._handleRemainder(schemaTag, remainder)
  }

  /**
   * Handle the remainder portion for value tag (converter handles others).
   *
   * @param {SchemaTag} schemaTag - The part of the tag that is in the schema.
   * @param {string} remainder - the leftover part.
   * @throws {IssueError} If parsing the remainder section fails.
   * @private
   */
  _handleRemainder(schemaTag, remainder) {
    if (!(schemaTag instanceof SchemaValueTag)) {
      return
    }
    // Check that there is a value if required
    const reserved = ReservedChecker.getInstance()
    if ((schemaTag.hasAttribute('requireChild') || reserved.requireValueTags.has(schemaTag.name)) && remainder === '') {
      IssueError.generateAndThrow('valueRequired', { tag: this.originalTag })
    }
    // Check if this could have a two-level value
    const [value, rest] = this._getSplitValue(remainder, reserved)
    this._splitValue = rest
    // After a Definition name only # may follow (specification 3.2.8.1, DEFINITION_INVALID l).
    if (ReservedChecker.valueForms.get(this.schemaTag.name)?.secondPart === 'placeholder' && rest && rest !== '#') {
      IssueError.generateAndThrow('invalidDefinition', {
        definition: this.originalTag,
        msg: `Only "#" may follow the definition name, not "${rest}".`,
      })
    }

    // Resolve the units and check
    const [actualUnit, actualUnitString, actualValueString] = this._separateUnits(schemaTag, value)
    this._unit = actualUnit
    this._units = actualUnitString
    this._value = actualValueString

    if (actualUnit === null && actualUnitString !== null) {
      IssueError.generateAndThrow('unitClassInvalidUnit', { tag: this.originalTag })
    }
    const problem = this._findValueProblem(actualValueString)
    if (problem?.characters) {
      // The index is within the tag as written: the value starts where it does in the remainder.
      const valueStart = this.originalTag.length - remainder.length + remainder.indexOf(actualValueString)
      const [index, character] = problem.characters[0]
      IssueError.generateAndThrow('invalidValueCharacter', {
        character: character,
        codePoint: codePoint(character),
        index: valueStart + index,
        tag: this.originalTag,
        allows: `${problem.subject} allows ${characterSets.describe(problem.names)}`,
      })
    } else if (problem) {
      IssueError.generateAndThrow('invalidValue', { tag: this.originalTag, msg: problem.msg })
    }
  }

  /**
   * Separate the remainder of the tag into three parts.
   *
   * @param {SchemaTag} schemaTag - The part of the tag that is in the schema.
   * @param {string} remainder - The leftover part.
   * @returns {Array} - [SchemaUnit, string, string] representing the actual Unit, the unit string and the value string.
   * @throws {IssueError} - If parsing the remainder section fails.
   */
  _separateUnits(schemaTag, remainder) {
    const unitClasses = this._expandUnitClasses(schemaTag.unitClasses)
    let actualUnit = null
    let actualUnitString = null
    let actualValueString = remainder // If no unit class, the remainder is the value
    // A unit listed outright in some class wins over one another class only derives: with several classes
    // (unitClass=anyUnits) "dB" is the listed decibel, not "d" + "B" (byte).
    for (const listedOnly of [true, false]) {
      for (const unitClass of unitClasses) {
        ;[actualUnit, actualUnitString, actualValueString] = unitClass.extractUnit(remainder, listedOnly)
        if (actualUnit !== null) {
          return [actualUnit, actualUnitString, actualValueString]
        }
      }
    }
    return [actualUnit, actualUnitString, actualValueString]
  }

  /**
   * Expand the anyUnits pseudo class (HED 8.5.0) to every unit class of this tag's schema.
   *
   * @param {SchemaUnitClass[]} unitClasses The unit classes of the schema tag.
   * @returns {SchemaUnitClass[]} The unit classes to search, in schema order.
   * @private
   */
  _expandUnitClasses(unitClasses) {
    if (!unitClasses.some((unitClass) => unitClass.name === 'anyUnits')) {
      return unitClasses
    }
    const expanded = unitClasses.filter((unitClass) => unitClass.name !== 'anyUnits')
    for (const unitClass of this.schema.entries.unitClasses.values()) {
      if (unitClass.name !== 'anyUnits' && !expanded.includes(unitClass)) {
        expanded.push(unitClass)
      }
    }
    return expanded
  }

  /**
   * Convert this tag's value to the default unit of its unit class.
   *
   * A value written without a unit is taken to be in the default unit already; a numeric value of a tag
   * that has no unit class is returned unchanged. A placeholder with unitClass=anyUnits has no default unit,
   * so its value converts only when a unit is written.
   *
   * In a unit class none of whose units has a conversionFactor (timeUnits in HED 8.0.0), an unmodified form of
   * the default unit or of an SI unit of the class (s, second, seconds) converts with factor 1 (specification
   * 3.2.8.4); a modified form (ms) or another unit (minute) does not convert.
   *
   * @returns {number|null} The value in default units, or null if the tag takes no value, the value is not
   *     numeric, the unit is invalid, the unit has no conversionFactor (such as month or year), or the value
   *     is a bare number on an anyUnits placeholder.
   */
  valueAsDefaultUnit() {
    if (!this.takesValueTag || this._value === undefined || this._value === null) {
      return null
    }
    const value = Number(this._value)
    if (this._value === '' || !Number.isFinite(value)) {
      return null
    }
    if (this._units === null) {
      const acceptsAnyUnits = this.takesValueTag.unitClasses.some((unitClass) => unitClass?.name === 'anyUnits')
      return acceptsAnyUnits ? null : value
    }
    const factor = this._unit?.conversionFactor(this._units) ?? null
    if (factor !== null) {
      return value * factor
    }
    return this._isUnconvertedBaseUnit() ? value : null
  }

  /**
   * Determine whether this tag's unit is a base unit of a unit class that defines no conversion factors.
   *
   * @returns {boolean} True if no unit of the unit class holding this tag's unit has a conversionFactor and the
   *     unit is written unmodified as the default unit or, when the default unit is itself an SI unit, as an SI
   *     unit of that class (its other spelling: second beside s). A class whose default is not SI, such as
   *     intensityUnits with default dB beside candela and cd, accepts only the default unit.
   * @private
   */
  _isUnconvertedBaseUnit() {
    const unitClass = this._expandUnitClasses(this.takesValueTag.unitClasses).find(
      (candidate) => candidate.units.get(this._unit?.name) === this._unit,
    )
    if (unitClass === undefined || unitClass.hasConversionFactors) {
      return false
    }
    const defaultUnit = unitClass.defaultUnit
    const isBaseUnit = this._unit === defaultUnit || (defaultUnit?.isSIUnit === true && this._unit.isSIUnit)
    return isBaseUnit && this._unit.isUnmodifiedForm(this._units)
  }

  /**
   * Split the value of a tag whose value has two parts (the valueForms of the reserved-tag file).
   * @param {string} remainder - The remainder of the tag string after schema tag.
   * @param {ReservedChecker} reserved - The reserved-tag checker.
   * @returns {Array} - [string, string|null] the name and the part after it, or [remainder, null] for other tags.
   */
  _getSplitValue(remainder, reserved) {
    if (!reserved.twoPartValueTags.has(this.schemaTag.name)) {
      return [remainder, null]
    }
    const [first, ...rest] = remainder.split('/')
    return [first, rest.join('/')]
  }

  /**
   * Nicely format this tag.
   *
   * @param {boolean} long - Whether the tags should be in long form.
   * @returns {string} - The nicely formatted version of this tag.
   */
  format(long = true) {
    let tagName
    if (long) {
      tagName = this._schemaTag?.longExtend(this._remainder)
    } else {
      tagName = this._schemaTag?.extend(this._remainder)
    }
    if (tagName === undefined) {
      tagName = this.originalTag
    }
    if (this.schema?.prefix) {
      return this.schema.prefix + ':' + tagName
    } else {
      return tagName
    }
  }

  /**
   * Return the normalized version of this tag.
   * @returns {string} - The normalized version of this tag.
   */
  get normalized() {
    return this._normalized
  }

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns {string} The original form of this HED tag.
   */
  toString() {
    if (this.schema?.prefix) {
      return this.schema.prefix + ':' + this.originalTag
    } else {
      return this.originalTag
    }
  }

  /**
   * Determine whether this tag has a given attribute.
   *
   * @param {string} attribute An attribute name.
   * @returns {boolean} Whether this tag has the named attribute.
   */
  hasAttribute(attribute) {
    return this.schemaTag.hasAttribute(attribute)
  }

  /**
   * Determine if this HED tag is equivalent to another HED tag.
   *
   * Note: HED tags are deemed equivalent if they have the same schema and normalized tag string.
   *
   * @param {ParsedHedTag} other A HED tag to compare with this one.
   * @returns {boolean} Whether the other tag is equivalent to this HED tag.
   */
  equivalent(other) {
    return other instanceof ParsedHedTag && this.formattedTag === other.formattedTag && this.schema === other.schema
  }

  /**
   * Get the schema tag object for this tag.
   *
   * @returns {SchemaTag} The schema tag object for this tag.
   */
  get schemaTag() {
    if (this._schemaTag instanceof SchemaValueTag) {
      return this._schemaTag.parent
    } else {
      return this._schemaTag
    }
  }

  /**
   * Indicates whether the tag is deprecated
   * @returns {boolean}
   */
  get isDeprecated() {
    return this.schemaTag.hasAttribute('deprecatedFrom')
  }

  /**
   * Indicates whether the tag is deprecated
   * @returns {boolean}
   */
  get isExtended() {
    return !this.takesValueTag && this._remainder !== ''
  }

  /**
   * Get the schema tag object for this tag's value-taking form.
   *
   * @returns {SchemaValueTag} The schema tag object for this tag's value-taking form.
   */
  get takesValueTag() {
    if (this._schemaTag instanceof SchemaValueTag) {
      return this._schemaTag
    }
    return undefined
  }

  /**
   * Checks if this HED tag has the `takesValue` attribute.
   *
   * @returns {boolean} Whether this HED tag has the `takesValue` attribute.
   */
  takesValue() {
    return this.takesValueTag !== undefined
  }

  /**
   * Checks if this HED tag has the `unitClass` attribute.
   *
   * @returns {boolean} Whether this HED tag has the `unitClass` attribute.
   */
  isUnitClass() {
    return this.hasAttribute('unitClass')
  }

  /**
   * Get the unit classes for this HED tag.
   *
   * @returns {SchemaUnitClass[]} The unit classes for this HED tag.
   */
  get unitClasses() {
    if (this.hasUnitClass) {
      return this.takesValueTag.unitClasses
    }
    return []
  }

  /**
   * Check if value is a valid value for this tag.
   *
   * @param {string} value - The value to be checked.
   * @returns {string} An empty string if value is value, otherwise an indication of failure.
   */
  checkValue(value) {
    const problem = this._findValueProblem(value)
    if (problem === null) {
      return ''
    }
    if (problem.characters) {
      const [index, character] = problem.characters[0]
      return `Character "${character}" (${codePoint(character)}) at index ${index} of value "${value}" is not allowed: ${problem.subject} allows ${characterSets.describe(problem.names)}.`
    }
    return problem.msg
  }

  /**
   * Find why a value is not valid for this tag, as hed-python's _check_value_class does.
   *
   * A value passes when any of the tag's value classes accepts it. Each class checks its whole-value rule
   * (numericClass, dateTimeClass) before its characters: a broken rule is VALUE_INVALID, a character the class
   * does not allow is CHARACTER_INVALID. A value whose placeholder declares no value class may use value-text.
   *
   * @param {string} value The value to be checked.
   * @returns {{msg: string}|{characters: Array<[number, string]>, subject: string, names: string[]}|null} null if the
   *     value is valid; {msg} for a VALUE_INVALID failure; otherwise the characters (index within the value) of the
   *     first class that rejected only characters, with the class (subject) and its character set names.
   * @private
   */
  _findValueProblem(value) {
    if (!this.takesValue) {
      return { msg: `Tag "${this.schemaTag.name}" does not take a value but has value "${value}"` }
    }
    if (value === '#') {
      // Placeholders work
      return null
    }
    const valueClassNames = this._schemaTag.valueAttributeNames?.get('valueClass')
    if (!valueClassNames) {
      const characters = characterSets.problemCharacters(value, UNCLASSED_VALUE_SETS)
      if (characters.length === 0) {
        return null
      }
      return { characters: characters, subject: 'a value with no value class', names: UNCLASSED_VALUE_SETS }
    }
    const entryManager = this.schema.entries.valueClasses
    let characterProblem = null
    for (const valueClassName of valueClassNames) {
      const valueClass = entryManager.getEntry(valueClassName)
      const problem = valueClass.valueProblem(value)
      if (problem === null) {
        return null
      }
      if (problem.characters && characterProblem === null) {
        characterProblem = { characters: problem.characters, subject: valueClassName, names: valueClass.allowedNames }
      }
    }
    if (characterProblem !== null) {
      return characterProblem
    }
    return {
      msg: `Tag "${this.schemaTag.name}" has value classes [${valueClassNames.join(', ')}] but its value "${value}" is not in any of them.`,
    }
  }
}

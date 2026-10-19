/** The HED character sets of specification section 2.2, loaded from the specification's own file.
 *
 * src/data/json/characterSets.json is a verbatim copy of the character_sets.json that the HED specification
 * publishes (docs/source/_static/character_sets.json); the character_sets.yml workflow fails when it drifts. Both
 * validators load the same file, so the named sets, the per-class defaults, the whole-value rules and the
 * characters forbidden in a HED string cannot drift between them or from the specification text.
 *
 * @module schema/characterSets
 */
import semver from 'semver'

import characterSetsData from '../data/json/characterSets.json'

/**
 * The U+XXXX form of a single character, for messages.
 *
 * @param {string} character A single character (one code point).
 * @returns {string} The code point, for example "U+003F".
 */
export function codePoint(character) {
  return 'U+' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Escape a character for use in a Unicode-mode regular expression, outside a character class.
 *
 * Unicode mode allows an escape only before a syntax character or "/", so "-" is left as it is.
 *
 * @param {string} character A single character.
 * @returns {string} The escaped character.
 */
const escapeRegExp = (character) => character.replace(/[\\^$.*+?()[\]{}|/]/g, '\\$&')

/**
 * A read-only view of character_sets.json: named sets, aliases, defaults, whole-value rules and exclusions.
 */
export class CharacterSets {
  /**
   * The named character sets: name -> {regex, description}.
   * @type {Object<string, {regex: string, description: string}>}
   */
  sets

  /**
   * Constructor.
   *
   * @param {Object} data The parsed content of a character_sets.json file.
   */
  constructor(data) {
    this.sets = data.sets
    this.aliases = data.aliases ?? {}
    this.valueClassDefaults = data.value_class_defaults ?? {}
    this.valueClassWords = data.value_class_words ?? {}
    this.forbidden = data.hed_string?.forbidden ?? {}
    this.declarationWinsFrom = data.declaration_wins_from?.standard_version ?? '8.5.0'
    this._regexCache = new Map()
  }

  /**
   * Resolve an alias ("slash" -> "forward-slash"); any other name is returned unchanged.
   *
   * @param {string} name A character set name.
   * @returns {string} The canonical name.
   */
  canonicalName(name) {
    return this.aliases[name] ?? name
  }

  /**
   * Whether a name is a set, an alias, or a single literal character (section 2.2, literal names).
   *
   * @param {string} name A character set name.
   * @returns {boolean}
   */
  isKnownName(name) {
    return this.canonicalName(name) in this.sets || [...name].length === 1
  }

  /**
   * The regular expression source matching one character of a named set or a literal character.
   *
   * @param {string} name A set name, an alias, or a single character.
   * @returns {string} The regular expression source.
   * @throws {Error} If the name is none of these.
   * @private
   */
  _regexPart(name) {
    const canonical = this.canonicalName(name)
    if (canonical in this.sets) {
      return this.sets[canonical].regex
    }
    if ([...name].length === 1) {
      return escapeRegExp(name)
    }
    throw new Error(`Unknown character set name "${name}".`)
  }

  /**
   * A regular expression matching exactly one character that any of the names allows.
   *
   * @param {string[]} names Set names, aliases, or single literal characters.
   * @returns {RegExp} The expression (Unicode mode, so a character outside the BMP is one character).
   */
  regexFor(names) {
    const key = names.join('\u0000')
    if (!this._regexCache.has(key)) {
      const parts = names.map((name) => `(?:${this._regexPart(name)})`)
      this._regexCache.set(key, new RegExp(`^(?:${parts.join('|')})$`, 'u'))
    }
    return this._regexCache.get(key)
  }

  /**
   * The characters of a text that none of the names allows.
   *
   * @param {string} text The text to check.
   * @param {string[]} names Set names, aliases, or single literal characters. No names means no constraint.
   * @returns {Array<[number, string]>} [index, character] pairs; the index counts UTF-16 code units, as JavaScript
   *     string indices do.
   */
  problemCharacters(text, names) {
    if (names.length === 0) {
      return []
    }
    const regex = this.regexFor(names)
    const problems = []
    let index = 0
    for (const character of text) {
      if (!regex.test(character)) {
        problems.push([index, character])
      }
      index += character.length
    }
    return problems
  }

  /**
   * Say what the names allow, for an error message.
   *
   * A single named set is followed by its description without the markdown backticks; several names are listed
   * as written; a literal punctuation character is quoted.
   *
   * @param {string[]} names Set names, aliases, or single literal characters.
   * @returns {string} The description.
   */
  describe(names) {
    if (names.length === 1) {
      const entry = this.sets[this.canonicalName(names[0])]
      if (entry === undefined) {
        return this._literalName(names[0])
      }
      const description = (entry.description ?? '').replaceAll('`', '').replace(/\.$/, '')
      return description ? `${names[0]} (${description})` : names[0]
    }
    return names.map((name) => this._literalName(name)).join(', ')
  }

  /**
   * Quote a single punctuation character used as its own name; leave set names, letters and digits alone.
   *
   * @param {string} name A name.
   * @returns {string} The name as written in a message.
   * @private
   */
  _literalName(name) {
    if ([...name].length === 1 && !(name in this.sets) && !/^[\p{L}\p{N}]$/u.test(name)) {
      return `"${name}"`
    }
    return name
  }

  /**
   * The default character names of a standard value class for a standard schema version.
   *
   * @param {string} className A value class name.
   * @param {string|null} standardVersion The standard schema version in force; null picks the newest entry.
   * @returns {string[]} The names; empty when the file has no defaults for the class.
   */
  defaultsFor(className, standardVersion) {
    let chosen = []
    for (const entry of this.valueClassDefaults[className] ?? []) {
      if (!standardVersion || !semver.lt(standardVersion, entry.from)) {
        chosen = entry.sets
      }
    }
    return [...chosen]
  }

  /**
   * The whole-value regular expression of a value class, if it has one.
   *
   * @param {string} className A value class name.
   * @returns {RegExp|null} The expression, or null.
   */
  wordRule(className) {
    const entry = this.valueClassWords[className]
    return entry === undefined ? null : new RegExp(entry.regex, 'u')
  }

  /**
   * Whether no HED string may contain a character (hed_string.forbidden: listed characters and code ranges).
   *
   * @param {string} character A single character.
   * @returns {boolean}
   */
  isForbidden(character) {
    if ((this.forbidden.characters ?? []).includes(character)) {
      return true
    }
    const code = character.codePointAt(0)
    return (this.forbidden.code_ranges ?? []).some(([low, high]) => low <= code && code <= high)
  }
}

/**
 * The character sets of the specification, shared by every parser.
 * @type {CharacterSets}
 */
export const characterSets = new CharacterSets(characterSetsData)

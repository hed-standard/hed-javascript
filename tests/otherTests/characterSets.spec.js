import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemas, buildSchemasFromVersion } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { parseHedString } from '../../src/parser/parser'
import { CharacterSets, characterSets, codePoint } from '../../src/schema/characterSets'
import characterSetsData from '../../src/data/json/characterSets.json'
import { SchemaValueClass } from '../../src/schema/entries'

// src/data/json/characterSets.json is the specification's character_sets.json (section 2.2, Appendix B
// CHARACTER_INVALID); these tests pin how hed-javascript reads it, following hed-python.
describe('Character sets from the published character_sets.json', () => {
  describe('the loader', () => {
    it('compiles every named set as a JavaScript Unicode regular expression', () => {
      for (const name of Object.keys(characterSetsData.sets)) {
        assert.doesNotThrow(() => characterSets.regexFor([name]), undefined, undefined, name)
      }
    })

    it.each([
      ['name', ['a', 'Z', '7', '_', '-', 'é'], [' ', '.', '\u0085']],
      ['value-text', ['a', '?', '=', ':', '.', ' ', "'", ' '], ['(', ')', '#', '~', ',', '[', '{', '\u0085']],
      ['text', ['(', ')', '#', '~', '?'], [',', '[', ']', '{', '}', '\u009f']],
      ['nonascii', [' ', 'é', '中', '\u{1f600}'], ['a', '\u0080', '\u009f']],
    ])('%s accepts %j and rejects %j', (name, accepted, rejected) => {
      const regex = characterSets.regexFor([name])
      for (const character of accepted) {
        assert.isTrue(regex.test(character), `${name} should accept ${codePoint(character)}`)
      }
      for (const character of rejected) {
        assert.isFalse(regex.test(character), `${name} should reject ${codePoint(character)}`)
      }
    })

    it('resolves aliases and single characters that name themselves', () => {
      assert.isTrue(characterSets.regexFor(['slash']).test('/'))
      assert.isTrue(characterSets.isKnownName('slash'))
      assert.isTrue(characterSets.regexFor(['T']).test('T'))
      assert.isFalse(characterSets.regexFor(['T']).test('t'))
      assert.isTrue(characterSets.regexFor(['-', '$']).test('$'))
      assert.isFalse(characterSets.isKnownName('no-such-set'))
    })

    it('finds the offending characters with their indices', () => {
      assert.deepEqual(characterSets.problemCharacters('a?b=1', ['letters', 'digits']), [
        [1, '?'],
        [3, '='],
      ])
      assert.deepEqual(characterSets.problemCharacters('anything goes', []), [])
    })

    it('describes what names allow, as hed-python does', () => {
      assert.strictEqual(
        characterSets.describe(['value-text']),
        'value-text (text excluding left and right parentheses, number sign, and tilde)',
      )
      assert.strictEqual(characterSets.describe(['letters', 'digits', '-', 'T']), 'letters, digits, "-", T')
    })

    it('gives the value class defaults by standard schema version', () => {
      assert.notInclude(characterSets.defaultsFor('nameClass', '8.2.0'), 'nonascii')
      assert.include(characterSets.defaultsFor('nameClass', '8.3.0'), 'nonascii')
      assert.deepEqual(characterSets.defaultsFor('textClass', '8.4.0'), ['text'])
      assert.deepEqual(characterSets.defaultsFor('textClass', '8.5.0'), ['value-text'])
      assert.deepEqual(characterSets.defaultsFor('textClass', null), ['value-text'])
      assert.deepEqual(characterSets.defaultsFor('auxClass', '8.5.0'), [])
    })

    it('lists the characters no HED string may contain', () => {
      for (const character of ['[', ']', '~', '"', '\u0000', '\u001f', '\u007f', '\u0085', '\u009f']) {
        assert.isTrue(characterSets.isForbidden(character), codePoint(character))
      }
      for (const character of ['a', '(', '#', ' ', 'é']) {
        assert.isFalse(characterSets.isForbidden(character), codePoint(character))
      }
    })

    it('reads an allowedCharacter declaration, keeping a single character such as a comma as its own name', () => {
      assert.deepEqual(characterSets.declaredNames(['letters', 'digits']), ['letters', 'digits'])
      assert.deepEqual(characterSets.declaredNames(['letters,digits', ' hyphen ']), ['letters', 'digits', 'hyphen'])
      assert.deepEqual(characterSets.declaredNames([',']), [','])
      assert.deepEqual(characterSets.declaredNames(['-', '$']), ['-', '$'])
      assert.deepEqual(characterSets.problemCharacters('a,b', characterSets.declaredNames([','])), [
        [0, 'a'],
        [2, 'b'],
      ])
    })

    it('ignores names inherited from Object.prototype (a library class may be called "constructor")', () => {
      assert.deepEqual(characterSets.defaultsFor('constructor', '8.5.0'), [])
      assert.deepEqual(characterSets.defaultsFor('toString', null), [])
      assert.isNull(characterSets.wordRule('toString'))
      assert.strictEqual(characterSets.canonicalName('constructor'), 'constructor')
      assert.isFalse(characterSets.isKnownName('hasOwnProperty'))
      assert.strictEqual(characterSets.describe(['constructor']), 'constructor')
    })

    it('can be built from other data', () => {
      const sets = new CharacterSets({ sets: { vowels: { regex: '[aeiou]', description: 'vowels' } } })
      assert.deepEqual(sets.problemCharacters('hello', ['vowels']), [
        [0, 'h'],
        [2, 'l'],
        [3, 'l'],
      ])
    })
  })

  describe('value classes of a loaded schema', () => {
    const schemasByVersion = new Map()
    let auxSchemas

    beforeAll(async () => {
      for (const version of ['8.2.0', '8.4.0', '8.5.0']) {
        schemasByVersion.set(version, await buildSchemasFromVersion(version))
      }
      const dir = 'spec_tests/hed-tests/json_test_data/test_schemas/hedxml'
      auxSchemas = await buildSchemas(
        new SchemasSpec()
          .addSchemaSpec(new SchemaSpec('', '8.5.0', '', `${dir}/HED8.5.0.xml`))
          .addSchemaSpec(new SchemaSpec('', '1.0.0', 'testaux', `${dir}/HED_testaux_1.0.0.xml`)),
      )
    })

    const allowedNames = (schemas, className) =>
      schemas.baseSchema.entries.valueClasses.getEntry(className).allowedNames
    const errors = (hedString, schemas) => parseHedString(hedString, schemas, false, false, true)[1]
    const codes = (hedString, schemas) => errors(hedString, schemas).map((issue) => issue.hedCode)

    it('uses the defaults before 8.5.0 and the declaration from 8.5.0', () => {
      assert.deepEqual(allowedNames(schemasByVersion.get('8.4.0'), 'textClass'), ['text'])
      assert.deepEqual(allowedNames(schemasByVersion.get('8.5.0'), 'textClass'), ['value-text'])
      assert.include(allowedNames(schemasByVersion.get('8.5.0'), 'nameClass'), 'nonascii')
      assert.notInclude(allowedNames(schemasByVersion.get('8.2.0'), 'nameClass'), 'nonascii')
    })

    it('takes a library class from its declaration (testaux auxClass, allowedCharacter=letters)', () => {
      assert.deepEqual(allowedNames(auxSchemas, 'auxClass'), ['letters'])
      assert.deepEqual(codes('Aux-value/abc', auxSchemas), [])
      for (const value of ['abc123', 'a-b', 'a?b']) {
        assert.deepEqual(codes(`Aux-value/${value}`, auxSchemas), ['CHARACTER_INVALID'], value)
      }
    })

    it('reports a rejected character with the character, its code point, its index and the set', () => {
      const [issue] = errors('Label/a?b=1', schemasByVersion.get('8.5.0'))
      assert.strictEqual(issue.internalCode, 'invalidValueCharacter')
      assert.strictEqual(issue.hedCode, 'CHARACTER_INVALID')
      assert.include(
        issue.message,
        'Invalid character "?" (U+003F) at index 7 of "Label/a?b=1": nameClass allows letters, digits, underscore, hyphen, nonascii.',
      )
    })

    it('carries the code point and the character set names as issue parameters', () => {
      const [issue] = errors('Label/a?b=1', schemasByVersion.get('8.5.0'))
      assert.strictEqual(issue.parameters.codePoint, 'U+003F')
      assert.strictEqual(issue.parameters.charSet, 'letters, digits, underscore, hyphen, nonascii')
    })

    it('treats two declarations of a class as equivalent whatever the order of their names', () => {
      const declared = (names) => new SchemaValueClass('auxClass', 'A class.', new Set(), new Map(), names)
      assert.isTrue(declared(['letters', 'digits']).equivalent(declared(['digits', 'letters'])))
      assert.isFalse(declared(['letters', 'digits']).equivalent(declared(['letters'])))
      assert.deepEqual(declared(['digits', 'letters']).allowedNames, ['digits', 'letters'], 'order kept for messages')
    })

    it('checks the whole-value rule before the characters (numericClass stays VALUE_INVALID)', () => {
      assert.deepEqual(codes('Weight/3.0$ kg', schemasByVersion.get('8.4.0')), ['VALUE_INVALID'])
      assert.deepEqual(codes('Weight/3.0 kg', schemasByVersion.get('8.4.0')), [])
    })

    it('checks a value with no value class against value-text', () => {
      const schemas = schemasByVersion.get('8.5.0')
      // (A "//" in a value is a separate tokenizer error, TAG_INVALID "extra slash", before and after this change.)
      assert.deepEqual(codes('URL/x.org/a?b=1', schemas), [])
      const [issue] = errors('URL/a|b', schemasByVersion.get('8.5.0'))
      assert.isUndefined(issue, 'a vertical bar is value-text')
    })

    it('allows non-ASCII before 8.3.0 only where the value class does (Kay, 2026-10-19)', () => {
      const schemas = schemasByVersion.get('8.2.0')
      assert.deepEqual(codes('Description/café', schemas), [])
      assert.deepEqual(codes('Label/café', schemas), ['CHARACTER_INVALID'])
    })
  })
})

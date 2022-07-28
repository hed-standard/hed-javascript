const assert = require('chai').assert
const hed = require('../hed')
const schema = require('../../validator/schema/init')

describe('HED tag string utility functions', () => {
  describe('Syntactic utility functions', () => {
    const validator = function (testStrings, expectedResults, testFunction) {
      for (const testStringKey of Object.keys(testStrings)) {
        const testResult = testFunction(testStrings[testStringKey])
        assert.deepStrictEqual(testResult, expectedResults[testStringKey], testStrings[testStringKey])
      }
    }

    it('should properly replace tag values with the pound character', () => {
      const testStrings = {
        slash: 'Event/Duration/4 ms',
        noSlash: 'Something',
      }
      const expectedResults = {
        slash: 'Event/Duration/#',
        noSlash: '#',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.replaceTagNameWithPound(string)
      })
    })

    it('should detect the locations of slashes in a tag', () => {
      const testStrings = {
        description: 'Event/Description/Something',
        direction: 'Attribute/Direction/Left',
        noSlash: 'Something',
      }
      const expectedResults = {
        description: [5, 17],
        direction: [9, 19],
        noSlash: [],
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.getTagSlashIndices(string)
      })
    })

    it('should extract the last part of a tag', () => {
      const testStrings = {
        description: 'Event/Description/Something',
        direction: 'Attribute/Direction/Left',
        noSlash: 'Participant',
      }
      const expectedResults = {
        description: 'Something',
        direction: 'Left',
        noSlash: 'Participant',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.getTagName(string)
      })
    })

    it('should extract the parent part of a tag', () => {
      const testStrings = {
        description: 'Event/Description/Something',
        direction: 'Attribute/Direction/Left',
        noSlash: 'Participant',
      }
      const expectedResults = {
        description: 'Event/Description',
        direction: 'Attribute/Direction',
        noSlash: 'Participant',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.getParentTag(string)
      })
    })

    it('must be surrounded by parentheses', () => {
      const testStrings = {
        group: '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)',
        nonGroup: '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm',
      }
      const expectedResults = {
        group: true,
        nonGroup: false,
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.hedStringIsAGroup(string)
      })
    })

    it('can have its parentheses removed', () => {
      const testStrings = {
        group: '(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)',
      }
      const expectedResults = {
        group: '/Attribute/Object side/Left,/Participant/Effect/Body part/Arm',
      }
      validator(testStrings, expectedResults, (string) => {
        return hed.removeGroupParentheses(string)
      })
    })

    it('should properly determine valid values', () => {
      const testStrings = {
        integer: '4',
        decimal: '21.2',
        scientific: '3.4e2',
        negative: '-9.5e-1',
        placeholder: '#',
        time: '22:45',
        name: 'abc',
        word: 'one',
        space: 'spaced out',
      }
      const expectedResultsHed2 = {
        integer: true,
        decimal: true,
        scientific: true,
        negative: true,
        placeholder: true,
        time: true,
        name: true,
        word: true,
        space: true,
      }
      const expectedResultsHed2Numeric = {
        integer: true,
        decimal: true,
        scientific: true,
        negative: true,
        placeholder: true,
        time: false,
        name: false,
        word: false,
        space: false,
      }
      const expectedResultsHed3 = {
        integer: true,
        decimal: true,
        scientific: true,
        negative: true,
        placeholder: true,
        time: false,
        name: true,
        word: true,
        space: true,
      }
      const expectedResultsHed3Numeric = {
        integer: true,
        decimal: true,
        scientific: true,
        negative: true,
        placeholder: true,
        time: false,
        name: false,
        word: false,
        space: false,
      }
      validator(testStrings, expectedResultsHed2, (string) => {
        return hed.validateValue(string, false, false)
      })
      validator(testStrings, expectedResultsHed2Numeric, (string) => {
        return hed.validateValue(string, true, false)
      })
      validator(testStrings, expectedResultsHed3, (string) => {
        return hed.validateValue(string, false, true)
      })
      validator(testStrings, expectedResultsHed3Numeric, (string) => {
        return hed.validateValue(string, true, true)
      })
    })
  })

  const localHedSchemaFile = 'tests/data/HED7.1.1.xml'

  describe('HED tag schema-based utility functions', () => {
    let hedSchemaPromise

    beforeAll(() => {
      hedSchemaPromise = schema.buildSchema({
        path: localHedSchemaFile,
      })
    })

    it('should strip valid units from a value', () => {
      const dollarsString = '$25.99'
      const volumeString = '100 m^3'
      const prefixedVolumeString = '100 cm^3'
      const invalidVolumeString = '200 cm'
      const currencyUnits = ['dollars', '$', 'points', 'fraction']
      const volumeUnits = ['m^3']
      return hedSchemaPromise.then((hedSchemas) => {
        const strippedDollarsString = hed.validateUnits(dollarsString, currencyUnits, hedSchemas.baseSchema.attributes)
        const strippedVolumeString = hed.validateUnits(volumeString, volumeUnits, hedSchemas.baseSchema.attributes)
        const strippedPrefixedVolumeString = hed.validateUnits(
          prefixedVolumeString,
          volumeUnits,
          hedSchemas.baseSchema.attributes,
        )
        const strippedInvalidVolumeString = hed.validateUnits(
          invalidVolumeString,
          volumeUnits,
          hedSchemas.baseSchema.attributes,
        )
        assert.sameOrderedMembers(strippedDollarsString, [true, true, '25.99'])
        assert.sameOrderedMembers(strippedVolumeString, [true, true, '100'])
        assert.sameOrderedMembers(strippedPrefixedVolumeString, [true, true, '100'])
        assert.sameOrderedMembers(strippedInvalidVolumeString, [true, false, '200'])
      })
    })
  })
})

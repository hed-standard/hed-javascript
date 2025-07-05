import { describe, test } from '@jest/globals'
import { BidsSidecar } from '../../src/bids/types/json'
import { IssueError } from '../../src/issues/issues'

describe('Issue Parameters Tests', () => {
  // Common test data
  const validSidecarData = {
    event_code: {
      HED: {
        stim1: 'Blue',
        stim2: 'Green',
      },
    },
    name_key: {
      HED: 'Label/#',
    },
  }

  // Helper function to test error properties
  const expectError = (thrownError, expectedInternalCode, expectedHedCode, expectedLevel = 'error') => {
    expect(thrownError).toBeInstanceOf(IssueError)
    expect(thrownError.issue.internalCode).toBe(expectedInternalCode)
    expect(thrownError.issue.hedCode).toBe(expectedHedCode)
    expect(thrownError.issue.level).toBe(expectedLevel)
  }

  // Helper function to test complete error message structure
  const expectCompleteErrorMessage = (thrownError, expectedHedCode, expectedMessageParts) => {
    const message = thrownError.issue.message
    expect(message).toContain('ERROR:')
    expect(message).toContain(`[${expectedHedCode}]`)
    expectedMessageParts.forEach((part) => {
      expect(message).toContain(part)
    })
    expect(message).toContain('https://hed-specification.readthedocs.io')
    expect(message).toContain('For more information on this HED error')
  }

  // Helper function to attempt sidecar creation and capture error
  const captureError = (sidecarData, filename = 'test.json', defManager = undefined) => {
    let thrownError
    try {
      new BidsSidecar(filename, { path: filename }, sidecarData, defManager)
      expect(true).toBe(false) // This should not be reached
    } catch (error) {
      thrownError = error
    }
    return thrownError
  }

  describe('IllegalSidecarHedDeepKey', () => {
    const createInvalidData = (nestingLevels) => {
      let data = { HED: { stim1: 'Blue', stim2: 'Green' } }
      for (let i = 0; i < nestingLevels - 2; i++) {
        data = { [`Level${i + 1}`]: data }
      }
      return { event_code: data }
    }

    test('should not throw error for valid sidecar with HED at level 2', () => {
      expect(() => {
        new BidsSidecar('test.json', { path: 'test.json' }, validSidecarData)
      }).not.toThrow()
    })

    test.each([
      [3, 'level 3'],
      [4, 'level 4'],
      [5, 'level 5'],
    ])('should throw error with correct parameter for HED at %s', (levels, description) => {
      const invalidData = createInvalidData(levels)
      const thrownError = captureError(invalidData)

      expectError(thrownError, 'illegalSidecarHedDeepKey', 'SIDECAR_INVALID')
      expect(thrownError.issue.parameters.key).toBe('event_code')
      expect(thrownError.issue.message).toContain('top-level key "event_code"')
    })

    test('should handle multiple deep HED keys and report first encountered', () => {
      const invalidData = {
        event_code: { Level: { HED: { stim1: 'Blue' } } },
        another_key: { AnotherLevel: { HED: 'Label/#' } },
      }
      const thrownError = captureError(invalidData)

      expectError(thrownError, 'illegalSidecarHedDeepKey', 'SIDECAR_INVALID')
      expect(['event_code', 'another_key']).toContain(thrownError.issue.parameters.key)
    })

    test('should be case insensitive for HED key detection', () => {
      const invalidData = {
        event_code: { Level: { hed: { stim1: 'Blue' } } },
      }
      const thrownError = captureError(invalidData)

      expectError(thrownError, 'illegalSidecarHedDeepKey', 'SIDECAR_INVALID')
      expect(thrownError.issue.parameters.key).toBe('event_code')
    })

    test('should validate complete error structure and message', () => {
      const invalidData = createInvalidData(3)
      const thrownError = captureError(invalidData)

      expectError(thrownError, 'illegalSidecarHedDeepKey', 'SIDECAR_INVALID')
      expect(thrownError.issue.parameters.key).toBe('event_code')
      expect(thrownError.issue.parameters.filePath).toBe('test.json')
      expect(thrownError.issue.parameters.sidecarKey).toBe('event_code')

      expectCompleteErrorMessage(thrownError, 'SIDECAR_INVALID', [
        'An illegal "HED" appeared as a key below level 2',
        'top-level key "event_code"',
        'sidecar-invalid',
      ])
    })

    test('should handle edge cases without error', () => {
      expect(() => new BidsSidecar('test.json', { path: 'test.json' }, {})).not.toThrow()

      const noHedSidecar = {
        event_code: { Level: { stim1: 'Blue', stim2: 'Green' } },
      }
      expect(() => new BidsSidecar('test.json', { path: 'test.json' }, noHedSidecar)).not.toThrow()
    })
  })

  describe('IllegalSidecarHedKey', () => {
    test.each([
      ['HED', 'Label/#'],
      ['hed', 'Label/#'], // lowercase
      ['n/a', 'some value'],
      ['N/A', 'another value'], // different case
    ])('should throw error for top-level "%s" key', (illegalKey, value) => {
      const invalidData = {
        [illegalKey]: value,
        event_code: { stim1: 'Blue', stim2: 'Green' },
      }
      const thrownError = captureError(invalidData)

      expectError(thrownError, 'illegalSidecarHedKey', 'SIDECAR_INVALID')
      expect(thrownError.issue.message).toContain('illegally used as a top-level sidecar key')
    })

    test('should validate complete error structure for illegal top-level HED', () => {
      const invalidData = { HED: 'Label/#', event_code: { stim1: 'Blue' } }
      const thrownError = captureError(invalidData)

      expectError(thrownError, 'illegalSidecarHedKey', 'SIDECAR_INVALID')
      expect(thrownError.issue.parameters.filePath).toBe('test.json')
      expect(thrownError.issue.parameters.sidecarKey).toBe('HED')

      expectCompleteErrorMessage(thrownError, 'SIDECAR_INVALID', [
        'illegally used as a top-level sidecar key',
        'sidecar-invalid',
      ])
    })
  })

  describe('IllegalSidecarData', () => {
    const createCorruptedSidecar = (corruptedValue) => {
      const sidecar = new BidsSidecar('test.json', { path: 'test.json' }, validSidecarData)
      sidecar.parsedHedData = new Map()
      sidecar.parsedHedData.set('event_code', corruptedValue)
      return sidecar
    }

    const testCorruptedData = (corruptedValue, description) => {
      const sidecar = createCorruptedSidecar(corruptedValue)
      let thrownError
      try {
        sidecar._generateSidecarColumnSpliceMap()
        expect(true).toBe(false) // This should not be reached
      } catch (error) {
        thrownError = error
      }

      expectError(thrownError, 'illegalSidecarData', 'SIDECAR_INVALID')
      expect(thrownError.issue.parameters.sidecarKey).toBe('event_code')
      expect(thrownError.issue.parameters.filePath).toBe('test.json')
      return thrownError
    }

    test.each([
      ['string', 'invalid_string_data'],
      ['number', 42],
      ['array', ['invalid', 'array', 'data']],
      ['plain object', { invalid: 'object', data: 'here' }],
      ['boolean true', true],
      // Note: null and false are falsy and won't trigger the error condition
    ])('should throw error when parsedHedData contains %s instead of expected type', (type, value) => {
      testCorruptedData(value, `${type} data`)
    })

    test('should not throw error for falsy values that are not ParsedHedString or Map', () => {
      const sidecar = new BidsSidecar('test.json', { path: 'test.json' }, validSidecarData)
      sidecar.parsedHedData = new Map()

      // These falsy values should not trigger the error because of the "else if (hedData)" condition
      const falsyValues = [null, false, 0, '', undefined]

      falsyValues.forEach((value) => {
        sidecar.parsedHedData.set('event_code', value)
        expect(() => {
          sidecar._generateSidecarColumnSpliceMap()
        }).not.toThrow()
      })
    })

    test('should include both key and filepath parameters in error', () => {
      const sidecar = new BidsSidecar(
        'custom_file.json',
        { path: 'custom_file.json' },
        {
          column_name: { HED: { stim1: 'Blue' } },
        },
      )
      sidecar.parsedHedData = new Map()
      sidecar.parsedHedData.set('column_name', { invalid: 'object' })

      let thrownError
      try {
        sidecar._generateSidecarColumnSpliceMap()
        expect(true).toBe(false)
      } catch (error) {
        thrownError = error
      }

      expectError(thrownError, 'illegalSidecarData', 'SIDECAR_INVALID')
      expect(thrownError.issue.parameters.sidecarKey).toBe('column_name')
      expect(thrownError.issue.parameters.filePath).toBe('custom_file.json')
    })

    test.each([
      ['ParsedHedString', { event_code: { HED: 'Label/#' } }],
      ['Map', { event_code: { HED: { stim1: 'Blue', stim2: 'Green' } } }],
    ])('should not throw error when parsedHedData contains valid %s', (type, data) => {
      expect(() => {
        new BidsSidecar('test.json', { path: 'test.json' }, data)
      }).not.toThrow()
    })

    test('should validate complete error structure', () => {
      const thrownError = testCorruptedData('corrupted_data', 'corrupted string data')

      expectCompleteErrorMessage(thrownError, 'SIDECAR_INVALID', [
        'The data associated with sidecar key "event_code" cannot be parsed',
        'sidecar-invalid',
      ])
    })
  })

  describe('InvalidDefinitionManager', () => {
    test.each([
      ['string', 'invalid_string', 'invalid_string'],
      ['number', 42, '42'],
      ['plain object', { invalid: 'object' }, '[object Object]'],
      ['array', ['invalid', 'array'], 'invalid,array'],
      ['boolean', true, 'true'],
    ])('should throw error when defManager is %s', (type, value, expectedStringRepresentation) => {
      const thrownError = captureError(validSidecarData, 'test.json', value)

      expectError(thrownError, 'invalidDefinitionManager', 'DEFINITION_INVALID')
      expect(thrownError.issue.parameters.defManager).toBe(expectedStringRepresentation)
      expect(thrownError.issue.parameters.filePath).toBe('test.json')
    })

    test('should throw error when defManager is a function', () => {
      // Test functions separately to avoid Jest internal code interference
      const testFunction = function simpleTestFunction() {
        return 'test'
      }
      const thrownError = captureError(validSidecarData, 'test.json', testFunction)

      expectError(thrownError, 'invalidDefinitionManager', 'DEFINITION_INVALID')
      expect(thrownError.issue.parameters.defManager).toContain('function simpleTestFunction')
      expect(thrownError.issue.parameters.filePath).toBe('test.json')
    })

    test('should not throw error when defManager is null, undefined, or not provided', () => {
      expect(() => {
        new BidsSidecar('test.json', { path: 'test.json' }, validSidecarData, null)
      }).not.toThrow()
      expect(() => {
        new BidsSidecar('test.json', { path: 'test.json' }, validSidecarData, undefined)
      }).not.toThrow()
      expect(() => {
        new BidsSidecar('test.json', { path: 'test.json' }, validSidecarData)
      }).not.toThrow()
    })

    test('should validate complete error structure', () => {
      const thrownError = captureError(validSidecarData, 'custom_file.json', 'invalid_defmanager')

      expectError(thrownError, 'invalidDefinitionManager', 'DEFINITION_INVALID')
      expect(thrownError.issue.parameters.defManager).toBe('invalid_defmanager')
      expect(thrownError.issue.parameters.filePath).toBe('custom_file.json')

      expectCompleteErrorMessage(thrownError, 'DEFINITION_INVALID', [
        'Invalid definition manager "invalid_defmanager"',
        'File path: "custom_file.json"',
        'definition-invalid',
      ])
    })
  })
})

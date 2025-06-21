import {
  getMergedSidecarData,
  isSubpath,
  organizePaths,
  parseBidsFilename,
  organizedPathsGenerator,
  _getCandidates,
  _sortCandidates,
} from '../../src/utils/paths'
import { BidsSidecar } from '../../src/bids/types/json'
import { describe, expect, test } from '@jest/globals'

describe('paths utils', () => {
  describe('isSubpath', () => {
    it('should determine if a path is a subpath of another', () => {
      expect(isSubpath('a/b/c', 'a/b')).toBe(true)
      expect(isSubpath('a/b', 'a/b/c')).toBe(false)
      expect(isSubpath('a/b/c', 'a/b/c')).toBe(true)
      expect(isSubpath('a/b/c', '.')).toBe(true)
      expect(isSubpath('a/b/c', '/')).toBe(true)
      expect(isSubpath('.', 'a/b/c')).toBe(false)
    })
  })

  describe('parseBidsFilename', () => {
    it('should parse BIDS filenames correctly', () => {
      const expected = {
        basename: 'sub-01_ses-01_task-test_events',
        suffix: 'events',
        prefix: null,
        ext: '.tsv',
        bad: [],
        entities: {
          sub: '01',
          ses: '01',
          task: 'test',
        },
      }
      const result = parseBidsFilename('/sub-01/ses-01/sub-01_ses-01_task-test_events.tsv')
      expect(result).toEqual(expected)
    })

    it('should parse a standard BIDS filename', () => {
      const expected = {
        basename: 'sub-01_task-rest_bold',
        suffix: 'bold',
        prefix: null,
        ext: '.nii.gz',
        bad: [],
        entities: {
          sub: '01',
          task: 'rest',
        },
      }
      expect(parseBidsFilename('sub-01_task-rest_bold.nii.gz')).toEqual(expected)
    })

    it('should handle a filename with a prefix and no entities', () => {
      const expected = {
        basename: 'dataset_description',
        suffix: 'description',
        prefix: 'dataset',
        ext: '.json',
        bad: [],
        entities: {},
      }
      expect(parseBidsFilename('dataset_description.json')).toEqual(expected)
    })

    it('should handle a filename with multiple entities', () => {
      const expected = {
        basename: 'sub-02_ses-1_task-memory_run-2_bold',
        suffix: 'bold',
        prefix: null,
        ext: '.nii.gz',
        bad: [],
        entities: {
          sub: '02',
          ses: '1',
          task: 'memory',
          run: '2',
        },
      }
      expect(parseBidsFilename('sub-02_ses-1_task-memory_run-2_bold.nii.gz')).toEqual(expected)
    })

    it('should handle an invalid filename without underscore before suffix', () => {
      const expected = {
        basename: 'sub-03task-memorybold',
        suffix: null,
        prefix: null,
        ext: '.nii.gz',
        bad: ['sub-03task-memorybold'],
        entities: {},
      }
      expect(parseBidsFilename('sub-03task-memorybold.nii.gz')).toEqual(expected)
    })

    it('should handle an empty filename', () => {
      const expected = {
        basename: '',
        suffix: null,
        prefix: null,
        ext: '',
        bad: [],
        entities: {},
      }
      expect(parseBidsFilename('')).toEqual(expected)
    })

    it('should handle filename with missing entity values', () => {
      const expected = {
        basename: 'sub-_task-_bold',
        suffix: 'bold',
        prefix: null,
        ext: '.nii.gz',
        bad: ['sub-', 'task-'],
        entities: {},
      }
      expect(parseBidsFilename('sub-_task-_bold.nii.gz')).toEqual(expected)
    })

    it('should handle filename with missing suffix', () => {
      const expected = {
        basename: 'sub-04_ses-2_task-motor',
        suffix: null,
        prefix: null,
        ext: '.nii.gz',
        bad: [],
        entities: {
          sub: '04',
          ses: '2',
          task: 'motor',
        },
      }
      expect(parseBidsFilename('sub-04_ses-2_task-motor.nii.gz')).toEqual(expected)
    })

    it('should handle filename with unknown format', () => {
      const expected = {
        basename: 'invalidfileformat',
        suffix: 'invalidfileformat',
        prefix: null,
        ext: '',
        bad: [],
        entities: {},
      }
      expect(parseBidsFilename('invalidfileformat')).toEqual(expected)
    })

    it('should parse a full BIDS path and a simple entity path', () => {
      const path1 = '/d/base/sub-01/ses-test/func/sub-01_ses-test_task-overt_run-2_bold.json'
      const expected1 = {
        basename: 'sub-01_ses-test_task-overt_run-2_bold',
        suffix: 'bold',
        prefix: null,
        ext: '.json',
        bad: [],
        entities: {
          sub: '01',
          ses: 'test',
          task: 'overt',
          run: '2',
        },
      }
      expect(parseBidsFilename(path1)).toEqual(expected1)

      const path2 = 'sub-01.json'
      const expected2 = {
        basename: 'sub-01',
        suffix: null,
        prefix: null,
        ext: '.json',
        bad: [],
        entities: {
          sub: '01',
        },
      }
      expect(parseBidsFilename(path2)).toEqual(expected2)
    })

    it('should parse partial BIDS filenames', () => {
      const path1 = 'task-overt_bold.json'
      const expected1 = {
        basename: 'task-overt_bold',
        suffix: 'bold',
        prefix: null,
        ext: '.json',
        bad: [],
        entities: {
          task: 'overt',
        },
      }
      expect(parseBidsFilename(path1)).toEqual(expected1)

      const path2 = 'task-overt_bold'
      const expected2 = {
        basename: 'task-overt_bold',
        suffix: 'bold',
        prefix: null,
        ext: '',
        bad: [],
        entities: {
          task: 'overt',
        },
      }
      expect(parseBidsFilename(path2)).toEqual(expected2)

      const path3 = 'bold'
      const expected3 = {
        basename: 'bold',
        suffix: 'bold',
        prefix: null,
        ext: '',
        bad: [],
        entities: {},
      }
      expect(parseBidsFilename(path3)).toEqual(expected3)
    })

    it('should handle invalid entities', () => {
      const path1 = 'task--x_sub-01_description.json'
      const expected1 = {
        basename: 'task--x_sub-01_description',
        suffix: 'description',
        prefix: null,
        ext: '.json',
        bad: ['task--x'],
        entities: {
          sub: '01',
        },
      }
      expect(parseBidsFilename(path1)).toEqual(expected1)
    })
  })

  describe('_getCandidates', () => {
    it('should filter candidate sidecars correctly', () => {
      const tsvPath = 'sub-01/ses-01/func/sub-01_ses-01_task-A_events.tsv'
      const tsvParsed = parseBidsFilename(tsvPath)
      const tsvDir = 'sub-01/ses-01/func'
      const jsonList = [
        'task-A_events.json', // applicable
        'events.json', // applicable
        'task-B_events.json', // not applicable (wrong task)
        'sub-01/sub-01_task-A_events.json', // applicable
        'sub-02/sub-02_task-A_events.json', // not applicable (wrong subject)
        'sub-01/ses-01/func/sub-01_ses-01_task-A_scans.json', // not applicable (wrong suffix)
        'sub-01/ses-02/sub-01_ses-02_task-A_events.json', // not applicable (different session)
      ]

      const candidates = _getCandidates(jsonList, tsvDir, tsvParsed)
      expect(candidates).toEqual(['task-A_events.json', 'events.json', 'sub-01/sub-01_task-A_events.json'])
    })
  })

  describe('_sortCandidates', () => {
    it('should sort candidates from least to most specific based on path and entities', () => {
      const candidates = [
        'sub-01/ses-01/task-test_events.json',
        'sub-01/task-test_events.json',
        'events.json',
        'task-test_events.json',
        'sub-01/sub-01_task-test_events.json',
      ]
      _sortCandidates(candidates)
      expect(candidates).toEqual([
        'events.json',
        'task-test_events.json',
        'sub-01/task-test_events.json',
        'sub-01/sub-01_task-test_events.json',
        'sub-01/ses-01/task-test_events.json',
      ])
    })
  })

  describe('getMergedSidecarData', () => {
    it('should merge sidecar data correctly, with more specific sidecars taking precedence', () => {
      const tsvPath = 'sub-01/ses-01/func/sub-01_ses-01_task-test_events.tsv'
      const jsonList = [
        'task-test_events.json',
        'sub-01/task-test_events.json',
        'sub-01/ses-01/task-test_events.json',
        'events.json', // generic, should be overridden
      ]
      const sidecarMap = new Map()
      sidecarMap.set('events.json', new BidsSidecar('events.json', {}, { a: 1, b: 1, c: 1 }))
      sidecarMap.set('task-test_events.json', new BidsSidecar('task-test_events.json', {}, { b: 2, d: 2 }))
      sidecarMap.set(
        'sub-01/task-test_events.json',
        new BidsSidecar('sub-01/task-test_events.json', {}, { c: 3, e: 3 }),
      )
      sidecarMap.set(
        'sub-01/ses-01/task-test_events.json',
        new BidsSidecar('sub-01/ses-01/task-test_events.json', {}, { a: 4, f: 4 }),
      )

      const merged = getMergedSidecarData(tsvPath, jsonList, sidecarMap)
      expect(merged).toEqual({ a: 4, b: 2, c: 3, d: 2, e: 3, f: 4 })
    })

    it('should handle a simple inheritance case', () => {
      const tsvPath = 'sub-01/func/sub-01_task-test_events.tsv'
      const jsonList = ['task-test_events.json', 'sub-01/sub-01_task-test_events.json']
      const sidecarMap = new Map()
      sidecarMap.set('task-test_events.json', new BidsSidecar('task-test_events.json', {}, { a: 1, b: 2 }))
      sidecarMap.set(
        'sub-01/sub-01_task-test_events.json',
        new BidsSidecar('sub-01/sub-01_task-test_events.json', {}, { b: 3, c: 4 }),
      )

      const merged = getMergedSidecarData(tsvPath, jsonList, sidecarMap)
      expect(merged).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should correctly filter sidecars by entities and suffix', () => {
      const tsvPath = 'sub-01/ses-01/func/sub-01_ses-01_task-A_events.tsv'
      const jsonList = [
        'task-A_events.json', // applicable
        'task-B_events.json', // not applicable (wrong task)
        'sub-01/sub-01_task-A_events.json', // applicable
        'sub-02/sub-02_task-A_events.json', // not applicable (wrong subject)
        'sub-01/ses-01/func/sub-01_ses-01_task-A_scans.json', // not applicable (wrong suffix)
      ]
      const sidecarMap = new Map()
      sidecarMap.set('task-A_events.json', new BidsSidecar('task-A_events.json', {}, { a: 1 }))
      sidecarMap.set('task-B_events.json', new BidsSidecar('task-B_events.json', {}, { b: 2 }))
      sidecarMap.set(
        'sub-01/sub-01_task-A_events.json',
        new BidsSidecar('sub-01/sub-01_task-A_events.json', {}, { c: 3 }),
      )
      sidecarMap.set(
        'sub-02/sub-02_task-A_events.json',
        new BidsSidecar('sub-02/sub-02_task-A_events.json', {}, { d: 4 }),
      )
      sidecarMap.set(
        'sub-01/ses-01/func/sub-01_ses-01_task-A_scans.json',
        new BidsSidecar('sub-01/ses-01/func/sub-01_ses-01_task-A_scans.json', {}, { e: 5 }),
      )

      const merged = getMergedSidecarData(tsvPath, jsonList, sidecarMap)
      expect(merged).toEqual({ a: 1, c: 3 })
    })

    it('should throw an error for conflicting sidecars at the same level', () => {
      const tsvPath = 'sub-01/func/sub-01_task-test_run-1_events.tsv'
      const jsonList = ['sub-01/sub-01_events.json', 'sub-01/sub-01_task_test_events.json']
      const sidecarMap = new Map()
      sidecarMap.set(
        'sub-01/sub-01_events.json',
        new BidsSidecar('sub-01/sub-01_events.json', { path: 'sub-01/sub-01_events.json' }, { a: 1 }),
      )
      sidecarMap.set(
        'sub-01/sub-01_task_test_events.json',
        new BidsSidecar(
          'sub-01/sub-01_task_test_events.json',
          { path: 'sub-01/sub-01_task_test_events.json' },
          { b: 2 },
        ),
      )

      expect(() => getMergedSidecarData(tsvPath, jsonList, sidecarMap)).toThrow(
        "BIDS inheritance conflict in directory 'sub-01': sidecars 'sub-01/sub-01_events.json' and 'sub-01/sub-01_task_test_events.json' are not hierarchically related.",
      )
    })

    it('should not throw an error for hierarchical sidecars in the same directory', () => {
      const tsvPath = 'sub-01/ses-01/func/sub-01_ses-01_task-test_events.tsv'
      const jsonList = ['sub-01/task-test_events.json', 'sub-01/ses-01/sub-01_ses-01_task-test_events.json']
      const sidecarMap = new Map()
      sidecarMap.set(
        'sub-01/task-test_events.json',
        new BidsSidecar('task-test_events.json', { path: 'sub-01/task-test_events.json' }, { a: 1 }),
      )
      sidecarMap.set(
        'sub-01/ses-01/sub-01_ses-01_task-test_events.json',
        new BidsSidecar(
          'sub-01_ses-01_task-test_events.json',
          { path: 'sub-01/ses-01/task-test_events.json' },
          { b: 2 },
        ),
      )

      const merged = getMergedSidecarData(tsvPath, jsonList, sidecarMap)
      expect(merged).toEqual({ a: 1, b: 2 })
    })

    it('should return an empty object when no sidecars are applicable', () => {
      const tsvPath = 'sub-01/func/sub-01_task-test_events.tsv'
      const jsonList = ['task-other_events.json', 'sub-02/sub-02_events.json']
      const sidecarMap = new Map()
      sidecarMap.set('task-other_events.json', new BidsSidecar('task-other_events.json', {}, { a: 1 }))
      sidecarMap.set('sub-02/sub-02_events.json', new BidsSidecar('sub-02_events.json', {}, { b: 2 }))

      const merged = getMergedSidecarData(tsvPath, jsonList, sidecarMap)
      expect(merged).toEqual({})
    })

    it('should correctly merge sidecars with complex HED structures', () => {
      const tsvPath = 'sub-01/func/sub-01_task-test_events.tsv'
      const jsonList = ['events.json', 'task-test_events.json']
      const sidecarMap = new Map()
      sidecarMap.set(
        'events.json',
        new BidsSidecar(
          'events.json',
          {},
          {
            onset: { Description: 'Generic onset' },
            event_type: { HED: { show_face: 'Generic face' } },
          },
        ),
      )
      sidecarMap.set(
        'task-test_events.json',
        new BidsSidecar(
          'task-test_events.json',
          {},
          {
            event_type: { HED: { show_face: 'Specific face for task-test' } },
            face_type: { Description: 'Type of face' },
          },
        ),
      )

      const merged = getMergedSidecarData(tsvPath, jsonList, sidecarMap)
      expect(merged).toEqual({
        onset: { Description: 'Generic onset' },
        event_type: { HED: { show_face: 'Specific face for task-test' } },
        face_type: { Description: 'Type of face' },
      })
    })
  })

  describe('organizePaths', () => {
    const suffixes = ['participants', '_events']
    const specialDirs = ['phenotype', 'stimuli']

    test('should organize paths correctly', () => {
      const fileList = [
        'dataset_description.json',
        'participants.tsv',
        'participants.json',
        'sub-01/sub-01_sessions.tsv',
        'sub-01/func/sub-01_task-rest_events.tsv',
        'sub-01/func/sub-01_task-rest_events.json',
      ]
      const { organizedPaths } = organizePaths(
        fileList,
        ['dataset_description', 'participants', '_sessions', '_events'],
        [],
      )
      //expect(organizedPaths.get('dataset_description').get('json')).toHaveLength(1)
      expect(organizedPaths.get('participants').get('tsv')).toHaveLength(1)
      expect(organizedPaths.get('_sessions').get('tsv')).toHaveLength(1)
      expect(organizedPaths.get('_events').get('tsv')).toHaveLength(1)
    })

    test('should return empty candidates and initialized organizedPaths for empty file list', () => {
      const { candidates, organizedPaths } = organizePaths([], suffixes, specialDirs)
      expect(candidates).toEqual([])
      expect(organizedPaths).toBeInstanceOf(Map)
      expect(organizedPaths.size).toBe(suffixes.length + specialDirs.length)
      expect(Array.from(organizedPaths.keys())).toEqual(['participants', '_events', 'phenotype', 'stimuli'])
    })

    test('should correctly categorize top-level, subject, and special directory files', () => {
      const paths = [
        'participants.tsv',
        'sub-01/sub-01_events.tsv',
        'phenotype/measure.tsv',
        'stimuli/images.json',
        'participants.json',
        'sub-02/sub-02_events.json',
      ]
      const { candidates, organizedPaths } = organizePaths(paths, suffixes, specialDirs)
      expect(candidates).toEqual(paths)
      expect(organizedPaths.get('participants').get('json')).toEqual(['participants.json'])
      expect(organizedPaths.get('participants').get('tsv')).toEqual(['participants.tsv'])
      expect(organizedPaths.get('_events').get('json')).toEqual(['sub-02/sub-02_events.json'])
      expect(organizedPaths.get('_events').get('tsv')).toEqual(['sub-01/sub-01_events.tsv'])
      expect(organizedPaths.get('phenotype').get('json')).toEqual([])
      expect(organizedPaths.get('phenotype').get('tsv')).toEqual(['phenotype/measure.tsv'])
      expect(organizedPaths.get('stimuli').get('json')).toEqual(['stimuli/images.json'])
      expect(organizedPaths.get('stimuli').get('tsv')).toEqual([])
    })

    test('should ignore files with non-matching extensions or in non-BIDS directories', () => {
      const paths = [
        'participants.txt', // wrong extension
        'derivatives/something.tsv', // wrong directory
        'README.md', // wrong extension and suffix
      ]
      const { candidates, organizedPaths } = organizePaths(paths, suffixes, specialDirs)
      expect(candidates).toEqual([])
      expect(organizedPaths.get('participants').get('json')).toEqual([])
      expect(organizedPaths.get('participants').get('tsv')).toEqual([])
      expect(organizedPaths.get('_events').get('json')).toEqual([])
      expect(organizedPaths.get('_events').get('tsv')).toEqual([])
    })

    test('should handle a complex mix of valid and invalid paths', () => {
      const paths = [
        'participants.tsv',
        'dataset_description.json', // Not in suffixes, ignored
        'sub-01/sub-01_sessions.tsv', // Not in suffixes, ignored
        'sub-01/sub-01_events.tsv',
        'phenotype/demographics.tsv',
        'stimuli/paradigms.json',
        'derivatives/sub-01/sub-01_events.tsv', // In derivatives, ignored
        'code/process.py', // wrong extension and directory
      ]
      const { candidates, organizedPaths } = organizePaths(paths, suffixes, specialDirs)
      expect(candidates).toEqual([
        'participants.tsv',
        'sub-01/sub-01_events.tsv',
        'phenotype/demographics.tsv',
        'stimuli/paradigms.json',
      ])
      expect(organizedPaths.get('participants').get('tsv')).toEqual(['participants.tsv'])
      expect(organizedPaths.get('_events').get('tsv')).toEqual(['sub-01/sub-01_events.tsv'])
      expect(organizedPaths.get('phenotype').get('tsv')).toEqual(['phenotype/demographics.tsv'])
      expect(organizedPaths.get('stimuli').get('json')).toEqual(['stimuli/paradigms.json'])
    })
  })

  describe('organizedPathsIterator', () => {
    test('yields only values with the specified extension', () => {
      const testMap = new Map([
        [
          'group1',
          new Map([
            ['json', ['dir/file1.json']],
            ['txt', ['dir/file2.txt']],
          ]),
        ],
        [
          'group2',
          new Map([
            ['json', ['more/file3.json', 'file5.json']],
            ['md', ['more/file4.md']],
          ]),
        ],
      ])

      const result = Array.from(organizedPathsGenerator(testMap, 'json'))
      expect(result).toEqual(['dir/file1.json', 'more/file3.json', 'file5.json'])
    })

    test('yields nothing if no values match', () => {
      const testMap = new Map([
        [
          'group1',
          new Map([
            ['a', 'file.txt'],
            ['b', 'another.md'],
          ]),
        ],
      ])

      const result = Array.from(organizedPathsGenerator(testMap, '.json'))
      expect(result).toEqual([])
    })

    test('handles an empty outer map', () => {
      const testMap = new Map()
      const result = Array.from(organizedPathsGenerator(testMap, '.json'))
      expect(result).toEqual([])
    })
  })
})

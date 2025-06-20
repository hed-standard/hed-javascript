// filepath: i:\HEDJavascript\hed-javascript\tests\otherTests\datasetParser.spec.js
import { describe, it, expect, beforeAll } from '@jest/globals'
import { BidsFileAccessor, BidsDirectoryAccessor } from '../../src/bids/datasetParser'
import path from 'path'
import fs from 'fs'

describe('BidsFileAccessor', () => {
  const datasetRoot = '/my/dataset'

  it('should throw an error if datasetRootDirectory is not a string', () => {
    expect(() => new BidsFileAccessor(null, new Map())).toThrow(
      'BidsFileAccessor constructor requires a string for datasetRootDirectory.',
    )
  })

  it('should throw an error if fileMap is not a Map', () => {
    expect(() => new BidsFileAccessor(datasetRoot, [])).toThrow(
      'BidsFileAccessor constructor requires a Map argument for fileMap.',
    )
  })

  it('should handle an empty fileMap', () => {
    const fileMap = new Map()
    const accessor = new BidsFileAccessor(datasetRoot, fileMap)
    expect(accessor.fileMap.size).toBe(0)
    expect(accessor.organizedPaths.size).toBe(BidsFileAccessor.SUFFIXES.length + BidsFileAccessor.SPECIAL_DIRS.length)
    accessor.organizedPaths.forEach((category) => {
      expect(category.get('json')).toEqual([])
      expect(category.get('tsv')).toEqual([])
    })
  })

  it('should handle a fileMap with no BIDS candidates', () => {
    const fileMap = new Map([
      ['README.md', {}],
      ['code/script.py', {}],
      ['derivatives/output.nii.gz', {}],
    ])
    const accessor = new BidsFileAccessor(datasetRoot, fileMap)
    expect(accessor.fileMap.size).toBe(0)
  })

  it('should handle a fileMap with only files in special directories', () => {
    const fileMap = new Map([
      ['phenotype/data.tsv', {}],
      ['stimuli/images.json', {}],
    ])
    const accessor = new BidsFileAccessor(datasetRoot, fileMap)
    expect(accessor.fileMap.size).toBe(2)
    expect(accessor.organizedPaths.get('phenotype').get('tsv')).toEqual(['phenotype/data.tsv'])
    expect(accessor.organizedPaths.get('stimuli').get('json')).toEqual(['stimuli/images.json'])
    expect(accessor.organizedPaths.get('participants').get('tsv')).toEqual([])
  })

  it('should handle a fileMap with only top-level files', () => {
    const fileMap = new Map([
      ['participants.tsv', {}],
      ['dataset_description.json', {}],
    ])
    const accessor = new BidsFileAccessor(datasetRoot, fileMap)
    expect(accessor.fileMap.size).toBe(2)
    expect(accessor.organizedPaths.get('participants').get('tsv')).toEqual(['participants.tsv'])
    expect(accessor.organizedPaths.get('dataset_description').get('json')).toEqual(['dataset_description.json'])
    expect(accessor.organizedPaths.get('phenotype').get('tsv')).toEqual([])
  })

  it('should handle a fileMap with only subject-level files', () => {
    const fileMap = new Map([
      ['sub-01/sub-01_events.tsv', {}],
      ['sub-02/sub-02_scans.json', {}],
    ])
    const accessor = new BidsFileAccessor(datasetRoot, fileMap)
    expect(accessor.fileMap.size).toBe(2)
    expect(accessor.organizedPaths.get('_events').get('tsv')).toEqual(['sub-01/sub-01_events.tsv'])
    expect(accessor.organizedPaths.get('_scans').get('json')).toEqual(['sub-02/sub-02_scans.json'])
    expect(accessor.organizedPaths.get('participants').get('tsv')).toEqual([])
  })

  it('should throw an error when calling the abstract create method', async () => {
    await expect(BidsFileAccessor.create('/my/dataset')).rejects.toThrow(
      "BidsFileAccessor.create for '/my/dataset' must be implemented by a subclass.",
    )
  })
})

describe('BidsDirectoryAccessor', () => {
  const datasetRoot = path.resolve(__dirname, '../bidsDemoData')

  describe('create', () => {
    it('should throw if datasetRootDirectory is not a string', async () => {
      await expect(BidsDirectoryAccessor.create(null)).rejects.toThrow(
        'BidsDirectoryAccessor.create requires a non-empty string for datasetRootDirectory.',
      )
    })

    it('should throw if datasetRootDirectory is an empty string', async () => {
      await expect(BidsDirectoryAccessor.create('')).rejects.toThrow(
        'BidsDirectoryAccessor.create requires a non-empty string for datasetRootDirectory.',
      )
    })

    it('should create an instance with a valid datasetRootDirectory and populate fileMap', async () => {
      const accessor = await BidsDirectoryAccessor.create(datasetRoot)
      expect(accessor).toBeInstanceOf(BidsFileAccessor)
      expect(accessor).toBeInstanceOf(BidsDirectoryAccessor)
      expect(accessor.fileMap.size).toBeGreaterThan(0)
      const expectedDescPath = path.join(datasetRoot, 'dataset_description.json')
      expect(accessor.fileMap.has('dataset_description.json')).toBe(true)
      expect(accessor.fileMap.get('dataset_description.json')).toBe(expectedDescPath)
    })

    it('should create an instance with an empty fileMap if datasetRootDirectory does not exist', async () => {
      const nonExistentPath = path.join(datasetRoot, 'nonExistentDirSpecialRandomSuffix123')
      const accessor = await BidsDirectoryAccessor.create(nonExistentPath)
      expect(accessor.fileMap.size).toBe(0)
    })
  })

  it('should have a filtered fileMap containing only candidate files', async () => {
    const accessor = await BidsDirectoryAccessor.create(datasetRoot)
    const fileMapKeys = Array.from(accessor.fileMap.keys())
    const expectedCandidates = [
      'dataset_description.json',
      'participants.json',
      'participants.tsv',
      'phenotype/KSSSleep.json',
      'phenotype/KSSSleep.tsv',
      'phenotype/trainLog.json',
      'phenotype/trainLog.tsv',
      'samples.json',
      'samples.tsv',
      'sub-002/ses-1/beh/sub-002_ses-1_task-FaceRecognition_beh.tsv',
      'sub-002/ses-1/eeg/sub-002_ses-1_task-FacePerception_run-1_events.tsv',
      'sub-002/sub-002_scans.json',
      'sub-002/sub-002_scans.tsv',
      'sub-002/sub-002_sessions.json',
      'sub-003/ses-1/eeg/sub-003_ses-1_task-FacePerception_run-1_events.tsv',
      'sub-003/sub-003_scans.json',
      'sub-003/sub-003_scans.tsv',
      'sub-004/ses-1/beh/sub-004_ses-1_task-FaceRecognition_beh.tsv',
      'sub-004/ses-1/eeg/sub-004_ses-1_task-FacePerception_run-1_events.tsv',
      'sub-004/ses-1/sub-004_ses-1_scans.json',
      'sub-004/ses-1/sub-004_ses-1_scans.tsv',
      'task-FacePerception_events.json',
      'task-FaceRecognition_beh.json',
    ]
    expect(fileMapKeys.sort()).toEqual(expectedCandidates.sort())
  })

  it('should have organizedPaths populated correctly', async () => {
    const accessor = await BidsDirectoryAccessor.create(datasetRoot)
    const organizedPaths = accessor.organizedPaths

    expect(organizedPaths.get('dataset_description').get('json')).toEqual(['dataset_description.json'])
    expect(organizedPaths.get('participants').get('json')).toEqual(['participants.json'])
    expect(organizedPaths.get('participants').get('tsv')).toEqual(['participants.tsv'])
    expect(organizedPaths.get('samples').get('json')).toEqual(['samples.json'])
    expect(organizedPaths.get('samples').get('tsv')).toEqual(['samples.tsv'])
    expect(organizedPaths.get('phenotype').get('tsv').sort()).toEqual(
      ['phenotype/KSSSleep.tsv', 'phenotype/trainLog.tsv'].sort(),
    )
    expect(organizedPaths.get('phenotype').get('json').sort()).toEqual(
      ['phenotype/KSSSleep.json', 'phenotype/trainLog.json'].sort(),
    )
    expect(organizedPaths.get('stimuli').get('tsv')).toEqual([])
    expect(organizedPaths.get('stimuli').get('json')).toEqual([])
    expect(organizedPaths.get('_events').get('json').sort()).toEqual(['task-FacePerception_events.json'].sort())
    expect(organizedPaths.get('_events').get('tsv').sort()).toEqual(
      [
        'sub-002/ses-1/eeg/sub-002_ses-1_task-FacePerception_run-1_events.tsv',
        'sub-003/ses-1/eeg/sub-003_ses-1_task-FacePerception_run-1_events.tsv',
        'sub-004/ses-1/eeg/sub-004_ses-1_task-FacePerception_run-1_events.tsv',
      ].sort(),
    )
    expect(organizedPaths.get('_beh').get('json').sort()).toEqual(['task-FaceRecognition_beh.json'].sort())
    expect(organizedPaths.get('_beh').get('tsv').sort()).toEqual(
      [
        'sub-002/ses-1/beh/sub-002_ses-1_task-FaceRecognition_beh.tsv',
        'sub-004/ses-1/beh/sub-004_ses-1_task-FaceRecognition_beh.tsv',
      ].sort(),
    )
    expect(organizedPaths.get('_scans').get('json').sort()).toEqual(
      ['sub-002/sub-002_scans.json', 'sub-003/sub-003_scans.json', 'sub-004/ses-1/sub-004_ses-1_scans.json'].sort(),
    )
    expect(organizedPaths.get('_scans').get('tsv').sort()).toEqual(
      ['sub-002/sub-002_scans.tsv', 'sub-003/sub-003_scans.tsv', 'sub-004/ses-1/sub-004_ses-1_scans.tsv'].sort(),
    )
  })

  describe('getFileContent', () => {
    let accessor
    beforeAll(async () => {
      accessor = await BidsDirectoryAccessor.create(datasetRoot)
    })

    it('should read file content for an existing file (dataset_description.json)', async () => {
      const content = await accessor.getFileContent('dataset_description.json')
      expect(content).toBeDefined()
      expect(typeof content).toBe('string')
      try {
        const parsedContent = JSON.parse(content)
        expect(parsedContent.Name).toBe('Face processing MEEG dataset with HED annotation')
      } catch {
        throw new Error('Failed to parse dataset_description.json or "Name" property not found/matching.')
      }
    })

    it('should return null if file is not in the map (non-existent file)', async () => {
      const content = await accessor.getFileContent('nonexistentfileABC.txt')
      expect(content).toBeNull()
    })

    it('should read file content from a subdirectory (events.tsv)', async () => {
      const filePath = 'sub-002/ses-1/eeg/sub-002_ses-1_task-FacePerception_run-1_events.tsv'
      const content = await accessor.getFileContent(filePath)
      expect(content).toBeDefined()
      expect(typeof content).toBe('string')
      expect(content.includes('onset\tduration\tevent_type')).toBe(true)
    })

    it('should return null for a path that is a directory', async () => {
      const content = await accessor.getFileContent('sub-002/ses-1/eeg') // This is a directory
      expect(content).toBeNull()
    })
  })

  describe('getAllFilePaths', () => {
    it('should recursively read directories and return relative paths', async () => {
      const accessor = await BidsDirectoryAccessor.create(datasetRoot)
      const paths = accessor.getAllFilePaths()
      const expectedPaths = [
        'dataset_description.json',
        'participants.json',
        'participants.tsv',
        'phenotype/KSSSleep.json',
        'phenotype/KSSSleep.tsv',
        'phenotype/trainLog.json',
        'phenotype/trainLog.tsv',
        'samples.json',
        'samples.tsv',
        'sub-002/ses-1/beh/sub-002_ses-1_task-FaceRecognition_beh.tsv',
        'sub-002/ses-1/eeg/sub-002_ses-1_task-FacePerception_run-1_events.tsv',
        'sub-002/sub-002_scans.json',
        'sub-002/sub-002_scans.tsv',
        'sub-002/sub-002_sessions.json',
        'sub-003/ses-1/eeg/sub-003_ses-1_task-FacePerception_run-1_events.tsv',
        'sub-003/sub-003_scans.json',
        'sub-003/sub-003_scans.tsv',
        'sub-004/ses-1/beh/sub-004_ses-1_task-FaceRecognition_beh.tsv',
        'sub-004/ses-1/eeg/sub-004_ses-1_task-FacePerception_run-1_events.tsv',
        'sub-004/ses-1/sub-004_ses-1_scans.json',
        'sub-004/ses-1/sub-004_ses-1_scans.tsv',
        'task-FacePerception_events.json',
        'task-FaceRecognition_beh.json',
      ]
      expect(paths.sort()).toEqual(expectedPaths.sort())
    })

    it('should return an empty array if the root directory is actually empty', async () => {
      const baseTestDir = path.dirname(datasetRoot)
      const emptyDir = path.join(baseTestDir, 'emptyTestDirForHedJsTestUnique')
      if (fs.existsSync(emptyDir)) {
        fs.rmSync(emptyDir, { recursive: true, force: true })
      }
      fs.mkdirSync(emptyDir, { recursive: true })
      try {
        const accessor = await BidsDirectoryAccessor.create(emptyDir)
        expect(accessor.getAllFilePaths()).toEqual([])
      } finally {
        if (fs.existsSync(emptyDir)) {
          fs.rmSync(emptyDir, { recursive: true, force: true })
        }
      }
    })

    it('should return an empty array if the datasetRootDirectory points to a file', async () => {
      const filePath = path.join(datasetRoot, 'dataset_description.json')
      const accessor = await BidsDirectoryAccessor.create(filePath)
      expect(accessor.getAllFilePaths()).toEqual([])
    })
  })
})

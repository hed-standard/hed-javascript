import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals'
import { generateIssue, IssueError } from '../src/issues/issues'

jest.mock('../src/bids/datasetParser')
jest.mock('../src/bids/schema')

// Re-require after jest.mock so we get the mocked versions
const datasetParser = require('../src/bids/datasetParser')
const schema = require('../src/bids/schema')

describe('BidsDataset', () => {
  const mockDatasetRoot = '/mock/dataset'
  const mockFileList = ['dataset_description.json']
  const mockJsonData = { HEDVersion: '8.3.0' }
  const mockBidsJsonFile = { jsonData: mockJsonData }
  const mockSchemas = { schemas: ['mockSchema'] }

  beforeEach(() => {
    datasetParser.parseBidsJsonFile.mockResolvedValue(mockBidsJsonFile)
    schema.buildBidsSchemas.mockResolvedValue(mockSchemas)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('loads HED schemas from dataset_description.json', async () => {
    const { BidsDataset } = require('../src/bids/types/dataset')
    const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
    await dataset.loadHedSchemas()
    expect(datasetParser.parseBidsJsonFile).toHaveBeenCalledWith(mockDatasetRoot, 'dataset_description.json')
    expect(schema.buildBidsSchemas).toHaveBeenCalledWith(mockBidsJsonFile)
    expect(dataset.hedSchemas).toBe(mockSchemas)
    expect(dataset.datasetDescription).toBe(mockBidsJsonFile)
  })

  it('throws if HEDVersion is missing', async () => {
    datasetParser.parseBidsJsonFile.mockResolvedValue({ jsonData: {} })
    const { BidsDataset } = require('../src/bids/types/dataset')
    const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
    const issue = generateIssue('missingSchemaSpecification', {})
    await expect(dataset.loadHedSchemas()).rejects.toThrow(IssueError)
    await expect(dataset.loadHedSchemas()).rejects.toThrow(issue.message)
  })

  it('throws if parseBidsJsonFile fails', async () => {
    const parseError = new Error('File read failed')
    datasetParser.parseBidsJsonFile.mockRejectedValue(parseError)
    const { BidsDataset } = require('../src/bids/types/dataset')
    const dataset = new BidsDataset(mockDatasetRoot, mockFileList)

    await expect(dataset.loadHedSchemas()).rejects.toMatchIssue('missingSchemaSpecification', {})

    const issue = generateIssue('missingSchemaSpecification', {})
    await expect(dataset.loadHedSchemas()).rejects.toThrow(IssueError)
    await expect(dataset.loadHedSchemas()).rejects.toThrow(issue.message)
  })

  it('throws if buildBidsSchemas fails', async () => {
    schema.buildBidsSchemas.mockRejectedValue(new Error('Schema build failed'))
    const { BidsDataset } = require('../src/bids/types/dataset')
    const dataset = new BidsDataset(mockDatasetRoot, mockFileList)

    await expect(dataset.loadHedSchemas()).rejects.toThrow('Schema build failed')
  })

  describe('hasHedData', () => {
    const { BidsDataset } = require('../src/bids/types/dataset')

    it('returns true if any sidecar or event file has HED data', () => {
      const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
      dataset.sidecarData = [
        { hasHedData: () => false },
        { hasHedData: () => true },
      ]
      dataset.eventData = [
        { hasHedData: () => false },
      ]
      expect(dataset.hasHedData).toBe(true)
    })

    it('returns true if any event file has HED data', () => {
      const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
      dataset.sidecarData = [
        { hasHedData: () => false },
      ]
      dataset.eventData = [
        { hasHedData: () => true },
        { hasHedData: () => false },
      ]
      expect(dataset.hasHedData).toBe(true)
    })

    it('returns false if no sidecar or event file has HED data', () => {
      const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
      dataset.sidecarData = [
        { hasHedData: () => false },
      ]
      dataset.eventData = [
        { hasHedData: () => false },
      ]
      expect(dataset.hasHedData).toBe(false)
    })
  })
})

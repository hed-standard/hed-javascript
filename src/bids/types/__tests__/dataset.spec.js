// src/bids/types/dataset.spec.js
import { jest, describe, it, beforeEach, afterEach } from '@jest/globals'

jest.mock('../../datasetParser')
jest.mock('../../schema')

// Re-require after jest.mock so we get the mocked versions
const datasetParser = require('../../datasetParser')
const schema = require('../../schema')

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
    const { BidsDataset } = require('../dataset')
    const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
    // Wait for async constructor logic
    await dataset.loadHedSchemas()
    expect(datasetParser.parseBidsJsonFile).toHaveBeenCalledWith(mockDatasetRoot, 'dataset_description.json')
    expect(schema.buildBidsSchemas).toHaveBeenCalledWith(mockBidsJsonFile)
    expect(dataset.hedSchemas).toBe(mockSchemas)
    expect(dataset.datasetDescription).toBe(mockBidsJsonFile)
  })

  it('throws if HEDVersion is missing', async () => {
    datasetParser.parseBidsJsonFile.mockResolvedValue({ jsonData: {} })
    const { BidsDataset } = require('../dataset')
    const dataset = new BidsDataset(mockDatasetRoot, mockFileList)
    await expect(dataset.loadHedSchemas()).rejects.toThrow('HEDVersion not found in dataset_description.json')
  })
})

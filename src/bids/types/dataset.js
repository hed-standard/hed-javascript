import { parseBidsJsonFile } from '../datasetParser'
import { buildBidsSchemas } from '../schema'
import { IssueError } from '../../issues/issues'

export class BidsDataset {
  /**
   * The dataset's event file data.
   * @type {BidsTsvFile[]}
   */
  eventData

  /**
   * The dataset's sidecar data.
   * @type {BidsSidecar[]}
   */
  sidecarData

  /**
   * The dataset's dataset_description.json file.
   * @type {BidsJsonFile}
   */
  datasetDescription

  /**
   * The dataset's root directory as an absolute path.
   * @type {string|null}
   */
  datasetRootDirectory

  /**
   * The HED schemas used to validate this dataset.
   * @type {Schemas}
   */
  hedSchemas

  /**
   *
   * @param datasetRootDirectory
   * @param fileList
   */
  constructor(datasetRootDirectory, fileList) {
    this.datasetRootDirectory = datasetRootDirectory
    this.eventData = null
    this.sidecarData = null
    this.hedSchemas = null
    this.fileList = fileList
  }

  get hasHedData() {
    return (
      this.sidecarData.some((sidecarFileData) => sidecarFileData.hasHedData()) ||
      this.eventData.some((tsvFileData) => tsvFileData.hasHedData())
    )
  }

  async loadHedSchemas() {
    // Use the general parser for dataset_description.json
    try {
      this.datasetDescription = await parseBidsJsonFile(this.datasetRootDirectory, 'dataset_description.json')
    } catch (error) {
      IssueError.generateAndThrow('missingSchemaSpecification')
    }
    if (!this.datasetDescription?.jsonData?.HEDVersion) {
      IssueError.generateAndThrow('missingSchemaSpecification')
    }
    // Build HED schemas using the datasetDescription object
    this.hedSchemas = await buildBidsSchemas(this.datasetDescription)
  }
}

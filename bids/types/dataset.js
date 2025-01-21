export class BidsDataset {
  /**
   * The dataset's event file data.
   * @type {BidsTsvFile[]}
   */
  eventData
  /**
   * The dataset's bidsFile data.
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

  constructor(eventData, sidecarData, datasetDescription, datasetRootDirectory = null) {
    this.eventData = eventData
    this.sidecarData = sidecarData
    this.datasetDescription = datasetDescription
    this.datasetRootDirectory = datasetRootDirectory
  }

  get hasHedData() {
    return (
      this.sidecarData.some((sidecarFileData) => sidecarFileData.hasHedData()) ||
      this.eventData.some((tsvFileData) => tsvFileData.hasHedData())
    )
  }
}

const fs = require('fs').promises
const path = require('path')
const { BidsJsonFile } = require('./types/json')



async function parseBidsJsonFile(datasetRoot, relativePath) {
  const filePath = path.join(datasetRoot, relativePath)
  try {
    await fs.access(filePath)
    const jsonData = JSON.parse(await fs.readFile(filePath, 'utf8'))
    return new BidsJsonFile(relativePath, { path: filePath }, jsonData)
  } catch (err) {
    // File does not exist or cannot be read/parsed
    return null
  }
}

module.exports = { parseBidsJsonFile }

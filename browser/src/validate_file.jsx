import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FileInput } from './components/FileInput'
import { ErrorDisplay } from './components/ErrorDisplay'
import {
  BidsHedIssue,
  BidsJsonFile,
  BidsSidecar,
  BidsTsvFile,
  buildBidsSchemas,
} from '@hed-javascript-root/src/bids/index.js'
import { generateIssue, IssueError } from '@hed-javascript-root/src/issues/issues.js'
import parseTSV from '@hed-javascript-root/src/bids/tsvParser.js'

// --- Main Application Component ---

function ValidateFileApp() {
  const [tsvFile, setTsvFile] = useState(null)
  const [jsonFile, setJsonFile] = useState(null)
  const [hedVersion, setHedVersion] = useState('8.4.0')
  const [errors, setErrors] = useState([])
  const [downloadableErrors, setDownloadableErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [checkWarnings, setCheckWarnings] = useState(false)
  const [limitErrors, setLimitErrors] = useState(false) // This state is not used by performHedValidation yet
  const [fileInputKey, setFileInputKey] = useState(Date.now())
  const [successMessage, setSuccessMessage] = useState('')
  const [validated, setValidated] = useState(false)

  function handleClear() {
    setTsvFile(null)
    setJsonFile(null)
    setHedVersion('8.4.0')
    setErrors([])
    setDownloadableErrors([])
    setSuccessMessage('')
    setValidated(false)
    setFileInputKey(Date.now())
    setCheckWarnings(false)
    setLimitErrors(false)
  }

  /**
   * Handles the validation process for the selected TSV and JSON files.
   *
   * This function performs the following steps:
   * 1. Sets the loading state and clears previous errors and success messages.
   * 2. Loads the specified HED schema version(s).
   * 3. Reads the content of the TSV and JSON files.
   * 4. Parses the JSON sidecar.
   * 5. Performs validation on the TSV data using the HED schemas and sidecar.
   * 6. Updates the state with any validation issues or a success message.
   * 7. Resets the loading state.
   */
  async function handleValidation() {
    setIsLoading(true)
    setErrors([])
    setDownloadableErrors([])
    setSuccessMessage('')
    setValidated(true)
    let issues = []
    let defaultPath = 'HED schema input'

    try {
      // Load HED Schemas
      let hedVersionValue = hedVersion.trim()
      if (hedVersionValue.includes(',')) {
        hedVersionValue = hedVersionValue
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      }

      const hedVersionSpec = new BidsJsonFile(
        'HED schema input',
        { path: 'HED schema version input' },
        { HEDVersion: hedVersionValue },
      )
      defaultPath = 'HED schema input'
      const hedSchemas = await buildBidsSchemas(hedVersionSpec)

      if (!hedSchemas) {
        throw BidsHedIssue.fromHedIssue(
          generateIssue('invalidSchemaSpecification', { spec: originalVersion }, { path: defaultPath }),
        )
      }
      defaultPath = jsonFile.name
      const jsonText = await jsonFile.text()
      const jsonData = JSON.parse(jsonText)
      const jsonFileObject = { name: jsonFile.name, path: jsonFile.name }
      const bidsSidecar = new BidsSidecar(jsonFile.name, jsonFileObject, jsonData)
      const sidecarIssues = bidsSidecar.validate(hedSchemas)
      const sidecarErrors = sidecarIssues.filter((issue) => issue.severity === 'error')

      if (sidecarErrors.length > 0) {
        issues = sidecarIssues
      } else {
        const tsvText = await tsvFile.text()
        const parsedTsv = parseTSV(tsvText)
        const tsvFileObject = { name: tsvFile.name, path: tsvFile.name, file: tsvFile }
        const bidsTsvFile = new BidsTsvFile(tsvFile.name, tsvFileObject, parsedTsv, jsonData, hedSchemas.definitions)
        issues = bidsTsvFile.validate(hedSchemas)
      }
    } catch (err) {
      issues = BidsHedIssue.transformToBids([err], { path: defaultPath })
    } finally {
      const issuesForDownload = BidsHedIssue.processIssues(issues, checkWarnings, false)
      setDownloadableErrors(issuesForDownload)
      const processedIssues = BidsHedIssue.processIssues(issues, checkWarnings, limitErrors)
      if (processedIssues.length > 0) {
        setErrors(processedIssues)
      } else {
        setSuccessMessage('No validation issues found.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10">
          <a
            href="./"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 block"
          >
            &larr; Back to Home
          </a>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Validate a file</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Validate HED in BIDS-style TSV file and corresponding JSON sidecar.
            <br />
            This tool is browser-based -- all data remains local.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
          {/* Container for the file inputs with increased vertical spacing */}
          <div className="flex flex-col items-center justify-center gap-8">
            <FileInput
              key={`tsv-${fileInputKey}`}
              id="tsv-upload"
              buttonText="TSV file"
              tooltip="Upload a BIDS tabular (.tsv) file"
              accept=".tsv"
              onFileSelect={setTsvFile}
              isLoading={isLoading}
            />
            <FileInput
              key={`json-${fileInputKey}`}
              id="json-upload"
              buttonText="JSON file"
              tooltip="Upload a JSON sidecar file corresponding to the tsv file"
              accept=".json"
              onFileSelect={setJsonFile}
              isLoading={isLoading}
            />
          </div>

          {/* HED Version Input */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center w-full max-w-md gap-4">
              <label htmlFor="hed-version" className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                HED schema version
              </label>
              <input
                id="hed-version"
                type="text"
                value={hedVersion}
                onChange={(e) => setHedVersion(e.target.value)}
                title="enter the version of the HED schema to use (separate multiple schema versions with commas)"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Checkboxes for validation options */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <div className="flex items-center">
              <input
                id="check-warnings"
                type="checkbox"
                checked={checkWarnings}
                onChange={(e) => setCheckWarnings(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="check-warnings" className="ml-2 text-gray-600 dark:text-gray-400">
                Check warnings
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="limit-errors"
                type="checkbox"
                checked={limitErrors}
                onChange={(e) => setLimitErrors(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="limit-errors" className="ml-2 text-gray-600 dark:text-gray-400">
                Limit errors
              </label>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleValidation}
              disabled={!tsvFile || !jsonFile || !hedVersion.trim() || isLoading}
              className="w-36 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 disabled:dark:bg-gray-600"
            >
              {isLoading ? 'Validating...' : 'Validate'}
            </button>
            <button
              onClick={handleClear}
              className="ml-4 w-36 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              Clear
            </button>
          </div>

          {validated && successMessage && (
            <div className="text-center mt-4">
              <p className="text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}
          {validated && errors.length > 0 && <ErrorDisplay errors={errors} downloadableErrors={downloadableErrors} />}
        </main>
      </div>
    </div>
  )
}

// --- Mount the App to the DOM ---

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <ValidateFileApp />
  </React.StrictMode>,
)

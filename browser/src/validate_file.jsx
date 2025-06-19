import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FileInput } from './components/FileInput'
import { ErrorDisplay } from './components/ErrorDisplay'
import { readFileAsText } from './utils/fileReader.js'
import { getHedSchemaCollection } from './utils/hedSchemaHelpers.js'
import { performTsvValidation } from './utils/validationUtils.js' // Removed performHedValidation

// --- Main Application Component ---

function ValidateFileApp() {
  const [tsvFile, setTsvFile] = useState(null)
  const [jsonFile, setJsonFile] = useState(null)
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [checkWarnings, setCheckWarnings] = useState(false)
  const [limitErrors, setLimitErrors] = useState(false) // This state is not used by performHedValidation yet

  async function handleValidation() {
    if (!tsvFile || !jsonFile) {
      setErrors([
        {
          code: 'CLIENT_ERROR',
          message: 'Please select both a TSV and a JSON file before validating.',
          location: 'File Input',
        },
      ])
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      // Load HED Schemas
      const hedVersionSpec = { HEDVersion: '8.4.0' } // Consider making this configurable or dynamic
      console.log('Attempting to load HED schemas for:', hedVersionSpec)
      const hedSchemas = await getHedSchemaCollection(hedVersionSpec)

      if (!hedSchemas) {
        console.error('Failed to load HED Schemas. Validation might be incomplete or inaccurate.')
        setErrors((prevErrors) => [
          ...prevErrors,
          {
            code: 'SCHEMA_LOAD_ERROR',
            message: `Failed to load HED schemas for HEDVersion: ${JSON.stringify(hedVersionSpec.HEDVersion)}. Validation may not be accurate.`,
            location: 'Schema Loading',
          },
        ])
        setIsLoading(false) // Added to reset loading state before early return
        return
      }

      const [tsvText, jsonText] = await Promise.all([readFileAsText(tsvFile), readFileAsText(jsonFile)])
      const jsonData = JSON.parse(jsonText)

      // Moved this block inside the try block
      const validationOptions = { checkWarnings }
      const issues = performTsvValidation(tsvFile.name, tsvFile.name, tsvText, hedSchemas, jsonData, validationOptions) // Pass validationOptions
      setErrors(issues)
      setIsLoading(false) // Moved here from outside, for the successful path
    } catch (err) {
      let errorMsg = 'Error reading or processing a file.'
      if (err && err.message) {
        errorMsg += `\nDetails: ${err.message}`
      }
      setErrors([{ code: 'FILE_READ_ERROR', message: errorMsg, location: 'File Input' }])
      setIsLoading(false)
      // return // Removed unnecessary return
    }
  } // Corrected from ')' to '}'

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
            Upload a BIDS-style TSV file and its corresponding JSON sidecar to check HED.
            <br />
            This tool is browser-based -- all data remains local.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
          {/* Container for the file inputs with increased vertical spacing */}
          <div className="flex flex-col items-center justify-center gap-8">
            <FileInput
              id="tsv-upload"
              buttonText="TSV file"
              tooltip="Upload a BIDS tabular (.tsv) file"
              accept=".tsv"
              onFileSelect={setTsvFile}
              isLoading={isLoading}
            />
            <FileInput
              id="json-upload"
              buttonText="JSON file"
              tooltip="Upload a JSON sidecar file corresponding to the tsv file"
              accept=".json"
              onFileSelect={setJsonFile}
              isLoading={isLoading}
            />
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
              <label htmlFor="check-warnings" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
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
              <label htmlFor="limit-errors" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Limit errors
              </label>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleValidation}
              disabled={!tsvFile || !jsonFile || isLoading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 disabled:dark:bg-gray-600"
            >
              {isLoading ? 'Validating...' : 'Validate'}
            </button>
          </div>

          <ErrorDisplay errors={errors} />
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

import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FolderInput } from './components/FolderInput'
import { ErrorDisplay } from './components/ErrorDisplay'
import { BrowserDatasetFactory } from './bids/BrowserDatasetFactory.js' // Import the new factory

// --- Add TailwindCSS to the document head for immediate styling ---
;(() => {
  if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com'
    document.head.appendChild(script)
  }
})()

const SUFFIXES = ['dataset_description', 'participants', 'samples', 'scans', 'sessions', 'events', 'beh']
const SPECIAL_DIRECTORIES = ['phenotype', 'stimuli']
/**
 * --- Main Application Component ---
 */

function ValidateDatasetApp() {
  const [files, setFiles] = useState([]) // These are the raw File objects from upload
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [checkWarnings, setCheckWarnings] = useState(false)

  const handleFolderSelect = (selectedFiles) => {
    setFiles(selectedFiles)
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleValidation = async () => {
    if (!files.length) {
      setErrors([
        {
          code: 'CLIENT_ERROR',
          message: 'Please select a BIDS dataset folder before validating.',
          location: 'Folder Input',
        },
      ])
      return
    }
    setIsLoading(true)
    setErrors([])
    let aggregatedIssues = []

    try {
      // Use the factory to create and initialize the BidsDataset
      const dataset = await BrowserDatasetFactory.create(files)

      // Schema loading is now part of dataset creation/initialization by the factory
      // and BidsDataset.loadHedSchemas() which is called by the factory.
      // If dataset.hedSchemas is null, it means loading failed.
      // The factory or BidsDataset.loadHedSchemas would have thrown or logged.
      // We can check dataset.hedSchemas or rely on issues pushed by BidsDataset itself.

      if (!dataset.hedSchemas) {
        // This check might be redundant if BrowserDatasetFactory.create or dataset.loadHedSchemas already threw.
        // Or, if they don't throw but populate an internal issues list on the dataset object.
        // For now, let's assume if hedSchemas is null, an error was already pushed or will be part of validation.
        // We can add a specific error here if factory doesn't throw for this.
        aggregatedIssues.push({
          code: 'SCHEMA_LOAD_FAILED_POST_FACTORY', // More specific error code
          message: 'HED schemas could not be loaded for the dataset. Validation cannot proceed effectively.',
          location: 'Dataset Initialization',
        })
      }

      // TODO: Implement dataset.validate() method which would perform all necessary validations
      // and return an array of issues.
      // For now, we'll manually assemble some info.
      // Example: if (dataset._initializationIssues) {
      //   aggregatedIssues.push(...dataset._initializationIssues);
      // }

      // Placeholder for actual validation call on dataset object
      // const validationIssues = await dataset.validate({ checkWarnings });
      // aggregatedIssues.push(...validationIssues);

      // Temporary: Report on what was loaded
      if (aggregatedIssues.length === 0) {
        if (dataset.datasetDescription) {
          aggregatedIssues.push({
            code: 'INFO',
            message: `Dataset description loaded. Name: ${dataset.datasetDescription.jsonData?.Name || 'N/A'}. HEDVersion: ${dataset.datasetDescription.jsonData?.HEDVersion || 'N/A'}`,
            location: 'Dataset Info',
          })
        }
        if (dataset.hedSchemas) {
          aggregatedIssues.push({
            code: 'INFO',
            message: 'HED schemas loaded successfully.',
            location: 'Schema Loading',
          })
        }
        aggregatedIssues.push({
          code: 'INFO',
          message: `Found ${dataset.sidecarData.length} sidecars and ${dataset.eventData.length} event files.`,
          location: 'File Discovery',
        })
      }

      // Consolidate final error/info messages
      const finalDisplayIssues = []
      const uniqueMessages = new Set()
      aggregatedIssues.forEach((issue) => {
        const messageKey = `${issue.code}-${issue.message}-${issue.location}`
        if (!uniqueMessages.has(messageKey)) {
          finalDisplayIssues.push(issue)
          uniqueMessages.add(messageKey)
        }
      })
      setErrors(finalDisplayIssues)
    } catch (err) {
      console.error('[ValidateDatasetApp] Error during dataset processing or validation:', err)
      // Ensure aggregatedIssues from try block are preserved if error happens later
      const finalIssues = [...aggregatedIssues]
      finalIssues.push({
        code: err.code || 'FACTORY_CREATE_ERROR', // Generalize error code
        message: err.message || 'An unexpected error occurred during dataset processing.',
        location: 'Dataset Factory/Validation',
      })

      const uniqueErrorMessages = new Set()
      const deduplicatedFinalIssues = finalIssues.filter((issue) => {
        const messageKey = `${issue.code}-${issue.message}-${issue.location}`
        if (!uniqueErrorMessages.has(messageKey)) {
          uniqueErrorMessages.add(messageKey)
          return true
        }
        return false
      })
      setErrors(deduplicatedFinalIssues)
    } finally {
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Validate a dataset</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload a BIDS dataset folder to check for HED errors.
            <br />
            This tool is browser-based -- all data remains local.
          </p>
        </header>
        <main className="bg-white dark:bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
          <div className="flex flex-col items-center justify-center gap-8">
            <FolderInput
              id="folder-upload"
              buttonText="Dataset root"
              tooltip="Choose a BIDS dataset root directory"
              onFolderSelect={handleFolderSelect}
              isLoading={isLoading}
            />
            {files.length > 0 && (
              <div className="mt-4 w-full px-4 sm:px-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Selected Files:</h3>
                <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md max-h-60 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
                  {files.map((file, index) => (
                    <li key={index} title={file.webkitRelativePath || file.name}>
                      {file.name} ({file.webkitRelativePath || 'N/A'})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <div className="flex items-center">
              <input
                id="check-warnings-dataset"
                type="checkbox"
                checked={checkWarnings}
                onChange={(e) => setCheckWarnings(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="check-warnings-dataset"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Check warnings
              </label>
            </div>
            {/* Placeholder for limitErrors if needed */}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleValidation}
              disabled={!files.length || isLoading}
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

const rootElement = document.getElementById('root')
if (!rootElement) {
  const newRoot = document.createElement('div')
  newRoot.id = 'root'
  document.body.appendChild(newRoot)
}

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ValidateDatasetApp />
  </React.StrictMode>,
)

import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FolderInput } from './components/FolderInput'
import { ErrorDisplay } from './components/ErrorDisplay'
import { BidsWebAccessor } from './bids/BidsWebAccessor.js'
import { BidsDataset } from '@hed-javascript-root/src/bids/types/dataset.js'
import { IssueError } from '@hed-javascript-root/src/issues/issues.js'

// --- Add TailwindCSS to the document head for immediate styling ---
;(() => {
  if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com'
    document.head.appendChild(script)
  }
})()

/**
 * --- Main Application Component ---
 */
function ValidateDatasetApp() {
  const [dataset, setDataset] = useState(null)
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleFolderSelect = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return
    }
    const numFiles = selectedFiles.length
    setIsLoading(true)
    setErrors([])
    setDataset(null)
    setSuccessMessage('')

    try {
      const accessor = await BidsWebAccessor.create(selectedFiles)
      const dataset = new BidsDataset(accessor)

      await dataset.setHedSchemas()
      await dataset.setSidecars()

      const issues = dataset.issues
      if (issues && issues.length > 0) {
        setErrors(issues)
      } else {
        setDataset(dataset)
        setSuccessMessage(`${numFiles} files found. Ready for validation.`)
      }
    } catch (err) {
      console.error('[ValidateDatasetApp] Error during dataset processing:', err)
      const newErrors = []
      if (err instanceof IssueError) {
        newErrors.push(err.issue)
      } else {
        newErrors.push({
          code: err.code || 'DATASET_LOAD_ERROR',
          message: err.message || 'An unexpected error occurred during dataset processing.',
          location: 'Dataset Loading',
        })
      }
      setErrors(newErrors)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!dataset) {
      return
    }
    setIsLoading(true)
    setErrors([])
    setSuccessMessage('')
    try {
      const issues = await dataset.validate()
      if (issues && issues.length > 0) {
        setErrors(issues)
      } else {
        setSuccessMessage('No validation errors found.')
      }
    } catch (err) {
      console.error('[ValidateDatasetApp] Error during validation:', err)
      const newErrors = []
      if (err instanceof IssueError) {
        newErrors.push(err.issue)
      } else {
        newErrors.push({
          code: err.code || 'VALIDATION_ERROR',
          message: err.message || 'An unexpected error occurred during validation.',
          location: 'Dataset Validation',
        })
      }
      setErrors(newErrors)
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
            <button
              onClick={handleValidate}
              disabled={!dataset || isLoading}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Validating...' : 'Validate'}
            </button>
          </div>
          {successMessage && (
            <div className="text-center mt-4">
              <p className="text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}
          {errors.length > 0 && <ErrorDisplay errors={errors} />}
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

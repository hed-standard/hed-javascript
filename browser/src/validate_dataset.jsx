import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FolderInput } from './components/FolderInput'
import { ErrorDisplay } from './components/ErrorDisplay'

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
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFolderSelect = (selectedFiles) => {
    setFiles(selectedFiles)
    if (errors.length > 0) {
      setErrors([])
    }
  }

  // Mock validation function - replace with your actual validation logic
  const handleValidation = () => {
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

    // Simulate an API call or a web worker for validation
    setTimeout(() => {
      // --- MOCK ERROR DATA ---
      const mockErrors = [
        {
          code: 'HED_DATASET_MISSING_FILE',
          message: "The 'events.tsv' file is missing in one or more folders.",
          location: 'events.tsv',
        },
        {
          code: 'HED_TAG_WARNING_INVALID_CHARACTERS',
          message: 'A JSON sidecar is invalid or missing.',
          location: 'sub-01_task-rest_events.json',
        },
      ]
      setErrors(mockErrors)
      setIsLoading(false)
    }, 1500) // Simulate network delay
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

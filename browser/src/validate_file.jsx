import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FileInput } from './components/FileInput'
import { ErrorDisplay } from './components/ErrorDisplay'

// --- Main Application Component ---

function ValidateFileApp() {
  const [tsvFile, setTsvFile] = useState(null)
  const [jsonFile, setJsonFile] = useState(null)
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock validation function - replace with your actual validation logic
  const handleValidation = () => {
    if (!tsvFile || !jsonFile) {
      // Replaced alert with a more user-friendly error mechanism
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

    // Simulate an API call or a web worker for validation
    setTimeout(() => {
      // --- MOCK ERROR DATA ---
      // Replace this with the actual response from your validator
      const mockErrors = [
        {
          code: 'HED_TSV_UNMATCHED_COLUMN',
          message: "The 'event_type' column was not found in the HED schema.",
          location: "Column: 'event_type'",
        },
        {
          code: 'HED_VALUE_INVALID',
          message: "The value 'N/A' is not a valid value for the 'response_time' tag.",
          location: 'Line: 12',
        },
        {
          code: 'HED_TAG_WARNING_INVALID_CHARACTERS',
          message: "The tag 'Stimulus/Image Circle' contains a space. It should be 'Stimulus/Image_Circle'.",
          location: 'Line: 28',
        },
      ]
      setErrors(mockErrors)
      // -----------------------

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

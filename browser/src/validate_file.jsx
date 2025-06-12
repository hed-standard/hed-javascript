import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

// --- Helper & Reusable Components ---

// A reusable file input component
const FileInput = ({ id, label, accept, onFileSelect }) => {
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0]
      setFileName(file.name)
      onFileSelect(file)
    } else {
      setFileName('')
      onFileSelect(null)
    }
  }

  const hasFile = !!fileName

  return (
    <div>
      {/* Title is now larger and bold */}
      <label className="block text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{label}</label>

      {/* Layout is now horizontal for the button and file name */}
      <div className="flex items-center">
        {/* Button changes color from gray to blue based on file selection */}
        <label
          htmlFor={id}
          className={`
            cursor-pointer inline-block text-center text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-300 flex-shrink-0
            ${
              hasFile
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500'
            }
          `}
        >
          Choose File
        </label>
        <input type="file" id={id} accept={accept} className="hidden" onChange={handleFileChange} />

        {/* Filename now appears alongside the button */}
        <p className="ml-4 text-gray-600 dark:text-gray-400 truncate">{fileName || 'No file selected'}</p>
      </div>
    </div>
  )
}

// Component to display validation errors
const ErrorDisplay = ({ errors }) => {
  if (errors.length === 0) {
    return null
  }

  const getSeverityClass = (code) => {
    // Example logic to color-code errors, can be expanded
    if (code.includes('WARNING')) return 'border-yellow-500'
    return 'border-red-500'
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Validation Issues Found</h3>
      <div className="space-y-4">
        {errors.map((error, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-l-4 ${getSeverityClass(error.code)}`}
          >
            <p className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">{error.code}</p>
            <p className="mt-1 text-gray-800 dark:text-gray-200">{error.message}</p>
            {error.location && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{error.location}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main Application Component ---

function ValidateFileApp() {
  const [tsvFile, setTsvFile] = useState(null)
  const [jsonFile, setJsonFile] = useState(null)
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // The import.meta.env.BASE_URL has been removed to resolve the build warning.
  // The link back to home will use a simple relative path.

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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Validate a File</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload a BIDS-style TSV file and its corresponding JSON sidecar to check for HED compliance.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
          {/* The grid layout has been changed to a single column for a vertical layout */}
          <div className="grid grid-cols-1 gap-8">
            <FileInput id="tsv-upload" label="Upload TSV File" accept=".tsv" onFileSelect={setTsvFile} />
            <FileInput id="json-upload" label="Upload JSON Sidecar" accept=".json" onFileSelect={setJsonFile} />
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

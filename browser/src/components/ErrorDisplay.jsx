import React from 'react'

// Component to display validation errors
export const ErrorDisplay = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-lg text-green-600 dark:text-green-400">No validation issues found.</p>
      </div>
    )
  }

  const getSeverityClass = (severity) => {
    if (severity === 'warning') return 'border-yellow-500'
    return 'border-red-500' // Default to error
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Validation Issues Found</h3>
      <div className="space-y-4">
        {errors.map((error, index) => {
          let locationString = ''
          if (error.location) {
            locationString += `Location: ${error.location}`
          }
          const lineNumber = error.line || error.hedIssue?.parameters?.tsvLine
          if (lineNumber) {
            if (locationString) {
              locationString += ', '
            }
            locationString += `Line: ${lineNumber}`
          }
          if (error.hedIssue?.parameters?.sidecarKey) {
            if (locationString) {
              locationString += ', '
            }
            locationString += `Sidecar column: ${error.hedIssue.parameters.sidecarKey}`
          }
          return (
            <div
              key={index}
              className={`p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-l-4 ${getSeverityClass(error.severity)}`}
            >
              <p className="text-base text-gray-800 dark:text-gray-200">{error.issueMessage}</p>
              {locationString && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{locationString}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

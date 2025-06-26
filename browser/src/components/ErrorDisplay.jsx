import React from 'react'

// Component to display validation errors
export const ErrorDisplay = ({ errors, downloadableErrors }) => {
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

  const handleDownload = () => {
    const errorsToDownload = downloadableErrors || errors
    const data = JSON.stringify(errorsToDownload, null, 2)
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hed_validation_issues.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Validation Issues Found</h3>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          Download Errors
        </button>
      </div>
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

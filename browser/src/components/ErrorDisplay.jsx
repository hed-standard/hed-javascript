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
    // Updated to use BidsHedIssue's severity property
    if (severity === 'warning') return 'border-yellow-500'
    return 'border-red-500' // Default to error
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Validation Issues Found</h3>
      <div className="space-y-4">
        {errors.map((error, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-l-4 ${getSeverityClass(error.severity)}`}
          >
            <p className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">HED ERROR: {error.subCode}</p>
            <p className="mt-1 text-gray-800 dark:text-gray-200">{error.issueMessage}</p>
            {error.line && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Line: {error.line}</p>}
            {error.location && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">File: {error.location}</p>}
            {/* Displaying hedIssue properties if needed, for example:
            {error.hedIssue && error.hedIssue.message && <p className="mt-1 text-sm text-blue-500">Details: {error.hedIssue.message}</p>}
            */}
          </div>
        ))}
      </div>
    </div>
  )
}

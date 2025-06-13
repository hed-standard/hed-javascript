import React from 'react'

// Component to display validation errors
export const ErrorDisplay = ({ errors }) => {
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

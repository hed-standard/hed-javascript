import React, { useState } from 'react'

// A reusable file input component with updated layout and styling
export const FileInput = ({ id, buttonText, tooltip, accept, onFileSelect, isLoading }) => {
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

  // Determine button color
  let buttonClass = ''
  if (isLoading || hasFile) {
    buttonClass = 'bg-gray-400 dark:bg-gray-600'
  } else {
    buttonClass = 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    // Flex container for the entire row to align items horizontally
    <div className="flex w-full max-w-lg items-center gap-4">
      {/* 1. The button with text, tooltip, fixed width, and new color logic */}
      <label
        htmlFor={id}
        title={tooltip}
        className={`
          cursor-pointer text-center text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300
          w-32 flex-shrink-0
          ${buttonClass}
        `}
      >
        {buttonText}
      </label>
      <input type="file" id={id} accept={accept} className="hidden" onChange={handleFileChange} disabled={isLoading} />

      {/* 2. The filename message, now with a title attribute for the tooltip */}
      <p className="flex-grow text-gray-600 dark:text-gray-400 truncate" title={fileName || 'No file selected'}>
        {fileName || 'No file selected'}
      </p>
    </div>
  )
}

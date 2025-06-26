import React, { useState } from 'react'

export const FolderInput = ({ id, buttonText, tooltip, onFolderSelect, isLoading }) => {
  const [folderName, setFolderName] = useState('')

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // Try to get the root folder name from the first file's webkitRelativePath
      const firstPath = files[0].webkitRelativePath || files[0].name
      const rootFolder = firstPath.split('/')[0]
      setFolderName(rootFolder)
      onFolderSelect(files)
    } else {
      setFolderName('')
      onFolderSelect([])
    }
  }

  const hasFolder = !!folderName
  let buttonClass = ''
  if (isLoading || hasFolder) {
    buttonClass = 'bg-gray-400 dark:bg-gray-600'
  } else {
    buttonClass = 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="flex w-full max-w-lg items-center gap-4">
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
      <input
        type="file"
        id={id}
        className="hidden"
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory=""
        multiple
        disabled={isLoading}
      />
      <p className="flex-grow text-gray-600 dark:text-gray-400 truncate" title={folderName || 'No folder selected'}>
        {folderName || 'No folder selected'}
      </p>
    </div>
  )
}

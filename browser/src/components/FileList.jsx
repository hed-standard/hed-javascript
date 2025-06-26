import React from 'react'

export const FileList = ({ files }) => (
  <ul className="file-list">
    {files.map((file, i) => (
      <li key={i}>{file.webkitRelativePath || file.name}</li>
    ))}
  </ul>
)

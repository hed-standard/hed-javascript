import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'

function FileList({ files }) {
  return (
    <ul className="file-list">
      {files.map((file, i) => (
        <li key={i}>{file.webkitRelativePath || file.name}</li>
      ))}
    </ul>
  )
}

function ValidateApp() {
  const [files, setFiles] = useState([])

  const handleFileChange = (event) => {
    const fileArray = Array.from(event.target.files)
    console.log(`Number of files selected: ${fileArray.length}`)
    setFiles(fileArray)
    // TODO: Add HED validation here
  }

  return (
    <div>
      <h2>Upload your BIDS dataset</h2>
      <input type="file" webkitdirectory="true" directory="" multiple onChange={handleFileChange} />
      {files.length > 0 && <FileList files={files} />}
    </div>
  )
}

const root = document.getElementById('root')
createRoot(root).render(<ValidateApp />)

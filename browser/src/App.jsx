// src/App.jsx
import React, { useState } from 'react';

function FileList({ files }) {
  return (
    <ul>
      {files.map((file, i) => (
        <li key={i}>{file.webkitRelativePath || file.name}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const fileArray = Array.from(event.target.files);
    console.log(`Number of files selected: ${fileArray.length}`);
    setFiles(fileArray);
  };

  return (
    <div style={{ padding: '2em', fontFamily: 'Arial' }}>
      <h1>HED Validator</h1>
      <p>Select a BIDS dataset folder to begin validation:</p>
      <input type="file" webkitdirectory="true" multiple onChange={handleFileChange} />
      {files.length > 0 && <FileList files={files} />}
    </div>
  );
}
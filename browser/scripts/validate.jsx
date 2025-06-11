import React from 'react';
import { createRoot } from 'react-dom/client';

function ValidateApp() {
  return (
    <div>
      <h2>Upload your HED dataset</h2>
      <input type="file" webkitdirectory="" directory="" multiple />
    </div>
  );
}

const root = document.getElementById('root');
createRoot(root).render(<ValidateApp />);

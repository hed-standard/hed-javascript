import React from 'react';
import { createRoot } from 'react-dom/client';

function ContrastApp() {
  return (
    <div>
      <h2>Contrast datasets here</h2>
      <p>Coming soon...</p>
    </div>
  );
}

const root = document.getElementById('root');
createRoot(root).render(<ContrastApp />);
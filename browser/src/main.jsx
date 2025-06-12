import React from 'react'
import { createRoot } from 'react-dom/client'
// The import below is commented out as it's no longer necessary.
// We are now loading styles via the Tailwind CDN script in index.html,
// which caused a "could not resolve" error during the build process.
// import './styles/styles.css';

// --- Reusable Components ---

// A single navigation card component for a clean and reusable structure
const NavCard = ({ href, icon, title, description }) => {
  return (
    <a
      href={href}
      className="group block rounded-xl bg-white dark:bg-gray-800 p-6 md:p-8 shadow-md hover:shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 transform hover:-translate-y-2 transition-all duration-300 ease-in-out"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg mb-4 transition-colors duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </a>
  )
}

// --- Main Application Component ---

function App() {
  const navOptions = [
    {
      href: './validate.html',
      icon: <img src="/favicon.ico" alt="HED Icon" className="h-6 w-6" />,
      title: 'Validate',
      description: 'Check your HED dataset for compliance and errors.',
    },
    {
      href: './contrast.html',
      icon: <img src="/favicon.ico" alt="HED Icon" className="h-6 w-6" />,
      title: 'Contrast',
      description: 'Compare two HED datasets to identify differences.',
    },
    {
      href: './docs/html/',
      icon: <img src="/favicon.ico" alt="HED Icon" className="h-6 w-6" />,
      title: 'API Docs',
      description: 'Browse the technical documentation for developers.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Welcome to the HED Validator
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          A suite of tools to ensure your Hierarchical Event Descriptors are accurate and well-formed.
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {navOptions.map((option) => (
            <NavCard
              key={option.title}
              href={option.href}
              icon={option.icon}
              title={option.title}
              description={option.description}
            />
          ))}
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} HED Working Group. All rights reserved.</p>
      </footer>
    </div>
  )
}

// --- Mount the App to the DOM ---

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

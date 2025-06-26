import React from 'react'
import { createRoot } from 'react-dom/client'
import { NavOptions } from './components/NavOptions'

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
  const base_url = import.meta.env.BASE_URL

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Welcome to the HED JavaScript Validator
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          A suite of tools to validate HED (Hierarchical Event Descriptor) tags.
          <br />
          These tools are browser-based -- all data remains local.
        </p>
      </header>

      <main>
        <NavOptions base_url={base_url} />
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

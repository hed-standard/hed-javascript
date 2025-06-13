import React from 'react'

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

export const NavOptions = ({ base_url }) => {
  const navOptions = [
    {
      href: './validate_dataset.html',
      icon: <img src={`${base_url}favicon.ico`} alt="HED Icon" className="h-6 w-6" />,
      title: 'Validate dataset',
      description: 'Check your BIDS dataset for HED errors.',
    },
    {
      href: './validate_file.html',
      icon: <img src={`${base_url}favicon.ico`} alt="HED Icon" className="h-6 w-6" />,
      title: 'Validate file',
      description: 'Check a BIDS-style tsv file for HED errors.',
    },
    {
      href: './docs/html/',
      icon: <img src={`${base_url}favicon.ico`} alt="HED Icon" className="h-6 w-6" />,
      title: 'API Docs',
      description: 'Browse the technical documentation for developers.',
    },
  ]

  return (
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
  )
}

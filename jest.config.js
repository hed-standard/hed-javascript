module.exports = {
  rootDir: '.',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/types/', '<rootDir>/types/'],
  testMatch: ['**/tests/**/*.spec.js', '**/browser/**/*.spec.js', '**/spec_tests/**/*.spec.js'],
  transform: {
    '\\.js$': 'esbuild-runner/jest',
    '\\.xml$': '<rootDir>/fileTransformer.js',
  },
  transformIgnorePatterns: ['node_modules/(?!unicode-name)'],
  coveragePathIgnorePatterns: ['/node_modules/', '/browser/', '/tests/', '/spec_tests/'],
}

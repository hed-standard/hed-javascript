module.exports = {
  rootDir: '.',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  transform: {
    '\\.js$': 'esbuild-runner/jest',
    '\\.xml$': '<rootDir>/fileTransformer.js',
  },
  transformIgnorePatterns: ['node_modules/(?!unicode-name)'],
  testMatch: [
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/browser/src/**/*.spec.js',
    '<rootDir>/spec_tests/**/*.spec.js',
  ],
}

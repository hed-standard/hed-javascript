module.exports = {
  rootDir: '.',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.js$': 'esbuild-runner/jest',
    '\\.xml$': '<rootDir>/fileTransformer.js',
  },
  transformIgnorePatterns: ['node_modules/(?!unicode-name)'],
}

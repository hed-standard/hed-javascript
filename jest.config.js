module.exports = {
  rootDir: '.',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  transform: {
    '\\.js$': 'esbuild-runner/jest',
    '\\.xml$': '<rootDir>/fileTransformer.js',
  },
  transformIgnorePatterns: ['node_modules/(?!unicode-name)'],
  coveragePathIgnorePatterns: ['/node_modules/', '/browser/', '/tests/', '/spec_tests/'],
}

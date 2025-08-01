module.exports = {
  rootDir: '.',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/types/', '<rootDir>/types/'],
  testMatch: [
    '**/tests/**/*.spec.js',
    '**/tests/**/*.test.js',
    '**/browser/**/*.spec.js',
    '**/spec_tests/**/*.spec.js',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '\\.xml$': '<rootDir>/fileTransformer.cjs',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(unicode-name)/)',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/browser/', '/tests/', '/spec_tests/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

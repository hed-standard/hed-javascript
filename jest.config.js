module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.xml$': '<rootDir>/xml-transformer.js',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!unicode-name|semver)'],
  testPathIgnorePatterns: ['node_modules/', '<rootDir>/types/test.ts', '<rootDir>/browser/'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.spec.js',
    '!src/**/*.test.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageProvider: 'v8',
}

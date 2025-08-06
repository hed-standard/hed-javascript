module.exports = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  transform: {
    '\\.xml$': '<rootDir>/xml-transformer.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!unicode-name|date-and-time|semver)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'types/test.ts',
    '<rootDir>/browser/',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};

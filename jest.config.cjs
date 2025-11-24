module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },

  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/main.tsx",
    "!src/index.tsx"
  ],
  coverageReporters: ["text", "lcov"]
};

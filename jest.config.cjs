module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },

  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

 moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/test/__mocks__/fileMock.js",
    "\\.(css|less|scss)$": "<rootDir>/src/test/__mocks__/styleMock.js"
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/main.tsx",
    "!src/index.tsx"
  ],
  coverageReporters: ["text", "lcov"]
};




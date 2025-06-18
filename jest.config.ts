export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
      '**/?(*.)+(spec|test).ts',
      '**/tests/**/*.(test|spec).(ts|tsx)',
    ],
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node'
        }
      }],
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
      'text',
      'lcov',
      'html'
    ],
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    
    transformIgnorePatterns: [
      'node_modules/(?!(@nillion|@noble))'
    ],
    extensionsToTreatAsEsm: ['.ts']
  }; 
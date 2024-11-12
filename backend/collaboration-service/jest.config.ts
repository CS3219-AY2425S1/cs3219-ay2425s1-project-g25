export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        '**/*.ts',
        '!**/*.d.ts',
        '!**/__tests__/**',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
};
/* eslint-env node */
module.exports = {
    roots: ['./src'],
    modulePathIgnorePatterns: ['.util.test.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.json'
            }
        ]
    }
}

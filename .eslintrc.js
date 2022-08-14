module.exports = {
    env: {
        browser: true,
        commonjs: true,
        node: true,
        es2021: true,
    },
    extends: [
        // 'airbnb-base',
        'eslint:recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'no-console': 0,
        'no-unused-vars': [
            'error',
            { caughtErrorsIgnorePattern: '^ignore', caughtErrors: 'none' },
        ],
    },
}

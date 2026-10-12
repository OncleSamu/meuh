import js from '@eslint/js';
import globals from 'globals';

// Les règles du jeu (core, data, systems, art) n'ont pas accès au navigateur :
// seule l'interface (ui, main) voit document, window…
const shared = ['TextEncoder', 'TextDecoder', 'btoa', 'atob', 'Blob', 'Response', 'CompressionStream', 'DecompressionStream', 'console', 'Intl'];

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: Object.fromEntries(shared.map(g => [g, 'readonly'])),
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipComments: true }],
            eqeqeq: ['error', 'smart'],
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    { files: ['src/ui/**', 'src/main.js', 'src/pwa/**'], languageOptions: { globals: { ...globals.browser } } },
    { files: ['tools/**', 'eslint.config.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
    { ignores: ['node_modules/', 'index.html', 'sw.js', '.tmp/', 'dist/'] },
];

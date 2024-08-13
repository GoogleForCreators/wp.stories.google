import typescriptEslint from '@typescript-eslint/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import mocha from 'eslint-plugin-mocha';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/node_modules',
      '**/package.json',
      '**/package-lock.json',
      'packages/functions/lib',
      '**/public',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:prettier/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      jsdoc,
      mocha,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
    },

    settings: {
      jsdoc: {
        mode: 'typescript',

        preferredTypes: {
          object: 'Object',
        },

        tagNamePreference: {
          returns: 'return',
          yields: 'yield',
        },
      },
    },

    rules: {
      'block-scoped-var': 'error',

      complexity: [
        'error',
        {
          max: 20,
        },
      ],

      'consistent-return': 'error',
      curly: ['error', 'all'],
      'default-case': 'error',
      'guard-for-in': 'error',
      'no-await-in-loop': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-floating-decimal': 'error',
      'no-implicit-coercion': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-loop-func': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-restricted-properties': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-sequences': 'error',
      'no-shadow': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',

      'no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],

      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'prefer-object-spread': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      radix: ['error', 'as-needed'],
      'require-await': 'error',
      'rest-spread-spacing': ['error', 'never'],
      'jsdoc/check-indentation': 'error',
      'jsdoc/check-syntax': 'warn',

      'jsdoc/require-jsdoc': [
        'off',
        {
          publicOnly: true,
        },
      ],

      'jsdoc/require-returns': 'warn',
      'jsdoc/require-param-description': 'warn',
      'eslint-comments/no-unused-disable': 'error',
    },
  },
  {
    files: ['packages/functions/test/**/*.ts'],

    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
];

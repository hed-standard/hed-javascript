import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('eslint:recommended', 'prettier'),
  {
    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-console': [
        'error',
        {
          allow: ['warn'],
        },
      ],

      'linebreak-style': ['error', 'unix'],
      'guard-for-in': 'error',
      'max-len': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'array-callback-return': 'error',
      'no-constant-binary-expression': 'error',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      'no-unmodified-loop-condition': 'warn',
      'no-unreachable-loop': 'error',
      'no-unused-private-class-members': 'error',

      'prefer-arrow-callback': [
        'error',
        {
          allowUnboundThis: false,
        },
      ],
    },
  },
]

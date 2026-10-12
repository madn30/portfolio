import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const threeOutsideScene = {
  group: ['three', 'three/*', '@react-three/*'],
  message: 'three.js must stay inside the lazy-loaded scene chunk.',
}

const sharedImportsFeature = {
  group: ['@/features/*'],
  message: 'Shared code must not depend on a feature.',
}

const sharedImportsApp = {
  group: ['@/app/*'],
  message: 'Shared infrastructure must not depend on the application layer.',
}

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/features/{loader,entrance,achievements,portfolio}/**/*.{ts,tsx}',
      'src/features/world/fallback/**/*.{ts,tsx}',
      'src/shared/{components,hooks}/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: [threeOutsideScene] }],
    },
  },
  {
    files: ['src/data/**/*.{ts,tsx}', 'src/shared/{utils,types,store,corridor}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [threeOutsideScene, sharedImportsFeature, sharedImportsApp] },
      ],
    },
  },
  {
    files: ['src/shared/graphics/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [sharedImportsFeature, sharedImportsApp] }],
    },
  },
)

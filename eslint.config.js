import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Playwright config y tests E2E: entorno Node
  {
    files: ['playwright.config.js', 'tests/**/*.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Tests unitarios de Vitest: entorno browser + Node (process no es necesario aquí)
  {
    files: ['src/tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
])

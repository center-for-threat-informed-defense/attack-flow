import parserTs from '@typescript-eslint/parser'
import stylisticTs from "@stylistic/eslint-plugin-ts"
import stylisticJs from "@stylistic/eslint-plugin-js"
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ]
    }
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-cli/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  {
    name: "app/ctid-typescript-formatting",
    files: ["src/**/*.ts"],
    plugins: {
      '@stylistic/ts': stylisticTs,
      "@stylistic/js": stylisticJs,
    },
    languageOptions: {
      parser: parserTs,
    },
    rules: {

      // Quotes
      "@stylistic/ts/quotes": ["error", "double"],

      // Commas
      "@stylistic/ts/comma-dangle": ["error", "never"],
      "@stylistic/js/comma-style": ["error", "last"],

      // Semi-colons
      "@stylistic/ts/semi": ["error", "always"],
      "@stylistic/js/semi-style": ["error", "last"],
      "@stylistic/ts/no-extra-semi": "error",

      // Constructors
      "@stylistic/js/new-parens": "error",

      // Objects
      "@stylistic/ts/quote-props": ["error", "consistent-as-needed"],
      "@stylistic/ts/object-curly-newline": ["error", { "consistent": true }],
      "@stylistic/js/dot-location": ["error", "property"],

      // Arrays
      "@stylistic/js/array-bracket-newline": ["error", "consistent"],

      // Numbers
      "@stylistic/js/no-floating-decimal": "error",

      // Delimiters
      "@stylistic/ts/member-delimiter-style": ["error", {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "comma",
          "requireLast": false
        },
        "multilineDetection": "brackets"
      }],

      // IIFE
      "@stylistic/js/wrap-iife": ["error", "inside"],

      // Statements
      "curly": "error",

      // Spacing: General
      '@stylistic/ts/indent': ['error', 4],
      "@stylistic/ts/block-spacing": "error",
      "@stylistic/ts/space-before-blocks": "error",
      "@stylistic/ts/keyword-spacing": ["error"],
      "@stylistic/js/space-in-parens": ["error", "never"],
      "@stylistic/js/no-trailing-spaces": "error",
      // Spacing: Operators
      "@stylistic/ts/space-infix-ops": "error",
      "@stylistic/js/space-unary-ops": "error",
      // Spacing: Lines
      "@stylistic/js/linebreak-style": ["error", "unix"],
      "@stylistic/js/eol-last": ["error", "always"],
      // Spacing: Switch
      "@stylistic/js/switch-colon-spacing": ["error", {"after": true, "before": false}],
      // Spacing: Generators
      "@stylistic/js/generator-star-spacing": ["error", {"before": true, "after": false}],
      "@stylistic/js/yield-star-spacing": ["error", "before"],
      // Spacing: Semi-colons
      "@stylistic/js/semi-spacing": ["error", { "before": false, "after": true }],
      // Spacing: Functions
      "@stylistic/ts/function-call-spacing": ["error", "never"],
      "@stylistic/ts/space-before-function-paren": ["error", {
          "named": "never",
          "anonymous": "never",
          "asyncArrow": "always"
      }],
      "@stylistic/js/arrow-spacing": "error",
      // Spacing: Arrays
      "@stylistic/js/array-bracket-spacing": ["error", "never"],
      "@stylistic/js/rest-spread-spacing": ["error", "never"],
      // Spacing: Objects
      "@stylistic/ts/object-curly-spacing": ["error", "always"],
      "@stylistic/js/computed-property-spacing": ["error", "never"],
      "@stylistic/js/no-whitespace-before-property": "error",
      // Spacing: Commas
      "@stylistic/ts/comma-spacing": ["error", { "before": false, "after": true }],
      // Spacing: Strings
      "@stylistic/js/template-curly-spacing": "error",
    }
  },
  ...pluginVue.configs['flat/strongly-recommended'],
  ...vueTsEslintConfig(),
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/*.spec.ts'],
  },
]

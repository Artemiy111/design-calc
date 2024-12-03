// import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'
import perfectionist from 'eslint-plugin-perfectionist'
import tailwind from 'eslint-plugin-tailwindcss'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'

import { withNuxt } from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // perfectionist.configs['recommended-alphabetical'],
  ...tailwind.configs['flat/recommended'],
  ...pluginVueA11y.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl', 'cn'],
      },
    },
  },
  // {
  //   rules: tseslint.configs.strict.at(-1).rules
  // },

  {
    plugins: { perfectionist },

    rules: {

      'import/order': 'off',
      'perfectionist/sort-vue-attributes': 'off',
      'perfectionist/sort-imports': ['error', {
        type: 'alphabetical',
        internalPattern: ['~/**', '~~/**'],
      }],
      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'alphabetical',
          groupKind: 'values-first',
        },
      ],
      'perfectionist/sort-exports': [
        'error',
        {
          type: 'alphabetical',
          groupKind: 'values-first',
        },
      ],

      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/consistent-generic-constructors': ['error', 'constructor'],
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // '@typescript-eslint/consistent-type-exports': ['error', {
      //   fixMixedExportsWithInlineTypeSpecifier: false,
      // }],
      // '@typescript-eslint/consistent-type-imports': 'error',
      // '@typescript-eslint/explicit-function-return-type': ['error', {
      //   allowConciseArrowFunctionExpressionsStartingWithVoid: true,
      //   allowTypedFunctionExpressions: true,
      //   allowExpressions: true,
      // }],
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],

      'vue/multi-word-component-names': 'off',
      'vue/attributes-order': ['error', {
        alphabetical: true,
      }],
      'vue/no-v-html': 'off',
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-emits-declaration': ['error', 'type-literal'],
      'vue/define-macros-order': ['error', { order: ['defineOptions', 'defineSlots', 'defineProps', 'defineModel', 'defineEmits', 'defineExpose'] }],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/enforce-style-attribute': ['error', { allow: ['scoped'] }],
      'vue/html-button-has-type': 'error',
      'vue/html-comment-content-spacing': 'error',
      'vue/next-tick-style': 'error',
      'vue/no-duplicate-attr-inheritance': 'error',
      'vue/no-empty-component-block': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-ref-object-reactivity-loss': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-static-inline-styles': 'error',
      'vue/no-template-target-blank': 'error',
      'vue/no-undef-properties': 'error',
      'vue/no-unused-emit-declarations': 'error',
      'vue/no-unused-refs': 'error',
      'vue/no-use-v-else-with-v-for': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-text': 'error',
      'vue/prefer-define-options': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': ['error', 'never'],
      'vue/require-typed-ref': 'error',
      'vue/v-for-delimiter-style': ['error', 'in'],
      'vue/valid-define-options': 'error',
      'vuejs-accessibility/form-control-has-label': 'off',
    },
  },
).append(oxlint.configs['flat/recommended'])

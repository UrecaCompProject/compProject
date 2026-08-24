// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import importX from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';

// Supabase Edge Functions(Deno 런타임)에서 사용하는 전역 객체.
// globals 패키지에 deno 환경이 없어 수동으로 정의한다.
// process 는 @types/node 가 제공하므로 제외한다.
const denoGlobals = {
  Deno: 'readonly',
  EdgeRuntime: 'readonly',
  console: 'readonly',
};

// import 순서를 그룹별로 강제하는 공통 규칙.
// 외부 패키지 → 내부 별칭(@/) → 상대경로 → 타입 import 순으로 정렬한다.
const importOrderRules = {
  'import-x/order': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
        'type',
      ],
      pathGroups: [
        { pattern: 'react', group: 'external', position: 'before' },
        { pattern: 'react/**', group: 'external', position: 'before' },
        { pattern: '@/**', group: 'internal' },
      ],
      pathGroupsExcludedImportTypes: ['react'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  'import-x/no-duplicates': 'error',
  'import-x/no-cycle': 'warn',
};

// 미사용 import/변수를 자동 제거하는 공통 규칙.
// typescript-eslint의 no-unused-vars를 unused-imports로 위임한다.
const unusedImportsRules = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': [
    'error',
    {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
    },
  ],
};

export default defineConfig([
  globalIgnores([
    'dist',
    'build',
    'node_modules',
    'stats.html',
    'supabase/.branches',
    'supabase/.temp',
    // Supabase Edge Functions(Deno 런타임)는 npm: specifier 를 사용하므로
    // import-x resolver 가 해석할 수 없어 별도 런타임 검사로 분리한다.
    'supabase/functions/**/*.{ts,tsx}',
    // flat config 파일 자신을 자기 자신으로 린트하면 순환적 경고가 발생하므로 제외
    'eslint.config.js',
  ]),

  // import-x 기본 + TypeScript resolver 설정 (전체 파일에 적용)
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  // 프론트엔드(Vite + React 19 + TS)
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
      },
    },
    rules: {
      ...importOrderRules,
      ...unusedImportsRules,
    },
  },

  // Storybook 설정(Node 런타임)
  // vite.config.ts 와 동일하게 tsconfig.node.json 을 resolver 대상으로 지정한다.
  {
    files: ['.storybook/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: globals.node,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.node.json',
        },
      },
    },
    rules: {
      ...importOrderRules,
      ...unusedImportsRules,
    },
  },

  // Supabase Edge Functions(Deno 런타임)
  // 브라우저 글로벌이 아닌 Deno/EdgeRuntime 글로벌을 사용한다.
  // supabase/tsconfig.json 을 resolver 대상으로 지정하여 .ts 확장자 import 를 해석한다.
  {
    files: ['supabase/functions/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: denoGlobals,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: 'supabase/tsconfig.json',
        },
      },
    },
    rules: {
      ...importOrderRules,
      ...unusedImportsRules,
    },
  },

  // Prettier와 충돌하는 ESLint 스타일 규칙 비활성화 (항상 마지막)
  prettierConfig,
  ...storybook.configs['flat/recommended'],
]);

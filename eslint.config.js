import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module', // 追加、ES Modulesを使用
      globals: globals.browser,
    },
    rules: { //追加
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable', // 変数・関数・型名など
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function', // 関数名
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeParameter', // ジェネリクスの型パラメータ
          format: ['camelCase'],
        },
        {
          selector: 'parameter', // 関数のパラメータ
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike', // クラス、インターフェース、型エイリアス、列挙型など
          format: ['PascalCase'],
        },
      ],
      'no-unused-vars': 'warn', // 未使用変数の警告
      'no-console': 'warn',     // console.logなどの警告
      'eqeqeq': 'error',        // 厳密等価演算子（===）の強制
      'curly': 'error',         // if/else等で波括弧の省略禁止
      'react-hooks/rules-of-hooks': 'error', // React Hooksのルール
      'react-hooks/exhaustive-deps': 'warn', // useEffect依存配列のチェック
    },
  },
  {
    files: ['src/types/**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      'no-unused-vars': 'off'
    }
  }
])
import { icebreaker } from '@icebreakers/eslint-config'

/**
 * Lint 范围与分层：
 * - `src/**`、`scripts/**`、根配置、`demo/*.ts` 与 `demo/scripts/**`：完整规则。
 * - `demo/src/**`：从 uni-z-paging 移植的演示代码，保留原有 Tab 缩进与排版，
 *   且其中 `z-paging-*` 目录由 sync-source 脚本生成，因此不纳入本库 lint 门禁。
 * - `docs/**` 与 Markdown：由 VitePress 和 `pnpm test:docs` 负责。
 */
export default icebreaker({
  miniProgram: true,
  vue: true,
  // 固定规则集，避免本地编辑器环境与 CI 使用不同的规则子集
  isInEditor: false,
  ignores: [
    'demo/src/**',
    'demo/dist/**',
    'docs/**',
    '**/*.md',
    '**/*.wxs',
    'coverage/**',
  ],
  rules: {
    // Vue SFC 的 setup 中大量存在「先调用后定义」的具名函数，属于正常写法
    'ts/no-use-before-define': ['error', {
      functions: false,
      classes: false,
      variables: true,
    }],
  },
}).append({
  // 脚本类文件由 `curly` / `antfu/if-newline` 生成的单行块与 max-statements-per-line 互相冲突，
  // 这里只对脚本放宽该格式规则，源码目录保持严格。
  files: ['scripts/**', 'demo/scripts/**'],
  rules: {
    'style/max-statements-per-line': 'off',
  },
})

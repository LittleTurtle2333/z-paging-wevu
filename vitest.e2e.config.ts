import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['e2e/**/*.e2e.ts'],
    // 真实 DevTools 用例需要本机 IDE 与 appid，由 vitest.devtools.config.ts 单独执行
    exclude: ['e2e/devtools/**', '**/node_modules/**'],
    environment: 'node',
    globalSetup: ['e2e/global-setup.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // 产物构建与渲染会话共享，串行执行避免重复构建
    fileParallelism: false,
  },
})

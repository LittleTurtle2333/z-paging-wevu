import { defineConfig } from 'vitest/config'

/**
 * 真实微信开发者工具 e2e。
 *
 * 与 `vitest.e2e.config.ts`（mpcore headless）不同，这里通过
 * `@weapp-vite/miniprogram-automator` 驱动真实 DevTools，可以验证点击、
 * 请求、setData 这类交互数据流。
 *
 * 前置条件：本机已安装并登录微信开发者工具，且「设置 → 安全设置 → 服务端口」
 * 已开启。CLI 路径可用 `WEAPP_DEVTOOLS_CLI` 覆盖。
 */
export default defineConfig({
  test: {
    include: ['e2e/devtools/**/*.devtools.e2e.ts'],
    environment: 'node',
    globalSetup: ['e2e/devtools/global-setup.ts'],
    testTimeout: 120_000,
    hookTimeout: 180_000,
    fileParallelism: false,
  },
})

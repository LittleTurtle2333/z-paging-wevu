import path from 'node:path'
import { defineConfig } from 'weapp-vite'

export default defineConfig({
  resolve: {
    alias: {
      // demo 内部源码
      '@': path.resolve(import.meta.dirname, 'src'),
      // 组件源码（仓库根 src），demo 直接引用未发布的本地实现
      'zp': path.resolve(import.meta.dirname, '../src'),
    },
  },
  weapp: {
    srcRoot: 'src',
    autoRoutes: true,
    vue: {
      template: {
        scopedSlotsRequireProps: false,
      },
    },
    wevu: {
      defaults: {
        component: {
          options: {
            virtualHost: true,
            styleIsolation: 'apply-shared',
          },
        },
      },
    },
  },
})

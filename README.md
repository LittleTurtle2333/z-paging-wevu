# z-paging-wevu

面向 **weapp-vite + wevu + Vue SFC** 的 z-paging 兼容实现。保留 z-paging 的分页心智模型，同时针对微信小程序运行时处理事件参数、虚拟列表和布局差异。

> 当前版本为 0.2.0，目标是微信小程序；nvue 专属渲染仅保留兼容入口。

## 能力

- 自动分页、下拉刷新、触底或点击加载更多
- `complete` / `completeByKey` / `completeByTotal` / `completeByNoMore`
- 内置 `fetch`、本地分页、缓存、空态与加载失败
- 页面滚动、整屏 `scroll-view`、顶部/底部/左右插槽
- 固定和动态高度虚拟列表、聊天记录模式、键盘适配
- 原生下拉刷新 + 自绘文案层（`refresher-default-style="none"`）：位移由视图层提供，与手指 1:1 跟手
- 自定义下拉刷新、二楼 F2、返回顶部、国际化文本
- TypeScript 类型与 `createPagingController()` 控制器
- `ZPagingSwiper` / `ZPagingSwiperItem` / `ZPagingEmptyView` / `ZPagingCell` 公用子组件

## 安装

```bash
pnpm add z-paging-wevu wevu
```

在 `weapp-vite.config.ts` 中注册随包提供的 SFC 解析器：

```ts
import { defineConfig } from 'weapp-vite'
import { ZPagingWevuResolver } from 'z-paging-wevu/resolver'

export default defineConfig({
  weapp: {
    autoImportComponents: {
      resolvers: [ZPagingWevuResolver()],
      vueComponents: true,
      vueComponentsModule: 'wevu',
    },
    uniApp: {
      include: ['z-paging-wevu'],
    },
  },
})
```

不要把 `z-paging-wevu` 加入 `weapp.npm.include`，否则原始 Vue SFC 会被交给普通 JavaScript 打包器。也可以直接将 `src/components/z-paging-wevu/` 复制到项目的组件目录。

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'wevu'
import { createPagingController } from 'z-paging-wevu/controller'

const items = ref<Record<string, unknown>[]>([])
const paging = createPagingController()

async function queryList([pageNo, pageSize]: [number, number, string]) {
  const result = await fetchYourPage({ pageNo, pageSize })
  await paging.complete(result)
}
</script>

<template>
  <ZPagingWevu
    v-model="items"
    :controller="paging"
    paging-data-key="order-list"
    @query="queryList"
  >
    <view v-for="item in items" :key="String(item.id)">
      {{ item.title }}
    </view>
  </ZPagingWevu>
</template>
```

**注意：** wevu 自定义组件的多参数事件会合并为数组，因此 `@query` 的参数是一个数组。请求结束后必须调用 `complete` 系列方法；刷新列表使用 `reload()`，不要手动调用内部查询流程。

## 文档

主站：<https://paging.weapp.dev/>（需管理员完成[首次部署](./docs-deployment.md)）

GitHub Pages 备用站：<https://littleturtle2333.github.io/z-paging-wevu/>

```bash
pnpm install
pnpm dev
```

构建组件类型检查与文档站：

```bash
pnpm build
```

文档覆盖安装、两种滚动模式、Props / Methods / Events / Slots，以及虚拟列表、聊天、本地分页、缓存和迁移注意事项。

真实浏览器验收（首次运行需要安装 Chromium）：

```bash
pnpm exec playwright install --only-shell chromium
pnpm test:docs
```

`pnpm test:docs` 会先构建文档，再临时启动预览服务，使用后台浏览器检查构建产物的导航、深层页面直达与刷新、搜索、静态资源、主题切换、移动端横向溢出、控制台错误和失败请求。结束时会关闭服务与浏览器。

`DOCS_BASE` 默认是 GitHub Pages 使用的 `/z-paging-wevu/`。Workers 主站使用根路径，可在本地分别构建验收：

```bash
pnpm test:docs
DOCS_BASE=/ pnpm test:docs
```

两种路径需要分别构建，不能共用同一份产物。自动发布、域名接入和回滚步骤见[文档部署说明](./docs-deployment.md)。

## 与 z-paging 的主要差异

- 微信中使用 `paging-data-key`，避免原生 `data-*` 属性冲突。
- 虚拟列表支持两种写法：内置列表（`use-virtual-list` + `#cell` 插槽）和非内置列表（`force-close-inner-list` + `@virtual-list-change` + 页面 `v-for`）；非内置写法中 cell 的 DOM id 必须为 `zp-id-${item.zp_index}`。
- 内置文案默认走多语言字典（`zh-Hans` / `zh-Hant` / `en`），可用 `paging.setLocale()` 运行时切换。
- 聊天消息项需要设置 `transform: scaleY(-1)` 恢复内容方向。
- `withDefaults` 默认值保留在 SFC 内，避免 wevu 不支持的 `mergeDefaults` 辅助函数。

## 致谢与许可

本项目是 [SmileZXLee/uni-z-paging](https://github.com/SmileZXLee/uni-z-paging) 的独立兼容实现，API 与文档组织参考了原项目及其文档仓库。原项目采用 MIT 许可证；相关版权声明保留在 [LICENSE](./LICENSE) 中。

本项目同样采用 MIT 许可证。

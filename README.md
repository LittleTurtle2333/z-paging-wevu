# z-paging-wevu

面向 **weapp-vite + wevu + Vue SFC** 的 z-paging 兼容实现。保留 z-paging 的分页心智模型，同时针对微信小程序运行时处理事件参数、虚拟列表和布局差异。

> 当前版本为 0.3.0，只支持微信小程序（weapp-vite + wevu + Vue SFC）。这是独立的微信小程序组件，不是 uni-app 组件；原版 z-paging 文档中的 H5、App、nvue 内容在这里没有对应实现，`setListSpecialEffects`、`setSpecialEffects` 也只为迁移保留空方法。

## 能力

- 自动分页、下拉刷新、触底或点击加载更多
- `complete` / `completeByKey` / `completeByTotal` / `completeByNoMore`
- 内置 `fetch`、本地分页、缓存、空态与加载失败
- 页面滚动、整屏 `scroll-view`、顶部/底部/左右插槽
- 固定和动态高度虚拟列表、聊天记录模式、键盘适配
- 原生下拉刷新 + 自绘文案层（`refresher-default-style="none"`）：位移由视图层提供，与手指 1:1 跟手
- PC 微信（Mac / Windows）没有下拉手势，原生 refresher 用鼠标触发不了，组件会自动回退到自定义刷新
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

## 本地开发

```bash
pnpm install

pnpm lint        # ESLint（内置 weapp-vite / wevu 小程序规则集）
pnpm typecheck   # vue-tsc
pnpm test        # Vitest：组件逻辑单测 + WXS/刷新时序回归（约 90 例）
pnpm test:watch  # 监听模式
pnpm test:e2e    # 产物级 e2e：构建 demo 后用 mpcore headless 运行时断言真实小程序产物
pnpm test:e2e:devtools # 真实微信开发者工具 e2e：验证点击、请求、数据加载（需已登录 + 开启服务端口）
pnpm check:package # publint 校验 exports / types 是否能被消费者解析
```

`test:e2e:devtools` 使用 `@weapp-vite/miniprogram-automator` 驱动本机微信开发者工具，前置条件：

1. 已安装并登录微信开发者工具
2. 「设置 → 安全设置 → 服务端口」已开启
3. 提供真实 appid：在项目根 `.env.local`（已被 gitignore）写入
   `WEAPP_DEVTOOLS_APPID=wx...`，或用环境变量临时传入
   （仓库默认的 `touristappid` 会被 DevTools 自动化接口以 `APPID_ERROR` 拒绝；
   在开发者工具里「项目 → 测试号」可获取一个无需注册小程序的测试 appid）
4. 关闭已打开的 demo 项目窗口，避免与自动化启动冲突
5. CLI 路径不是 macOS 默认值时，用 `WEAPP_DEVTOOLS_CLI=/path/to/cli` 覆盖

脚本会临时把 appid 写入 `demo/project.config.json`，测试结束自动恢复，不会污染仓库。

发布流程使用 Changesets：

```bash
pnpm changeset   # 描述本次改动并选择版本类型
pnpm version     # 汇总 CHANGELOG 与版本号
pnpm release     # 门禁通过后发布到 npm
```

`pnpm build` 会依次执行 lint、类型检查、测试与文档构建。演示小程序单独运行：

```bash
pnpm demo:dev    # 同步组件源码后启动 weapp-vite dev
pnpm demo:build  # 生产构建 + 产物校验
```

`demo/src/**` 是从 uni-z-paging 移植的演示代码，保留原有 Tab 缩进，不纳入 lint 门禁；其中 `demo/src/components/z-paging-*` 由同步脚本从仓库根 `src/` 生成，不要手改。

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

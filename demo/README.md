# z-paging-wevu demo

从 [`uni-z-paging` 的 vue3 demo](https://github.com/SmileZXLee/uni-z-paging/tree/main/demo/z-paging-vue3-demo) 移植而来的演示小程序，用于覆盖 `z-paging-wevu` 的全部能力。

## 运行

```bash
# 仓库根目录
pnpm demo:dev
```

然后用微信开发者工具导入 `demo/` 目录（`miniprogramRoot` 指向 `demo/dist/`）。`demo/project.config.json` 里的 `appid` 是 `touristappid`，导入时选择「测试号」或改成自己的 appid 即可。

生产构建：

```bash
pnpm demo:build
```

## 与原版 demo 的差异

| 项 | 原版（uni-app） | 本仓库（weapp-vite + wevu） |
| --- | --- | --- |
| 分页组件 | `z-paging` | `ZPagingWevu` |
| 路由 | `pages.json` | `autoRoutes` + `definePageJson` |
| 请求与跳转 | `uni.request` / `uni.navigateTo` | `wx.*` |
| 页面生命周期 | `@dcloudio/uni-app` | `wevu` 的 `onLoad` / `onReachBottom` 等 |
| 页面滚动模式 | `useZPaging` hook | `@/composables/usePagePaging` |
| `z-tabs` | uni_modules 插件 | `@/components/demo-tabs`（轻量替代） |
| `u-navbar` | uview-plus | `@/components/demo-navbar` |
| nvue 变体 | 11 个 `-n` 页面 | 未移植（微信小程序无 nvue） |

## 组件源码同步

`src/components/z-paging-wevu` 等目录是仓库根 `src/components/` 的副本，由 `scripts/sync-source.mjs` 生成，**不要手改**。

必须复制进 `demo/src` 而不是直接引用仓库根源码：weapp-vite 会把 `srcRoot` 之外的 SFC 当作外部组件单独产出，`scoped slot` 的 owner 链路会失效，表现为 `<template #top>` 里的内容（如 tab 栏）不渲染。

`pnpm demo:dev` 和 `pnpm demo:build` 都会先执行同步，组件改动后重新跑一次即可。

## 数据

`src/http/request.js` 是原版 demo 的本地 mock，用于模拟分页接口，未做改动。真实项目里在 `@query` 回调中换成自己的请求即可。

## 目录

```
demo/
├── project.config.json   # 微信开发者工具项目配置（miniprogramRoot: dist/）
├── weapp-vite.config.ts  # srcRoot: src，别名 @ -> demo/src，zp -> 仓库根 src
└── src/
    ├── app.vue / app.css
    ├── components/       # 演示用公共组件
    ├── composables/      # usePagePaging（页面滚动模式桥接）
    ├── http/             # mock 请求层
    ├── pages/            # 27 个演示页面
    └── static/           # 图片资源
```

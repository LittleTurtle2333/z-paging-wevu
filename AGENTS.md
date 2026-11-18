# AGENTS Guidelines

本文件是本仓库的 AI 工作流契约。项目由人工搭建，不是 `create-weapp-vite` 生成，结构与本文件描述保持一致时优先信任本文件。

## 项目定位

- `z-paging-wevu` 是面向 **weapp-vite + wevu + Vue SFC** 的微信小程序分页组件库，**不是 uni-app 组件**。
- 只支持微信小程序。H5 / App / nvue 相关能力在这里没有对应实现；`setListSpecialEffects`、`setSpecialEffects` 为迁移保留的空方法，不要"补全"它们。
- 发布物是 npm 包（`src/` 里的 Vue SFC + TS），demo 小程序只用于自测，不对外发布。

## 仓库结构

- `src/` —— 组件库源码，`package.json` 的 `exports` 与 `files` 白名单的唯一来源。改动组件行为只改这里。
- `demo/` —— pnpm workspace 子包，weapp-vite 演示小程序（`demo/weapp-vite.config.ts`，`srcRoot: 'src'`，`autoRoutes: true`）。
- `demo/src/components/z-paging-*` —— 由 `demo/scripts/sync-source.mjs` 从根 `src/components/` 复制生成，**禁止手改**，改完根 `src/` 后重跑 `pnpm demo:dev` / `pnpm demo:build` 即可重新同步。
- `docs/` —— VitePress 文档站（独立于小程序构建）。
- `scripts/*.test.mjs` —— WXS 与刷新时序回归测试，由 Vitest 执行（通过 `vm` + `typescript` 直接跑源码，不依赖小程序运行时）。
- `tests/unit/*.spec.ts` —— 组件逻辑单测（`wevuSfc()` 编译 SFC script）。**必须放在 `tests/` 而不是 `src/`**：发布物是 `files: ["src"]` 源码分发，测试放进 `src` 会被打进 npm 包（`files` 里的 `!` 排除模式与 ESLint 的数组排序规则冲突，不可依赖）。已覆盖：`utils`（文本/数值/数组兜底）、`useVirtualList`（窗口计算、占位高度、测量幂等、数据变动）、`locale`（语言探测、订阅、文案回落）、`window`（窗口信息缓存与宿主兜底、PC 微信判定）、`controller`（代理转发、解绑）、`wxsBridge`（按 ownerId 转发）、`props`（分页默认值契约）。
- `resolver.mjs` / `resolver.d.ts` —— 随包分发的组件解析器，改动需同步 `.d.ts`。

## 命令契约

| 目的 | 命令 |
| --- | --- |
| 静态检查 | `pnpm lint` / `pnpm lint:fix`（ESLint + `@icebreakers/eslint-config` 的 `miniProgram` preset） |
| 类型检查 | `pnpm typecheck`（vue-tsc） |
| 单元/回归测试 | `pnpm test`（Vitest，覆盖 `tests/unit/*.spec.ts` 与 `scripts/**/*.test.mjs`） |
| 单文件/watch | `pnpm test:watch` |
| 产物级 e2e | `pnpm test:e2e`（`weapp-vite/test` 构建 demo 产物 + `@mpcore/test` headless 运行时） |
| 真实 DevTools e2e | `pnpm test:e2e:devtools`（`@weapp-vite/miniprogram-automator`，需本机 DevTools 已登录并开启服务端口） |
| 包导出校验 | `pnpm check:package`（publint --strict） |
| 变更记录 | `pnpm changeset` / `pnpm version` / `pnpm release` |
| 库质量门禁 | `pnpm build` = lint + typecheck + test + 文档构建（**不含**小程序构建） |
| demo 开发 | `pnpm demo:dev`（先同步组件源码，再 `wv dev demo`） |
| demo 构建 | `pnpm demo:build`（同步 + `wv build demo` + 产物校验） |
| 文档站 | `pnpm dev` / `pnpm docs:build` |

`demo/src/**` 是有意排除在 lint 之外的移植代码（保留 Tab 缩进）；除 `demo/src` 外新增的源码必须能通过 `pnpm lint`。

注意：根目录的 `pnpm dev` 是 VitePress 文档站，不是小程序 dev server。小程序相关命令一律走 `demo:*` 脚本，或在 `demo/` 目录内直接执行 `wv dev` / `wv build`。

## 小程序运行时约束

- 小程序 AppService 不是浏览器也不是 Node.js。新增 `queueMicrotask`、Web API、DOM/Node 全局或现代内建前，必须先在目标平台、目标基础库和 renderer 的真实 IDE 中探测存在性及最小调用语义；浏览器、Node、类型声明和 headless 结果都不能替代真实 IDE 证据。
- 微信运行时不得假定存在 `queueMicrotask`。需要时走显式兼容层，而不是直接调用。
- 组件默认使用 `virtualHost: true` + `styleIsolation: 'apply-shared'`（见 `demo/weapp-vite.config.ts` 的 `weapp.wevu.defaults`），改样式或选择器行为时先确认这组默认值没有被破坏。
- PC 微信（Mac / Windows）没有下拉手势，原生 refresher 无法用鼠标触发，组件会自动回退到自定义刷新；模拟器行为不能作为 PC 端结论。
- wevu 自定义组件的多参数事件会合并成数组（例如 `@query` 收到 `[pageNo, pageSize, ...]`），新增事件时保持该契约一致。

## 开发约定

- 业务代码从 `wevu` 导入运行时 API（`ref`、`reactive`、`computed`、`onLoad` 等），不要从 `vue` 导入运行时。
- 生命周期钩子必须在 `setup()` 中同步注册，不要在 `await` 之后注册。
- 请求结束后必须调用 `complete` 系列方法；刷新列表用 `reload()`，不要绕过组件内部查询流程手动触发 `@query`。
- 不要把 `z-paging-wevu` 加进 `weapp.npm.include`，否则原始 Vue SFC 会被交给普通 JS 打包器；跨包复用时通过 `ZPagingWevuResolver` 或直接复制组件目录。
- `demo/src` 不直接引用仓库根 `src/`（除 alias `zp` 的过渡用法外）：`srcRoot` 之外的 SFC 会被当作外部组件单独产出，`scoped slot` 的 owner 链路失效，表现为 `<template #top>` 内容不渲染。
- 改动后按最小范围验证：先针对性 `pnpm test:watch` 或 `pnpm test`，再 `pnpm typecheck`，最后才 `pnpm build`。

## 本地文档优先

- 依赖安装后优先读随包文档：`node_modules/weapp-vite/dist/docs/index.md`、`README.md`、`mcp.md`、`weapp-config.md`、`vue-sfc.md`、`wevu-authoring.md`、`troubleshooting.md`。
- 当命令行为不确定时，以本地包文档和 `wv --help` 为准，不要依赖模型记忆或过期网页。

## CLI 与 AI 工作流

- `weapp-vite` 与 `wv` 等价。小程序 CLI 的目标目录是 `demo/`。
- 刷新受管支持文件：`wv prepare`（生成 `.weapp-vite/` 下的 tsconfig / 运行期支持文件）。
- 小程序截图/视觉回归不要退化成浏览器截图：
  - 截图：`wv screenshot --project ./demo/dist/build/mp-weixin --page <page> --output .tmp/xxx.png --json`
  - 对比：`wv compare --project ... --page ... --baseline ... --diff-output ... --max-diff-pixels 100 --json`
  - DevTools 日志：`wv ide logs --open`
  - 连接异常先 `wv ide doctor --json`
- 使用截图、预览、上传、automator 或 `--open` 前，确认微信开发者工具已登录且服务端口已开启。
- MCP：`wv mcp init <codex|claude-code|cursor>` 写客户端配置，`wv mcp print` 只预览，`wv mcp doctor` 自检。接入后优先使用 `take_weapp_screenshot`、`weapp_devtools_*`、`weapp_runtime_*` 等真实小程序运行时工具。
- 验收配置：`wv accept --init` / `--inspect --json` / `--trust --json` / `--report <jobId> --json`。

## AI Skills

已安装（`.agents/skills`，并通过软链同步到 `.claude/skills`、`.codebuddy/skills`、`.trae/skills`）：

- `weapp-vite-best-practices` —— 工程化与 CLI 边界
- `weapp-vite-vue-sfc-best-practices` —— SFC 宏与模板兼容
- `wevu-best-practices` —— wevu 生命周期、状态与事件

更新/补装：

```sh
npx --yes skills add sonofmagic/skills --skill weapp-vite-best-practices weapp-vite-vue-sfc-best-practices wevu-best-practices --agent claude-code codebuddy trae -y
```

`skills-lock.json` 记录来源与哈希，提交前保持与安装结果一致。

## E2E 能力边界

`pnpm test:e2e` 用 `weapp-vite/test` 构建 demo 的真实产物，再由 `@mpcore/test` 的 headless 运行时渲染。它能验证的是**产物结构与属性契约**，不能验证交互数据流：

- wevu 的模板事件走 `__weapp_vite_inline` 内联分发，headless 不执行这条链路；组件 `emit('query')` 到页面 `@query` 不会闭环，`reload()` 会一直挂在 `pendingQuery` 上。
- `onMounted` 里的 `setTimeout` 触发的自动查询在 headless 下不保证执行，断言不要依赖"数据自动加载完成"。
- 直接 `setData` 不会穿透 wevu 的响应式 ref，别用它伪造列表数据。

因此 e2e 断言集中在：页面/组件能否渲染、`#top` 等插槽内容、`scroll-view` 与 refresher 属性、`props → 产物属性` 的映射、`selectComponent` 暴露的方法名集合。分页数据流转由 `scripts/refresher*.test.mjs`（直接 `vm` 跑源码）覆盖。

真实交互数据流走 `e2e/devtools/**`（`@weapp-vite/miniprogram-automator` 驱动真实 DevTools）：可以断言首屏加载条数、切 tab 后 `dataList` 内容、`scrolltolower` 追加分页。它依赖本机 IDE 状态（登录 + 服务端口 + 真实 appid + 无冲突窗口），因此**不进 CI 门禁**，只在本地手动执行。

排查 `HTTP automator fallback failed with status 500` 时不要靠猜，直接复现请求看 body：

1. `lsof -p <DevTools Electron pid> -a -iTCP -sTCP:LISTEN` 找到 IDE HTTP 端口
2. `curl -s -G "http://127.0.0.1:<端口>/v2/auto" --data-urlencode "project=<demo 绝对路径>" --data-urlencode "port=<autoPort>" --data-urlencode "autoPort=<autoPort>" --data-urlencode "trustProject=true"`

已知结论：`{"code":"APPID_ERROR","message":"不存在此 AppID"}` 表示项目用的是 `touristappid`。自动化接口要求真实 appid，从环境变量 `WEAPP_DEVTOOLS_APPID` 或项目根被 gitignore 的 `.env.local` 读取（global-setup 会临时改写 `demo/project.config.json` 并在结束后恢复）。未配置时用例自动 skip，不会伪装成失败。

## 本地补充

- 若存在 `AGENTS.local.md`，在本文件之后阅读并应用其中的项目专属规则。
- 用户自有规则写 `AGENTS.local.md`，不要散落进本文件以外的生成产物。

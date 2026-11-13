# 示例 Demo

仓库内自带一个完整的 demo 小程序（`demo/`），覆盖组件的主要能力。下面按首页顺序列出所有页面，可直接对照源码查看对应写法。

## 运行 Demo

```bash
# 本地开发（会先同步 src 组件到 demo，再启动 weapp-vite）
pnpm demo:dev

# 构建（含 sync + 构建 + verify）
pnpm demo:build
```

构建产物在 `demo/dist`，用微信开发者工具导入 `demo/` 目录即可（`project.config.json` 的 `miniprogramRoot` 已指向 `dist/`）。

## 页面清单

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 普通模式演示 | `pages/common-demo/common-demo` | 基础 `v-model` + `@query` + `complete()` |
| 自定义下拉刷新与上拉加载 | `pages/custom-demo/custom-demo` | `use-custom-refresher` + `#refresher` 自绘刷新区 |
| 滑动切换选项卡（标准写法） | `pages/swiper-demo/swiper-demo` | `ZPagingSwiper` + `ZPagingSwiperItem` |
| 滑动切换选项卡（简化写法） | `pages/swiper-simplify-demo/swiper-simplify-demo` | 简化封装写法，不推荐用于复杂场景 |
| 使用页面滚动 | `pages/page-default-demo/page-default-demo` | `use-page-scroll`，列表跟随页面滚动 |
| 页面滚动 + 子组件内分页 | `pages/page-default-comp-demo/page-default-comp-demo` | 分页组件封装在子组件中 |
| 延迟加载列表 | `pages/load-delay-demo/load-delay-demo` | 自行控制首屏加载时机 |
| 在弹窗内使用 | `pages/popup-demo/popup-demo` | 局部滚动容器内的分页 |
| 下拉进入二楼 | `pages/f2-demo/f2-demo` | `refresher-f2-enabled` + `#f2` |
| 虚拟列表（一般写法） | `pages/virtual-list-demo/virtual-list-demo` | 内置列表：`use-virtual-list` + `#cell` |
| 虚拟列表（非内置列表） | `pages/virtual-list-no-inner-demo/virtual-list-no-inner-demo` | `force-close-inner-list` + `@virtual-list-change` |
| 滚动吸附效果 | `pages/sticky-demo/sticky-demo` | `position: sticky` 吸顶，reload 回到顶部 |
| 选项卡 + 吸顶① | `pages/sticky-swiper-demo/sticky-swiper-demo` | 保留上一个 tab 数据 |
| 选项卡 + 吸顶② | `pages/sticky-swiper-next-demo/sticky-swiper-next-demo` | 不保留 tab 数据，过渡更流畅 |
| 下拉显示最后更新时间 | `pages/show-update-time-demo/show-update-time-demo` | `show-refresher-update-time` |
| 自定义导航栏 | `pages/custom-nav-demo/custom-nav-demo` | 页面自绘导航栏 + `navigationStyle: custom` |
| 聊天记录模式 | `pages/chat-history-demo/chat-history-demo` | 倒置滚动区，滚到顶部加载更早消息 |
| 聊天记录 + 虚拟列表 | `pages/chat-history-virtual-demo/chat-history-virtual-demo` | 聊天模式与虚拟列表组合 |
| i18n 国际化 | `pages/i18n-demo/i18n-demo` | `paging.setLocale()` 切换内置文案 |
| 自定义返回顶部按钮 | `pages/custom-back-to-top-demo/custom-back-to-top-demo` | 自定义 `#backToTop` |
| 封装个性化分页组件 | `pages/my-paging-demo/my-paging-demo` | 二次封装减少重复配置 |
| 保证数据一致性 | `pages/consistency-demo/consistency-demo` | 慢请求下的结果提交顺序 |
| 极简写法① | `pages/minimalism-demo/minimalism-demo` | 全局配置 `v-model` / `@query` 绑定名 |
| 极简写法② | `pages/minimalism-fetch-demo/minimalism-fetch-demo` | 用 `fetch` 直接传请求函数 |
| 内置列表模式 | `pages/inner-list-demo/inner-list-demo` | `use-inner-list`，无需手写 `v-for` |

另外还有两个不在首页列表中的页面：

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 长列表（传统写法） | `pages/traditional-long-list-demo/traditional-long-list-demo` | 不使用组件，作为虚拟列表的性能对照 |
| 首页 | `pages/index/index` | demo 导航页 |

## 对照阅读建议

- 快速上手：`common-demo` → `custom-demo` → `page-default-demo`
- 虚拟列表：先看 `virtual-list-demo`（内置），再看 `virtual-list-no-inner-demo`（非内置）
- 聊天：`chat-history-demo` → `chat-history-virtual-demo`
- 多 tab：`swiper-demo`（独立分页）与 `sticky-swiper-next-demo`（吸顶 + 保留/不保留数据）

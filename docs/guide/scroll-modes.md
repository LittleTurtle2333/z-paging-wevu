# 滚动与布局模式

## 页面滚动模式

设置 `fixed=false` 和 `use-page-scroll=true`，组件内容跟随页面滚动，适合普通列表页。组件默认 `fixed=true`，与 uni-app 版 z-paging 的整屏行为保持一致。

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
  :fixed="false"
  :use-page-scroll="true"
  :fixed-top="navbarHeight"
  @query="queryList"
>
  <view v-for="item in items" :key="item.id">{{ item.title }}</view>
</ZPagingWevu>
```

页面滚动时，需要在页面生命周期把滚动位置同步给组件，并在原生下拉刷新、触底时调用控制器：

```ts
import { onPageScroll, onPullDownRefresh, onReachBottom } from 'wevu'

onPageScroll(({ scrollTop }) => paging.updatePageScrollTop(scrollTop))
onPullDownRefresh(() => paging.reload())
onReachBottom(() => paging.pageReachBottom())
```

若项目已封装 `usePagePaging`，可以直接复用该封装。`fixed-top` 应传自定义导航栏的实际高度。

## 整屏 `scroll-view` 模式

设置 `fixed=true` 且不要开启 `use-page-scroll`：

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
  :fixed="true"
  :fixed-top="navbarHeight"
  @query="queryList"
>
  <template #top>
    <view>滚动区外的固定头部</view>
  </template>
  <view v-for="item in items" :key="item.id">{{ item.title }}</view>
</ZPagingWevu>
```

`scroll-view` 必须拥有确定高度。组件会依据窗口高度和 `fixed-top` 计算滚动区，不要再用不明确的父级高度覆盖它。

## 顶部插槽的区别

- `fixed=true` 且 `sticky-top=true`：`#top` 放在滚动区外，保持固定。
- `fixed=true` 且 `sticky-top=false`：`#top` 随列表一起滚动。
- 页面滚动模式：`#top` 使用 `position: sticky`，并通过 `--vp-fixed-top` 避让导航栏。

整屏模式不要自行把 `#top` 改为 `position: sticky`；微信 `scroll-view` 内的 sticky 表现与 Web 不同。

## 仅使用布局

`layout-only=true` 会关闭自动查询、刷新、触底加载和空态，仅保留容器布局。适用于只想要顶部/底部/左右布局，不需要分页状态的场景。

## 安全区

- `safe-area-inset-bottom`：启用底部安全区占位。
- `use-safe-area-placeholder`：使用组件内置底部占位。
- `use-refresher-status-bar-placeholder`：在刷新区域前增加状态栏高度。

如果页面已有独立安全区组件，避免重复添加底部占位。

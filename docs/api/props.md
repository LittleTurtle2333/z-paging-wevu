# Props

模板中使用 kebab-case，例如 `defaultPageSize` 写作 `default-page-size`。下列默认值来自当前组件实现。

## 数据与分页

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `unknown[]` | `[]` | `v-model` 列表数据 |
| `controller` | `ZPagingWevuController` | — | 由 `createPagingController()` 创建 |
| `auto` | `boolean` | `true` | 挂载后自动加载第一页 |
| `defaultPageNo` | `number` | `1` | 起始页码 |
| `defaultPageSize` | `number` | `10` | 每页数量，最小按 1 处理 |
| `concat` | `boolean` | `true` | 加载更多时拼接数据 |
| `dataKey` | `string \| number \| object` | — | 兼容入口；微信推荐 `pagingDataKey` |
| `pagingDataKey` | `string \| number \| object` | — | 列表数据标识，避免微信原生 `data-*` 冲突 |
| `responseDataKey` | `string` | `''` | 从响应对象中读取数组的字段名 |
| `fetch` | `ZPagingWevuFetch` | — | 内置请求函数，结果仍由组件完成分页 |
| `fetchParams` | `Record<string, unknown>` | — | 传给 `fetch` 的额外参数 |
| `delay` | `number \| string` | `0` | 查询延迟，ms |
| `minDelay` | `number \| string` | `0` | 查询最短耗时，ms |
| `autoCleanListWhenReload` | `boolean` | `false` | reload 开始时清空列表 |
| `autoCleanListWhenReloadError` | `boolean` | `true` | reload 失败时清空列表 |

### `fetch` 参数

```ts
type ZPagingWevuFetch = (params: {
  pageNo: number
  pageSize: number
  from: 'user-pull-down' | 'reload' | 'refresh' | 'load-more'
  lastItem: unknown
  [key: string]: unknown
}) => unknown | Promise<unknown>
```

`fetch` 返回数组，或通过 `response-data-key` 指定的包含数组的对象。

## 根布局与样式

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fixed` | `boolean` | `true` | 使用整屏 `scroll-view`，与 uni-app 版默认行为一致 |
| `usePageScroll` | `boolean` | `false` | 使用页面滚动 |
| `layoutOnly` | `boolean` | `false` | 只保留布局，关闭自动分页交互 |
| `fixedTop` | `number` | `0` | 顶部固定区域高度，px |
| `stickyTop` | `boolean` | `true` | 顶部插槽固定或吸顶 |
| `height` | `string` | — | 根节点高度 |
| `width` | `string` | `'100%'`（样式兜底） | 根节点宽度 |
| `maxWidth` | `string` | — | 根节点最大宽度 |
| `autoFullHeight` | `boolean` | `true` | 页面滚动时自动补足窗口高度 |
| `defaultThemeStyle` | `'black' \| 'white' \| string` | `'black'` | 默认主题风格 |
| `pagingStyle` | `ZPagingWevuStyle` | — | 根节点样式 |
| `pagingClass` | `string \| string[] \| object` | — | 根节点 class |
| `pagingContentStyle` | `ZPagingWevuStyle` | — | 内容节点样式 |
| `pagingContentClass` | `string \| string[] \| object` | — | 内容节点 class |
| `bgColor` | `string` | — | 根背景色 |
| `bgColorContent` | `string` | — | 内容背景色 |
| `bottomBgColor` | `string` | `''` | 底部背景色 |
| `safeAreaInsetBottom` | `boolean` | `false` | 底部安全区 |
| `useSafeAreaPlaceholder` | `boolean` | `false` | 使用底部安全区占位 |
| `useRefresherStatusBarPlaceholder` | `boolean` | `false` | 刷新区域前增加状态栏占位 |

## 下拉刷新

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `refresherOnly` | `boolean` | `false` | 仅使用刷新，不启用加载更多 |
| `refresherEnabled` | `boolean` | `true` | 启用下拉刷新 |
| `refresherThreshold` | `number \| string` | `40` | 刷新触发距离 |
| `useCustomRefresher` | `boolean` | `false` | 使用自定义刷新（逻辑层逐帧计算高度） |
| `refresherDefaultStyle` | `'black' \| 'white' \| 'none'` | `'black'` | 原生刷新指示器样式；`none` 关闭微信默认刷新区域并启用自绘文案层，位移仍由原生提供 |
| `showRefresherWhenReload` | `boolean` | `false` | reload 时展示刷新状态 |
| `reloadWhenRefresh` | `boolean` | `true` | 刷新时执行 reload |
| `refresherThemeStyle` | `string` | `'black'` | 刷新主题 |
| `showRefresherUpdateTime` | `boolean` | `false` | 展示最后更新时间 |
| `refresherUpdateTimeKey` | `string` | `'default'` | 更新时间缓存 key |
| `refresherDefaultText` | `ZPagingWevuText` | `'继续下拉刷新'` | 默认文本 |
| `refresherPullingText` | `ZPagingWevuText` | `'松开立即刷新'` | 松开刷新文本 |
| `refresherRefreshingText` | `ZPagingWevuText` | `'正在刷新...'` | 刷新中文本 |
| `refresherCompleteText` | `ZPagingWevuText` | `'刷新成功'` | 完成文本 |
| `refresherDefaultImg` | `string` | — | 默认图片 |
| `refresherPullingImg` | `string` | — | 拉动图片 |
| `refresherRefreshingImg` | `string` | — | 刷新中图片 |
| `refresherCompleteImg` | `string` | — | 完成图片 |
| `refresherRefreshingAnimated` | `boolean` | `true` | 刷新图片旋转动画 |
| `refresherCompleteDelay` | `number \| string` | `0` | 完成状态延迟 |
| `refresherCompleteDuration` | `number \| string` | `300` | 完成动画时长 |
| `refresherDefaultDuration` | `number \| string` | `200` | 默认动画时长 |
| `refresherF2Enabled` | `boolean` | `false` | 启用二楼 |
| `refresherF2Threshold` | `number \| string` | `100` | 二楼触发距离 |
| `refresherF2Duration` | `number \| string` | `200` | 二楼动画时长 |
| `showRefresherF2` | `boolean` | `true` | 显示二楼入口 |
| `refresherVibrate` | `boolean` | `false` | 触发时振动 |
| `refresherRefreshingScrollable` | `boolean` | `true` | 刷新中允许滚动 |
| `refresherCompleteScrollable` | `boolean` | `false` | 完成状态允许滚动 |
| `refresherOutRate` | `number` | `0.65` | 拉出距离衰减系数 |
| `refresherPullRate` | `number` | `0.75` | 拉动距离系数 |
| `refresherFps` | `number \| string` | `40` | 触摸更新帧率 |
| `refresherMaxAngle` | `number \| string` | `40` | 最大角度配置 |
| `watchRefresherTouchmove` | `boolean` | `false` | 监听刷新触摸移动 |
| `refresherImgStyle` | `ZPagingWevuStyle` | — | 图片样式 |
| `refresherTitleStyle` | `ZPagingWevuStyle` | — | 文本样式 |
| `refresherUpdateTimeStyle` | `ZPagingWevuStyle` | — | 更新时间样式 |
| `refresherBackground` | `string` | — | 刷新区域背景 |

## 加载更多

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `loadingMoreEnabled` | `boolean` | `true` | 启用加载更多 |
| `lowerThreshold` | `number \| string` | `50` | 距底部触发距离 |
| `toBottomLoadingMoreEnabled` | `boolean` | `true` | 触底自动加载 |
| `loadingMoreThemeStyle` | `string` | `'black'` | 加载更多主题 |
| `loadingMoreDefaultText` | `ZPagingWevuText` | `'点击加载更多'` | 默认文本 |
| `loadingMoreLoadingText` | `ZPagingWevuText` | `'正在加载...'` | 加载中文本 |
| `loadingMoreNoMoreText` | `ZPagingWevuText` | `'没有更多了'` | 无更多文本 |
| `loadingMoreFailText` | `ZPagingWevuText` | `'加载失败，点击重新加载'` | 失败文本 |
| `showLoadingMoreNoMoreView` | `boolean` | `true` | 显示无更多视图 |
| `hideNoMoreInside` | `boolean` | `false` | 隐藏列表内无更多 |
| `hideNoMoreByLimit` | `number` | `0` | 数据量小于限制时隐藏无更多 |
| `insideMore` | `boolean` | `false` | 加载更多放入列表内部 |
| `loadingMoreDefaultAsLoading` | `boolean` | `false` | 默认状态按加载中展示 |
| `showDefaultLoadingMoreText` | `boolean` | `true` | 显示默认加载文本 |
| `showLoadingMoreNoMoreLine` | `boolean` | `true` | 在“没有更多了”文字两侧显示对称分隔线 |
| `loadingMoreCustomStyle` | `ZPagingWevuStyle` | — | 容器样式 |
| `loadingMoreTitleCustomStyle` | `ZPagingWevuStyle` | — | 文本样式 |
| `loadingMoreLoadingIconCustomStyle` | `ZPagingWevuStyle` | — | 加载图标样式 |
| `loadingMoreLoadingIconType` | `'flower' \| 'circle' \| string` | `'circle'` | 图标类型 |
| `loadingMoreLoadingIconCustomImage` | `string` | — | 自定义加载图片 |
| `loadingMoreLoadingAnimated` | `boolean` | `true` | 加载动画 |
| `loadingMoreNoMoreLineCustomStyle` | `ZPagingWevuStyle` | — | 分隔线样式 |

## 空态与失败

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `hideEmptyView` | `boolean` | `false` | 隐藏空态 |
| `emptyViewFixed` | `boolean` | `false` | 固定空态 |
| `emptyViewCenter` | `boolean` | `true` | 空态居中 |
| `emptyViewText` | `ZPagingWevuText` | `'没有数据哦~'` | 空数据文本 |
| `emptyViewImg` | `string` | — | 空数据图片 |
| `emptyViewErrorImg` | `string` | — | 失败图片 |
| `emptyViewReloadText` | `ZPagingWevuText` | `'重新加载'` | 重载按钮文本 |
| `emptyViewErrorText` | `ZPagingWevuText` | `'很抱歉，加载失败'` | 失败文本 |
| `showEmptyViewReload` | `boolean` | `false` | 空态显示重载 |
| `showEmptyViewReloadWhenError` | `boolean` | `true` | 失败时显示重载 |
| `emptyViewSuperStyle` | `ZPagingWevuStyle` | — | 空态外层样式 |
| `isLoadFailed` | `boolean` | `false` | 外部控制失败状态 |

## 返回顶部与滚动

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `autoShowBackToTop` | `boolean` | `false` | 滚动后自动显示返回顶部 |
| `backToTopThreshold` | `number \| string` | `200` | 显示阈值 |
| `backToTopImg` | `string` | — | 按钮图片 |
| `backToTopWithAnimate` | `boolean` | `true` | 返回时使用动画 |
| `backToTopBottom` | `number \| string` | `80` | 距底部距离 |
| `backToTopStyle` | `ZPagingWevuStyle` | — | 按钮样式 |
| `showScrollbar` | `boolean` | `true` | 显示滚动条 |
| `autoHideLoadingAfterFirstLoaded` | `boolean` | `true` | 首次加载后隐藏全屏加载 |

## 虚拟列表

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `useVirtualList` | `boolean` | `false` | 启用虚拟列表 |
| `cellHeightMode` | `'fixed' \| 'dynamic'` | `'fixed'` | cell 高度模式 |
| `preloadPage` | `number \| string` | `2` | 预加载视口页数 |
| `fixedCellHeight` | `number \| string` | `0` | 固定或估算高度 |
| `virtualListCol` | `number \| string` | `1` | 列数 |
| `virtualScrollFps` | `number \| string` | `80` | 滚动更新帧率 |
| `useInnerList` | `boolean` | `false` | 内置列表兼容配置 |
| `forceCloseInnerList` | `boolean` | `false` | 强制使用页面默认插槽渲染 |
| `innerListStyle` | `ZPagingWevuStyle` | — | 内置列表样式 |
| `innerCellStyle` | `ZPagingWevuStyle` | — | 内置 cell 样式 |
| `virtualParentLevel` | `number \| string` | `0` | 虚拟列表父级层级 |
| `parentLevel` | `number \| string` | `0` | 父级层级兼容配置 |
| `inSwiperSlot` | `boolean` | `false` | 位于 swiper 插槽中 |

## 聊天与缓存

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `useChatRecordMode` | `boolean` | `false` | 启用聊天记录模式 |
| `autoHideKeyboardWhenChat` | `boolean` | `true` | 点击内容收起键盘 |
| `autoAdjustPositionWhenChat` | `boolean` | `true` | 键盘弹出自动调整位置 |
| `autoToBottomWhenChat` | `boolean` | `false` | 自动滚动到底部 |
| `chatAdjustPositionOffset` | `string` | `'0px'` | 位置调整偏移 |
| `showChatLoadingWhenReload` | `boolean` | `false` | reload 显示聊天加载 |
| `chatLoadingMoreDefaultAsLoading` | `boolean` | `true` | 聊天默认状态按加载展示 |
| `useCache` | `boolean` | `false` | 启用列表缓存 |
| `cacheKey` | `string` | — | 缓存 key |

## 公共类型

```ts
type ZPagingWevuText = string | Record<string, string>
type ZPagingWevuStyle = string | Record<string, string | number | undefined>
```

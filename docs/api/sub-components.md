# 公用子组件

以下子组件与 `ZPagingWevu` 使用同一个解析器注册：

```ts
import { ZPagingWevuResolver } from 'z-paging-wevu/resolver'
```

```ts
autoImportComponents: {
  resolvers: [ZPagingWevuResolver()],
  vueComponents: true,
  vueComponentsModule: 'wevu',
},
uniApp: {
  include: ['z-paging-wevu'],
},
```

同时保留独立源码入口，便于显式引用：

```ts
import ZPagingSwiper from 'z-paging-wevu/swiper'
import ZPagingSwiperItem from 'z-paging-wevu/swiper-item'
import ZPagingEmptyView from 'z-paging-wevu/empty-view'
import ZPagingCell from 'z-paging-wevu/cell'
```

## ZPagingSwiper

整屏 swiper 容器，提供顶部、底部、左右插槽。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fixed` | `boolean` | `true` | 使用 fixed 整屏布局 |
| `safeAreaInsetBottom` | `boolean` | `false` | 底部增加安全区 |
| `fixedTop` | `number` | `0` | 顶部偏移，px |
| `swiperStyle` | `object` | `{}` | 容器自定义样式 |

插槽：`top`、`bottom`、`left`、`right` 和默认插槽。保留 `updateLeftAndRightWidth()` 兼容入口，但不实现旧 WebView 专用绝对定位测量。

## ZPagingSwiperItem

在当前 `currentIndex === tabIndex` 且尚未加载时触发首次 `reload()`，实现当前页懒加载。组件内部维护轻量分页状态，不嵌套 `ZPagingWevu`，避免多层 scoped slot 中的控制器序列化问题。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tabIndex` | `number` | `0` | 当前 item 的索引 |
| `currentIndex` | `number` | `0` | swiper 当前索引 |
| `controller` | `ZPagingWevuController` | 内部创建 | 可选外部分页控制器 |
| `useVirtualList` | `boolean` | `false` | 虚拟列表兼容配置；当前不重复实现主组件虚拟窗口 |
| `useInnerList` | `boolean` | `false` | 通过 `#cell` 渲染内部列表 |
| `cellKeyName` | `string` | `''` | nvue 兼容字段，当前无实际作用 |
| `innerListStyle` | `object` | `{}` | 内置列表样式兼容配置 |
| `preloadPage` | `number \| string` | `12` | 预加载兼容配置 |
| `cellHeightMode` | `'fixed' \| 'dynamic'` | `'fixed'` | cell 高度兼容配置 |
| `virtualListCol` | `number \| string` | `1` | 列数兼容配置 |
| `virtualScrollFps` | `number \| string` | `60` | 滚动采样兼容配置 |

需要完整虚拟列表、下拉刷新和加载更多时，请直接使用 `ZPagingWevu`，不要把多个主分页实例嵌套在 scoped slot 中。

### 事件

- `query`：处理函数接收 `[pageNo, pageSize, from, controller]`。前三个参数与原组件一致，第四个参数是 wevu 补充的控制器，可直接调用 `complete()`。
- `updateList` / `update-list`：列表变化，参数为完整数组。

### 方法

- `reload(animate?)`
- `complete(data, success?)`

`controller` 的 `reload` 和 `complete` 会代理到当前 item；主组件其他方法请通过 `ZPagingWevu` 自己的控制器调用。

## ZPagingEmptyView

独立空数据与加载失败占位组件。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `emptyViewText` | `string` | `'没有数据哦~'` | 空态文本 |
| `emptyViewImg` | `string` | `''` | 自定义图片；为空时使用轻量占位图形 |
| `showEmptyViewReload` | `boolean` | `false` | 显示重新加载按钮 |
| `emptyViewReloadText` | `string` | `'重新加载'` | 按钮文本 |
| `isLoadFailed` | `boolean` | `false` | 是否加载失败 |
| `emptyViewStyle` | `object` | `{}` | 容器样式 |
| `emptyViewImgStyle` | `object` | `{}` | 图片样式 |
| `emptyViewTitleStyle` | `object` | `{}` | 文本样式 |
| `emptyViewReloadStyle` | `object` | `{}` | 按钮样式 |
| `emptyViewZIndex` | `number` | `9` | 层级 |
| `emptyViewFixed` | `boolean` | `true` | 铺满父容器 |
| `unit` | `'rpx' \| 'px'` | `'rpx'` | 布局单位 |

### 事件

- `reload`：点击重新加载。
- `viewClick` / `view-click`：点击空态容器。

```vue
<ZPagingEmptyView
  is-load-failed
  show-empty-view-reload
  empty-view-text="数据加载失败"
  @reload="paging.reload()"
/>
```

## ZPagingCell

非 nvue 环境的 `view` 包装，用于统一列表 cell 与触摸事件。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cellStyle` | `object` | `{}` | cell 样式 |

事件：`touchstart`，参数为原始触摸事件。

```vue
<ZPagingCell
  :cell-style="{ padding: '24rpx', background: '#ffffff' }"
  @touchstart="handleCellTouch"
>
  列表内容
</ZPagingCell>
```

nvue 的原生 `<cell>` 分支不在当前实现范围内。

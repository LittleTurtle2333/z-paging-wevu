# Events

::: warning wevu 事件参数
自定义组件的多个 emit 参数会打包为一个数组。受影响的不只是 `query`，还包括 `inner-cell-click` 等多参数事件。单个对象或 primitive 参数可直接使用 `$event`。
:::

## 数据与查询

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `list: unknown[]` | 更新 `v-model` |
| `query` | `[pageNo, pageSize, from]` | 请求当前页数据 |
| `list-change` | `list: unknown[]` | 列表变化 |
| `reload` | 无 | 开始 reload |
| `is-load-failed-change` | `failed: boolean` | 加载失败状态变化 |

`from` 为 `'user-pull-down' \| 'reload' \| 'refresh' \| 'load-more'`。

```ts
function queryList([pageNo, pageSize, from]: [number, number, string]) {}
```

## 下拉刷新

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `on-refresh` | 无 | 开始刷新 |
| `on-restore` | 无 | 刷新恢复 |
| `refresher-status-change` | `status` | 刷新状态变化 |
| `refresher-touchstart` | `y: number` | 触摸开始 |
| `refresher-touchmove` | `{ pullingDistance, dy, viewHeight, rate }` | 触摸移动 |
| `refresher-touchend` | `y: number` | 触摸结束 |
| `refresher-f2-change` | `visible: boolean` | 二楼显示状态变化 |

刷新状态为 `'default' \| 'release-to-refresh' \| 'loading' \| 'complete' \| 'go-f2'`。

## 加载更多与空态

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `loading-status-change` | `status` | 加载状态变化 |
| `empty-view-reload` | `callback: (allow?: boolean) => void` | 点击空态重载，可拦截 |
| `empty-view-click` | 无 | 点击空态 |
| `back-to-top-click` | `callback: (allow?: boolean) => void` | 点击返回顶部，可拦截 |

加载状态为 `'default' \| 'loading' \| 'no-more' \| 'fail'`。

拦截示例：

```ts
function beforeReload(callback: (allow?: boolean) => void) {
  if (canReload.value) {
    callback(true)
  }
  else {
    callback(false)
  }
}
```

## 虚拟列表

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `virtual-list-change` | `Array<Record<string, unknown>>` | 当前渲染窗口变化 |
| `inner-cell-click` | `[item, index]` | 点击内置 cell |
| `virtual-placeholder-top-height` | `height: number` | 顶部占位高度变化 |

```ts
function onInnerCellClick([item, index]: [unknown, number]) {}
```

## 键盘

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `hided-keyboard` | 无 | 键盘已隐藏 |
| `keyboard-height-change` | `{ height: number }` | 键盘高度变化 |

## 滚动与触摸

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `scroll` | 原始滚动事件 | `scroll-view` 滚动 |
| `scroll-top-change` | `scrollTop: number` | 同步后的滚动位置变化 |
| `scrolltolower` | 无 | 滚动到底部 |
| `scrolltoupper` | 无 | 滚动到顶部 |
| `scrollend` | 原始滚动事件 | 滚动结束 |
| `content-height-changed` | `height: number` | 内容高度变化 |
| `touch-direction-change` | `'top' \| 'bottom'` | 触摸方向变化 |
| `scroll-direction-change` | `'top' \| 'bottom'` | 滚动方向变化 |

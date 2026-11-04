# 虚拟列表

虚拟列表只渲染视口与预加载区域内的 cell，适用于长列表。支持 `fixed` 固定高度与 `dynamic` 动态高度。

## 微信推荐写法

```vue
<script setup lang="ts">
import { ref } from 'wevu'
import { createPagingController } from 'z-paging-wevu/controller'

const items = ref<Record<string, unknown>[]>([])
const renderItems = ref<Record<string, unknown>[]>([])
const paging = createPagingController()

function queryList([pageNo, pageSize]: [number, number, string]) {
  paging.complete(makePage(pageNo, pageSize))
}
</script>

<template>
  <ZPagingWevu
    v-model="items"
    :controller="paging"
    :fixed="true"
    use-virtual-list
    force-close-inner-list
    cell-height-mode="fixed"
    :fixed-cell-height="88"
    :preload-page="2"
    @query="queryList"
    @virtual-list-change="renderItems = $event"
  >
    <view
      v-for="item in renderItems"
      :id="`zp-id-${item.zp_index}`"
      :key="item.zp_index"
      style="height: 176rpx;"
    >
      {{ item.title }}
    </view>
  </ZPagingWevu>
</template>
```

::: warning 必须保留 cell id
每个渲染项都需要 `:id="`zp-id-${item.zp_index}`"`。组件依靠该 id 测量 cell 与执行滚动定位，普通业务 id 不能替代它。
:::

`virtual-list-change` 返回当前窗口数据。对象数据会合并 `zp_index`；原始值会包装为 `{ value, zp_index }`。

## 固定高度

```vue
<ZPagingWevu
  use-virtual-list
  force-close-inner-list
  cell-height-mode="fixed"
  :fixed-cell-height="60"
/>
```

`fixed-cell-height` 支持数字 px 或带 `px` / `rpx` 的字符串。若未提供，组件会使用首次测量高度，最后兜底为 60 px。

## 动态高度

```vue
<ZPagingWevu
  use-virtual-list
  force-close-inner-list
  cell-height-mode="dynamic"
  :fixed-cell-height="60"
/>
```

动态模式会缓存已测量高度。内容高度变化后先更新业务数据，再调用：

```ts
paging.didUpdateVirtualListCell(index)
```

删除数据后调用：

```ts
paging.didDeleteVirtualListCell(index)
```

这两个方法**不会修改业务数组**。它们分别更新和删除高度缓存；`updateVirtualListRender()` 也只负责重新计算可见窗口。

## 插入数据

```ts
paging.doInsertVirtualListItem({ id: 101, title: '新消息' }, 0)
```

该方法会更新列表并重新计算窗口。手动操作 `items` 时，仍应通过组件支持的数据更新路径保持 `v-model` 一致。

## 滚动到指定项

```ts
paging.scrollIntoViewByIndex(99, 0, true)
```

也可以按 cell id：

```ts
paging.scrollIntoViewById('zp-id-99', 0, true)
```

## 多列与预加载

- `virtual-list-col`：列数，默认 1。
- `preload-page`：上下预加载的视口页数，默认 2。
- `virtual-scroll-fps`：滚动更新帧率配置，默认 80。

多列时索引按行计算高度；动态高度应以每行首个 cell 的实际高度为准。

## 内置列表边界

组件保留 `#cell`、`#header`、`#footer` 等内置列表插槽作为兼容能力，但微信端已验证路径是 `force-close-inner-list` + 页面 `v-for`。新增微信页面不要把逐 cell scoped-slot 的内置写法作为首选。

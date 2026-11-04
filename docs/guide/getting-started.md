# 安装与快速开始

## 环境要求

- Node.js 20.19 或更高版本
- weapp-vite 与 wevu 7.5 或更高版本
- Vue SFC + TypeScript 项目

## 安装

作为依赖发布后，可通过 pnpm 安装：

```bash
pnpm add z-paging-wevu wevu
```

在本仓库中开发时，也可以使用 pnpm workspace 或 `file:` 依赖。若不希望通过包管理器接入，可直接复制 `src/components/z-paging-wevu/` 到业务项目组件目录。

## 最小示例

```vue
<script setup lang="ts">
import { ref } from 'wevu'
import ZPagingWevu, { createPagingController } from 'z-paging-wevu'

interface Item {
  id: number
  title: string
}

const items = ref<Item[]>([])
const paging = createPagingController()

async function queryList([pageNo, pageSize]: [number, number, string]) {
  const response = await request<{ list: Item[], total: number }>({
    url: '/items',
    data: { pageNo, pageSize },
  })
  await paging.completeByTotal(response.list, response.total)
}
</script>

<template>
  <ZPagingWevu
    v-model="items"
    :controller="paging"
    paging-data-key="item-list"
    @query="queryList"
  >
    <view v-for="item in items" :key="item.id">
      {{ item.title }}
    </view>
  </ZPagingWevu>
</template>
```

`request` 代表项目自己的请求方法，组件不要求特定的 HTTP 库。

## 三条必要规则

### 1. 使用 `v-model` 管理列表

通过 `v-model="items"` 绑定数据。不要在请求成功后再次手动执行 `items.value = page`，结果应交给 `complete` 系列方法统一处理。

### 2. 请求结束必须调用 `complete`

成功时使用 `complete(page)` 或 `completeByTotal(page, total)`；失败时使用 `complete(false)` 或 `completeByError(message)`。否则组件无法结束加载状态或递增页码。

### 3. 使用 `reload()` 刷新

刷新第一页调用 `paging.reload()`，组件会触发 `@query`。不要直接调用组件内部查询方法。

## `@query` 参数差异

wevu 自定义组件只透传一个事件 payload，多参数会打包为数组：

```ts
// ✅ 当前实现的正确签名
function queryList([pageNo, pageSize, from]: [number, number, string]) {}

// ❌ 官方 uni-app 写法不能直接照搬到 wevu
// function queryList(pageNo, pageSize, from) {}
```

`from` 的可能值为 `user-pull-down`、`reload`、`refresh`、`load-more`。

## 页面 JSON

页面滚动模式需要原生下拉刷新时，在页面配置中开启：

```ts
definePageJson({
  enablePullDownRefresh: true,
})
```

整屏模式由内部 `scroll-view` 处理刷新，不依赖页面原生下拉刷新。两种模式的接入见[滚动与布局模式](./scroll-modes)。

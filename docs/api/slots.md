# Slots

## 内容布局

| 插槽 | 作用域参数 | 说明 |
| --- | --- | --- |
| 默认插槽 | 无 | 普通列表或非内置虚拟列表内容 |
| `top` | 无 | 顶部筛选、导航或吸顶内容 |
| `bottom` | 无 | 底部操作区或聊天输入框 |
| `left` | 无 | 左侧固定内容 |
| `right` | 无 | 右侧固定内容 |

```vue
<ZPagingWevu v-model="items">
  <template #top><view>顶部</view></template>
  <view v-for="item in items" :key="item.id">{{ item.title }}</view>
  <template #bottom><view>底部</view></template>
</ZPagingWevu>
```

## 加载与空态

| 插槽 | 作用域参数 | 说明 |
| --- | --- | --- |
| `loading` | 无 | 首次加载内容 |
| `empty` | `{ isLoadFailed }` | 空数据或失败内容 |
| `backToTop` | 无 | 返回顶部按钮 |

## 下拉刷新

| 插槽 | 作用域参数 | 说明 |
| --- | --- | --- |
| `refresher` | `{ refresherStatus }` | 自定义下拉刷新主体；`loading` / `complete` 等状态同样走这里，用 `refresherStatus` 区分 |
| `refresherF2` | 无 | 达到二楼阈值时的提示 |
| `f2` | 无 | 二楼完整内容 |

::: tip
不再提供独立的 `refresherComplete` 插槽。刷新完成态也由 `refresher` 插槽渲染，通过作用域参数区分：

```vue
<template #refresher="{ refresherStatus }">
  <view v-if="refresherStatus === 'loading'">正在刷新...</view>
  <view v-else-if="refresherStatus === 'complete'">刷新完成</view>
  <view v-else>继续下拉刷新</view>
</template>
```
:::

## 加载更多

| 插槽 | 作用域参数 | 说明 |
| --- | --- | --- |
| `loadingMoreDefault` | 无 | 默认状态 |
| `loadingMoreLoading` | 无 | 加载中状态 |
| `loadingMoreNoMore` | 无 | 无更多状态 |
| `loadingMoreFail` | 无 | 加载失败状态 |

## 聊天状态

| 插槽 | 作用域参数 | 说明 |
| --- | --- | --- |
| `chatLoading` | `{ loadingMoreStatus }` | 历史消息加载状态 |
| `chatNoMore` | 无 | 无更多历史消息 |

## 内置虚拟列表

| 插槽 | 作用域参数 | 说明 |
| --- | --- | --- |
| `cell` | `{ item, index }` | 内置虚拟列表 cell |
| `header` | 无 | 内置虚拟列表头部 |
| `footer` | 无 | 内置虚拟列表尾部 |

::: warning 微信端建议
`cell`、`header`、`footer` 是兼容入口。微信端推荐 `force-close-inner-list`，通过 `virtual-list-change` 获取窗口数据，再在默认插槽中 `v-for`。详见[虚拟列表](../advanced/virtual-list)。
:::

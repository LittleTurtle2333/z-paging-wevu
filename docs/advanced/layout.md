# 顶部、底部与左右布局

组件提供 `#top`、`#bottom`、`#left`、`#right` 插槽，用于固定导航、筛选区、输入框或侧栏。

## 顶部与底部

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
  :fixed="true"
  :fixed-top="navbarHeight"
>
  <template #top>
    <view class="filters">筛选条件</view>
  </template>

  <view v-for="item in items" :key="item.id">{{ item.title }}</view>

  <template #bottom>
    <view class="composer">底部操作区</view>
  </template>
</ZPagingWevu>
```

顶部插槽的固定行为见[滚动与布局模式](../guide/scroll-modes)。底部插槽位于滚动区外，适合聊天输入框和固定操作栏。

## 左右插槽

```vue
<ZPagingWevu>
  <template #left><view class="left-rail" /></template>
  <template #right><view class="right-rail" /></template>
  <view>中间列表</view>
</ZPagingWevu>
```

尺寸变化后调用：

```ts
paging.updateLeftAndRightWidth()
paging.updateFixedLayout()
```

分别更新侧栏宽度和整体固定布局。

## 页面滚动高度同步

顶部或底部内容尺寸动态变化时：

```ts
paging.updatePageScrollTopHeight()
paging.updatePageScrollBottomHeight()
```

组件使用 wevu 的 `useSelectorQuery` 在自身组件作用域内测量，不应改成全局 `wx.createSelectorQuery()` 跨组件查询。

## 样式入口

- `paging-style` / `paging-class`：组件根节点。
- `paging-content-style` / `paging-content-class`：列表内容节点。
- `bg-color`：根背景。
- `bg-color-content`：内容背景。
- `bottom-bg-color`：底部插槽背景。
- `height` / `width` / `max-width`：根尺寸。

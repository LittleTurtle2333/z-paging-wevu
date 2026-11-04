# 空态与返回顶部

## 自动空态

列表为空且首次加载结束后，组件自动显示空态：

```vue
<ZPagingWevu
  empty-view-text="暂无订单"
  empty-view-error-text="订单加载失败"
  empty-view-img="/static/empty.png"
  empty-view-error-img="/static/error.png"
  show-empty-view-reload
  show-empty-view-reload-when-error
/>
```

- `hide-empty-view`：完全关闭自动空态。
- `empty-view-fixed`：固定空态位置。
- `empty-view-center`：居中显示，默认开启。
- `empty-view-super-style`：自定义外层样式。

## 自定义空态

```vue
<ZPagingWevu>
  <template #empty="{ isLoadFailed }">
    <view>
      {{ isLoadFailed ? '加载失败' : '暂无内容' }}
      <button @click="paging.reload()">重新加载</button>
    </view>
  </template>
</ZPagingWevu>
```

也可以监听 `empty-view-reload` 拦截默认重载。事件参数是回调，调用 `callback(false)` 可阻止默认行为；不拦截时直接调用 `paging.reload()` 更简单。

## 请求失败

```ts
try {
  const page = await requestPage()
  await paging.complete(page)
}
catch (error) {
  await paging.completeByError(error instanceof Error ? error.message : '加载失败')
}
```

`auto-clean-list-when-reload-error` 默认开启，reload 失败时会清空列表；需要保留旧数据时关闭它。

## 返回顶部

```vue
<ZPagingWevu
  auto-show-back-to-top
  :back-to-top-threshold="200"
  :back-to-top-with-animate="true"
  :back-to-top-bottom="80"
  back-to-top-img="/static/back-top.png"
/>
```

自定义按钮：

```vue
<template #backToTop>
  <view class="back-top">顶部</view>
</template>
```

主动滚动：

```ts
paging.scrollToTop(true)
```

`back-to-top-click` 同样提供可拦截回调；普通场景无需监听，组件会自动执行返回顶部。

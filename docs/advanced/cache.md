# 缓存

缓存用于页面再次进入时快速恢复列表，减少空白等待。

## 开启缓存

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
  use-cache
  cache-key="order-list"
  @query="queryList"
/>
```

`cache-key` 应是稳定且唯一的业务标识。不同列表不要共用同一个 key。

## 缓存内容

组件将当前列表保存到微信 Storage，内部 key 前缀为：

```text
z-paging-wevu-cache-
```

下拉刷新最后更新时间使用另一个前缀：

```text
z-paging-wevu-update-time-
```

这些是内部存储格式，不建议业务代码直接依赖。

## 手动更新

列表在组件外发生变化后，可调用：

```ts
paging.updateCache()
```

只有同时开启 `use-cache` 并提供 `cache-key` 时，缓存才有意义。

## 刷新时间

```vue
<ZPagingWevu
  show-refresher-update-time
  refresher-update-time-key="order-list"
/>
```

组件默认通过 `HH:mm:ss` 文本展示最后更新时间，可配合自定义刷新插槽调整展示方式。

## 清理策略

登出、切换账号或列表权限变化时，应使用新的 `cache-key`，或在业务层清理对应 Storage，避免把上一账号的缓存展示给当前用户。

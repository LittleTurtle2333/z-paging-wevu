# 本地分页

本地分页把完整数组交给组件，由组件根据 `default-page-no` 和 `default-page-size` 截取当前页，无需在 `@query` 中请求服务器。

## 设置完整数据

```ts
const allItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  title: `本地数据 ${index + 1}`,
}))

await paging.setLocalPaging(allItems)
```

组件会展示第一页，后续触底加载下一页，并在全部数据展示完后进入无更多状态。

## 主动加载下一页

```ts
paging.doLoadMore('toBottom')
```

也可以设置为点击加载：

```ts
paging.doLoadMore('click')
```

## 与刷新配合

刷新时调用：

```ts
await paging.reload()
```

如果 `@query` 仍绑定网络请求，需要避免网络结果和本地分页结果被同时提交。使用本地分页的页面通常不再手动处理 `@query`，或在刷新时重新调用 `setLocalPaging(fullList)`。

## 更新完整数据

搜索、筛选或排序后，用新的完整数组重新设置：

```ts
await paging.setLocalPaging(filteredItems)
```

不要只传当前页，否则组件无法继续计算后续页和无更多状态。

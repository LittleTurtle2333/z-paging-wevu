# 常见问题

## 页面没有发起请求

按顺序检查：

1. `auto` 是否为 `true`，或是否主动调用了 `reload()`。
2. 是否同时设置了 `layout-only=true`。
3. 是否把组件放进额外的布局组件默认插槽。部分 wevu 布局包装会让插槽内组件的 `onMounted` 自动请求静默丢失，建议导航栏、分页组件和安全区平铺组合。
4. `@query` 是否绑定到正确方法。

## 请求成功但一直显示加载中

每个请求分支都必须结束于 `complete`、`completeByKey`、`completeByTotal`、`completeByNoMore`，或失败时的 `complete(false)`。`try/catch` 的异常分支也要处理。

## `@query` 得到的 `pageNo` 不是数字

回调参数需要数组解构：

```ts
function queryList([pageNo, pageSize, from]: [number, number, string]) {}
```

## 列表渲染了，但不能滚动或没有触底事件

整屏模式需要确定的 `scroll-view` 高度。设置 `fixed=true`，检查 `fixed-top` 是否传入了正确导航栏高度，并避免父容器覆盖组件计算出的高度。

## 虚拟列表没有内容

微信端同时使用：

- `use-virtual-list`
- `force-close-inner-list`
- `@virtual-list-change`
- 页面默认插槽中的 `v-for`
- cell id：`zp-id-${item.zp_index}`

只设置 `use-virtual-list` 不会自动让页面默认插槽切换到虚拟数据。

## `updateCell` / `deleteCell` 为什么没改业务数据

`didUpdateVirtualListCell(index)` 只更新对应高度缓存，`didDeleteVirtualListCell(index)` 只删除并重排高度缓存，`updateVirtualListRender()` 只重新计算渲染窗口。业务数据的新增、修改和删除仍由页面完成，然后再调用这些方法同步测量状态。

## 聊天消息文字上下颠倒

为每条消息的外层元素添加：

```css
transform: scaleY(-1);
```

## 修改 props 后布局没有更新

当前 wevu 对布局相关 `computed` 的依赖更新存在差异。组件内部布局使用 CSS 变量和模板表达式；业务侧动态布局也应优先采用这种方式，不要依赖只在初始化时读取 props 的常量。

## 构建时报 `mergeDefaults` 不存在

`withDefaults` 的默认值对象被移出了 SFC。把默认值字面量移回组件 `index.vue`，props 类型仍可放在 `props.ts`。

## 是否支持 nvue

不支持 nvue 专属渲染。相关方法只用于减少迁移时的调用错误，不代表功能已经实现。

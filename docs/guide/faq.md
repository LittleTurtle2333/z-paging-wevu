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

两种写法任选其一：

**内置列表**（组件负责 `v-for`）：

- `use-virtual-list`
- 默认插槽或 `#cell` 插槽提供 cell 内容
- 可选 `#header` / `#footer`

**非内置列表**（页面负责 `v-for`）：

- `use-virtual-list` + `force-close-inner-list`
- 监听 `@virtual-list-change`，用返回的窗口数组在默认插槽里 `v-for`
- cell 的 DOM id 必须是 `zp-id-${item.zp_index}`，`:key` 用 `item.zp_index`

两种写法都必须通过 `@query` / `paging.complete()` 提交数据，只设置 `use-virtual-list` 不会有任何内容。

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

## 下拉后不松手往回推，列表会跟着动

已经修掉了。`scroll-view` 模式改为组件自己接管手势：确认是下拉手势后 `touchmove` 返回 `false`，
整个手势不再冒泡、也不会让 `scroll-view` 原生滚动，因此在松手前列表是锁死的。
不再使用 `scroll-view` 原生 refresher，正是因为那一段回推由原生接管、逻辑层拦不住。
细节见[下拉刷新与二楼](../advanced/custom-refresher)。

## 自定义下拉刷新的文案/位移不跟随手指变化

这类问题基本都出在 WXS 里用了不支持的语法，最常见的是 `try/catch`：
它会被编译成对 `nv_try` 的调用并在运行时抛 `nv_try is not defined`，整个 `touchmove` / `touchend` 直接中断，
表现为「能拉动，但文案不切换、松手也不回弹」。控制台如果出现 `nv_* is not defined`，
就是 WXS 里还有不支持的写法。约束清单见[下拉刷新与二楼](../advanced/custom-refresher)。

## PC 微信（Mac / Windows）里下拉刷新没反应

PC 端没有手指下拉手势，`scroll-view` 的原生 refresher 用鼠标拖拽不会触发。组件检测到平台为 `mac` / `windows` 时会自动回退到自定义刷新，鼠标拖拽即可触发；真机与开发者工具模拟器（`platform` 为 `devtools`）不受影响。如果 PC 端不需要刷新，设置 `refresher-enabled="false"` 即可。

## 是否支持 nvue、App 或 H5

不适用。本项目是微信小程序组件，不是 uni-app 项目，只有小程序这一个平台；原版文档中的 nvue、App、H5 能力在这里没有对应实现。`setListSpecialEffects`、`setSpecialEffects` 只为减少迁移时的调用错误保留为空方法，调用不会产生任何效果。

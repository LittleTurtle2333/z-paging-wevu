# Methods

通过控制器调用公开方法：

```ts
import { createPagingController } from 'z-paging-wevu/controller'

const paging = createPagingController()
```

```vue
<ZPagingWevu :controller="paging" v-model="items" />
```

## 查询与结果提交

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `reload` | `(animate?: boolean) => Promise<Result>` | 回到起始页并重新加载 |
| `refresh` | `() => Promise<Result>` | 按当前状态刷新并替换数据 |
| `refreshToPage` | `(page: number) => Promise<Result>` | 刷新到指定页 |
| `complete` | `(data?: unknown, success?: boolean) => Promise<Result>` | 提交数组、响应对象或失败状态 |
| `completeByKey` | `(data, key?, success?) => Promise<Result>` | 按数据 key 提交结果 |
| `completeByNoMore` | `(data, noMore: boolean, success?) => Promise<Result>` | 显式指定是否无更多 |
| `completeByTotal` | `(data, total?: number, success?) => Promise<Result>` | 按总数计算无更多 |
| `completeByError` | `(message?: string) => Promise<Result>` | 提交失败与错误文本 |
| `setLocalPaging` | `(data, success?) => Promise<Result>` | 设置本地分页完整数组 |
| `clean` / `clear` | `() => void` | 清空列表与分页状态 |
| `updateCache` | `() => void` | 更新当前列表缓存 |

`Result` 类型：

```ts
interface ZPagingWevuResult<T = unknown> {
  totalList: T[]
  noMore: boolean
}
```

## 列表数据

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `addDataFromTop` | `(data, scrollToTop?, animate?) => void` | 从顶部添加数据 |
| `addChatRecordData` | `(data, scrollToBottom?, animate?) => void` | 追加聊天消息 |
| `doInsertVirtualListItem` | `(data, index: number) => void` | 插入虚拟列表项 |

## 刷新与加载更多

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `endRefresh` | `() => void` | 结束刷新状态 |
| `updateCustomRefresherHeight` | `() => void` | 更新自定义刷新区域高度 |
| `closeF2` | `() => void` | 关闭二楼 |
| `doLoadMore` | `(type?: 'click' \| 'toBottom') => void` | 主动加载更多 |
| `pageReachBottom` | `() => void` | 页面触底时调用 |
| `doChatRecordLoadMore` | `() => void` | 加载聊天历史记录 |

## 滚动

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `scrollToTop` | `(animate?: boolean) => void` | 滚动到顶部 |
| `scrollToBottom` | `(animate?: boolean) => void` | 滚动到底部 |
| `scrollToY` | `(y, offset?, animate?) => void` | 滚动到纵向位置 |
| `scrollToX` | `(x, offset?, animate?) => void` | 滚动到横向位置 |
| `scrollIntoViewById` | `(id, offset?, animate?) => void` | 滚动到指定节点 id |
| `scrollIntoViewByIndex` | `(index, offset?, animate?) => void` | 滚动到指定数据索引 |
| `scrollIntoViewByNodeTop` | `(top, offset?, animate?) => void` | 按节点顶部位置滚动 |
| `scrollIntoViewByView` | `(view, offset?, animate?) => void` | 滚动到选择器对应视图 |

虚拟列表 cell id 为 `zp-id-${zp_index}`。

## 虚拟列表测量

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `didUpdateVirtualListCell` | `(index: number) => void` | 更新指定 cell 的高度缓存 |
| `didDeleteVirtualListCell` | `(index: number) => void` | 删除并重排高度缓存 |
| `updateVirtualListRender` | `() => void` | 重新计算可见渲染窗口 |

这些方法不修改业务数组。先修改数据，再调用对应方法。

## 布局与页面状态

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `updatePageScrollTop` | `(scrollTop: number) => void` | 同步页面滚动位置 |
| `updatePageScrollTopHeight` | `() => void` | 更新顶部区域高度 |
| `updatePageScrollBottomHeight` | `() => void` | 更新底部区域高度 |
| `updateLeftAndRightWidth` | `() => void` | 更新左右插槽宽度 |
| `updateFixedLayout` | `() => void` | 更新固定布局 |
| `addKeyboardHeightChangeListener` | `() => void` | 注册键盘高度监听 |

## 兼容入口

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `getVersion` | `() => string` | 返回兼容实现版本标识 |
| `setListSpecialEffects` | `(value: unknown) => void` | nvue 兼容空操作 |
| `setSpecialEffects` | `(value: unknown) => void` | nvue 兼容空操作 |

::: warning
两个 `set*SpecialEffects` 方法不实现 nvue 特效，只为迁移时保留调用入口。
:::

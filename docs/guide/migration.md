# 从 z-paging 迁移

本项目尽量保留 z-paging 的 Props、Methods、Events 和 Slots 命名，但 wevu 与 uni-app 的运行时差异需要显式修改调用方式。

## 替换组件与控制器

先按[安装与快速开始](./getting-started#配置-sfc-解析器)注册 `ZPagingWevuResolver()`。之后模板会自动识别 `<ZPagingWevu>`，页面脚本只需导入控制器：

```diff
- import ZPaging from 'z-paging'
+ import { createPagingController } from 'z-paging-wevu/controller'

+ const paging = createPagingController()
```

```diff
- <z-paging ref="paging" v-model="items" @query="queryList">
+ <ZPagingWevu v-model="items" :controller="paging" @query="queryList">
```

控制器也可以通过 `paging.value` 使用；它始终代理当前已绑定组件的方法。

## 修改查询回调签名

```diff
- function queryList(pageNo, pageSize, from) {
+ function queryList([pageNo, pageSize, from]) {
    paging.complete(page)
  }
```

这是 wevu 多参数事件合并为数组所导致的必要调整。

## 修改数据 key

微信小程序中改用 `paging-data-key`：

```diff
- <ZPagingWevu data-key="order-list" />
+ <ZPagingWevu paging-data-key="order-list" />
```

类型上仍保留 `dataKey` 作为兼容入口，但微信模板推荐只使用 `paging-data-key`，避免与原生 `data-*` 属性冲突。

## 修改虚拟列表渲染

微信验收路径使用非内置列表：

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
  use-virtual-list
  force-close-inner-list
  @virtual-list-change="virtualItems = $event"
>
  <view
    v-for="item in virtualItems"
    :id="`zp-id-${item.zp_index}`"
    :key="item.zp_index"
  >
    {{ item.title }}
  </view>
</ZPagingWevu>
```

逐 cell scoped-slot 的内置写法不是当前微信端的推荐验收路径。完整说明见[虚拟列表](../advanced/virtual-list)。

## 聊天消息恢复方向

聊天模式会翻转列表容器，业务消息项必须反向恢复：

```css
.chat-item {
  transform: scaleY(-1);
}
```

## 默认值不要外移

修改组件源码时，`withDefaults(defineProps(), { ... })` 的默认对象必须内联保留在 SFC 中。外移默认值会引入 `mergeDefaults`，而当前 wevu 运行时不支持该辅助函数。

## 不支持项

不要依据官方 nvue 文档推断本项目支持 WXS、renderjs 或 nvue 专属特效。`setListSpecialEffects` 和 `setSpecialEffects` 仅保留无操作兼容入口。

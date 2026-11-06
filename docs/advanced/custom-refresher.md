# 自定义下拉刷新与二楼

## 内置刷新

默认使用 `scroll-view` 原生 refresher：

```vue
<ZPagingWevu
  :fixed="true"
  :refresher-enabled="true"
  :refresher-threshold="40"
  refresher-default-text="继续下拉刷新"
  refresher-pulling-text="松开立即刷新"
  refresher-refreshing-text="正在刷新..."
  @refresher-status-change="onStatusChange"
/>
```

页面滚动模式下，原生页面下拉刷新需要通过页面生命周期调用 `paging.reload()`。

## 自定义刷新

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
  :fixed="true"
  use-custom-refresher
  :refresher-threshold="80"
  :refresher-complete-duration="300"
  @query="queryList"
>
  <template #refresher="{ refresherStatus }">
    <view>当前状态：{{ refresherStatus }}</view>
  </template>
  <template #refresherComplete>
    <view>刷新完成</view>
  </template>
</ZPagingWevu>
```

状态包括：

- `default`：默认或继续下拉。
- `release-to-refresh`：松开即可刷新。
- `loading`：正在刷新。
- `complete`：刷新完成。
- `go-f2`：已达到进入二楼阈值。

启用 `watch-refresher-touchmove` 后，可监听触摸过程中的距离和视图高度。

## 二楼 F2

```vue
<ZPagingWevu
  use-custom-refresher
  refresher-f2-enabled
  :refresher-f2-threshold="160"
  :refresher-f2-duration="200"
>
  <template #refresherF2>
    <view>松手进入活动页</view>
  </template>
  <template #f2>
    <view class="campaign-page">
      <view @click="paging.closeF2()">关闭</view>
      活动二楼内容
    </view>
  </template>
</ZPagingWevu>
```

关闭二楼：

```ts
paging.closeF2()
```

监听显示状态：

```vue
<ZPagingWevu @refresher-f2-change="visible = $event" />
```

## 结束与测量

```ts
paging.endRefresh()
paging.updateCustomRefresherHeight()
```

通常在自定义异步流程结束时调用 `endRefresh()`；刷新内容尺寸变化后调用 `updateCustomRefresherHeight()`。

## 默认状态图标与自定义图片

未配置图片时，`default` 显示向下箭头，`release-to-refresh` 和 `go-f2` 显示向上箭头，`loading` 显示旋转加载图标，与 uni-app 版的刷新状态表达一致。`refresher-refreshing-animated="false"` 可关闭加载图标的旋转动画。

各阶段可通过 `refresher-default-img`、`refresher-pulling-img`、`refresher-refreshing-img`、`refresher-complete-img` 设置图片；自定义图片会替代对应状态的内置图标。文本既支持字符串，也支持 `{ 'zh-Hans': '...', en: '...' }`。

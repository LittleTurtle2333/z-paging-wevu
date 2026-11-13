# 自定义下拉刷新与二楼

## 内置刷新（推荐）

默认使用 `scroll-view` 原生 refresher，下拉位移由视图层提供，跟手性最好：

```vue
<ZPagingWevu
  :fixed="true"
  :refresher-enabled="true"
  :refresher-threshold="40"
  @refresher-status-change="onStatusChange"
/>
```

原生模式下微信只绘制自己的指示器，`refresher-default-text` 等文案不会生效。需要「继续下拉刷新 / 松开立即刷新 / 正在刷新...」这类文案时，把 `refresher-default-style` 设为 `none`：

```vue
<ZPagingWevu
  :refresher-threshold="48"
  refresher-default-style="none"
  refresher-default-text="继续下拉刷新"
  refresher-pulling-text="松开立即刷新"
  refresher-refreshing-text="正在刷新..."
  @refresher-status-change="onStatusChange"
/>
```

此时组件关闭微信默认刷新区域，改为在内容顶部自绘一条与 `refresher-threshold` 等高的文案层，由原生下拉位移带出：位移不经过 `setData`，与手指 1:1 跟手，下拉过程中也不会推出超过阈值高度的空白。状态切换通过 `bindrefresherpulling` 的 `dy` 判定，刷新结束后自动复位。

需要「刷新成功」完成态时设置 `refresher-complete-delay`（大于 0，例如 `600`）：该模式下组件会在延迟期间保持 `refresher-triggered`，展示完成图标与 `refresher-complete-text` 后再收起原生刷新区域。

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
    <view v-if="refresherStatus === 'complete'">刷新完成</view>
    <view v-else>当前状态：{{ refresherStatus }}</view>
  </template>
</ZPagingWevu>
```

该模式在逻辑层按 `refresherPullRate` / `refresherOutRate` 逐帧计算高度，高频拖动时会落后于手指，且高度随拖拽持续增长。仅在需要完全自绘（二楼、图片、非矩形刷新区）时使用。

几点实现约定：

- 刷新区高度在挂载后会实测自定义视图的自然高度：拖动阶段上限取「视图高度 / 二楼阈值 + 阈值」二者较大值，刷新态直接撑到视图高度，避免自定义内容被裁成一条。
- 拖动阶段不加高度过渡（保证跟手）；`loading` / `complete` 阶段才有动画。
- 刷新完成后先保持 `complete` 展示 `refresher-complete-delay`，再用 `refresher-complete-duration` 缓慢收起。

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

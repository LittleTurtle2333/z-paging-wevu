# 下拉刷新与二楼

## scroll-view 模式：默认就是 WXS 下拉刷新

`scroll-view` 模式下默认使用组件自带的下拉刷新，位移由 WXS 在视图层直接写，不经过 `setData`：

```vue
<ZPagingWevu
  :refresher-threshold="48"
  refresher-default-text="继续下拉刷新"
  refresher-pulling-text="松开立即刷新"
  refresher-refreshing-text="正在刷新..."
  @refresher-status-change="onStatusChange"
/>
```

不再使用 `scroll-view` 原生 refresher 的原因：原生模式下「下拉后不松手往回推」会连带把列表滚上去，
这一段滚动由原生接管，逻辑层和 WXS 都拦不住。自己接管手势（`touchmove` 返回 `false`）才能锁住列表。

行为说明：

- 刷新区高度取 `refresher-threshold`；使用自定义插槽时取实测自然高度（不低于该值）
- 拖动阶段位移不设上限，超过阈值后按 `refresher-out-rate` 阻尼继续增长，和原版一致可以一直往下拉
- 刷新态撑到刷新区完整高度；完成后先保持 `refresher-complete-delay` 展示完成态，再用 `refresher-complete-duration` 收起
- `use-custom-refresher` 现在是兼容字段（`scroll-view` 模式下恒启用）；页面滚动模式、`layout-only`、聊天记录模式不受影响
- PC 微信（Mac / Windows）没有手指下拉手势，原生 refresher 用鼠标触发不了，同样走这条路

## 完全自绘刷新视图

```vue
<ZPagingWevu
  v-model="items"
  :controller="paging"
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

插槽里可以拿到实时状态：`default` / `release-to-refresh` / `loading` / `complete` / `go-f2`。

## 实现约定

- **位移**：WXS 直接 `setStyle` 写 `.z-paging-wevu__body` 的 `transform`。松手后的回收或停留在刷新中高度，
  由逻辑层通过属性观察器下发 `位移:过渡时长:序号` 指令，仍然由 WXS 写同一层样式
  （`setStyle` 的优先级高于模板 style，逻辑层直接改 style 清不掉 WXS 写的位移）。
- **状态**：跨阈值时 WXS 通过 `callMethod('handleWxsPullStatus')` 通知逻辑层，按实例 id 路由
  （一个页面有多个分页组件时互不干扰），用来驱动内置文案、自定义插槽、二楼提示、震动与 `refresher-touchmove`。
- **滚动锁**：确认是下拉手势后 `touchmove` 返回 `false`，整个手势不再冒泡、也不再让 `scroll-view` 原生滚动；
  同时把 `scroll-y` 置为 `false` 兜底。
- **WXS 语法限制**（踩过坑，务必遵守）：
  - **不能用 `try/catch`**：会被编译成对 `nv_try` 的调用，运行时抛 `nv_try is not defined`，整个 handler 中断
  - 不要用 `Number()` / `parseFloat()`，用 `value * 1` 转数字
  - 不支持 `let/const`、箭头函数、模板字符串、可选链
  - 页面 `setData` 之后 WXS 里缓存的节点引用会失效，每次写 style 前重新 `selectComponent`
- **页面滚动模式**：手势由逻辑层按 `refresher-fps`（默认 40）节流处理，原生页面下拉刷新需要通过页面生命周期调用 `paging.reload()`。

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

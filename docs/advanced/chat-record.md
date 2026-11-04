# 聊天记录模式

聊天模式将较新的消息放在列表底部，并提供历史消息加载、追加消息和键盘适配。

## 基础配置

```vue
<ZPagingWevu
  v-model="messages"
  :controller="paging"
  :fixed="true"
  use-chat-record-mode
  auto-to-bottom-when-chat
  :auto-hide-keyboard-when-chat="true"
  :auto-adjust-position-when-chat="true"
  @query="queryHistory"
>
  <view
    v-for="message in messages"
    :key="message.id"
    class="message-item"
  >
    {{ message.text }}
  </view>
</ZPagingWevu>
```

```css
.message-item {
  transform: scaleY(-1);
}
```

::: tip 为什么消息要再次翻转
聊天容器使用反向布局保持滚动位置，消息项必须通过 `scaleY(-1)` 恢复正常文字方向，否则文字会上下颠倒。
:::

## 加载历史消息

历史记录通常添加到列表顶部：

```ts
async function queryHistory([pageNo, pageSize]: [number, number, string]) {
  const history = await requestHistory({ pageNo, pageSize })
  await paging.completeByNoMore(history, history.length < pageSize)
}
```

也可以使用：

```ts
paging.doChatRecordLoadMore()
```

主动触发历史消息加载。不要在加载完成后自行重写 `messages.value`，仍由 `complete` 系列方法提交。

## 追加新消息

```ts
paging.addChatRecordData(
  { id: Date.now(), text: '你好' },
  true,  // 是否滚动到底部
  true,  // 是否使用动画
)
```

从顶部添加通用数据可使用：

```ts
paging.addDataFromTop(data, false, true)
```

## 键盘

`auto-hide-keyboard-when-chat` 控制点击聊天内容时是否收起键盘；`auto-adjust-position-when-chat` 控制键盘弹出时是否调整位置。

```ts
paging.addKeyboardHeightChangeListener()
```

组件卸载时会移除已注册的键盘监听。页面可监听：

```vue
<ZPagingWevu
  @keyboard-height-change="onKeyboardHeightChange"
  @hided-keyboard="onKeyboardHidden"
/>
```

## 展示配置

- `chat-adjust-position-offset`：键盘位置调整偏移，默认 `0px`。
- `show-chat-loading-when-reload`：reload 时显示聊天加载状态。
- `chat-loading-more-default-as-loading`：默认状态也展示为加载中。
- `#chatLoading`：自定义历史消息加载内容，作用域参数为 `loadingMoreStatus`。
- `#chatNoMore`：自定义无更多历史消息内容。

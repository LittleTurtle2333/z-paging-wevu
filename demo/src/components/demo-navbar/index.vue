<script setup lang="ts">
/**
 * 极简自定义导航栏（不依赖 uView 等 UI 库）。
 * 结构：状态栏占位 + 与胶囊等高的标题栏；默认插槽可完全自定义中间内容。
 */
const props = withDefaults(defineProps<{
  title?: string
  isBack?: boolean
  background?: string
  titleColor?: string
}>(), {
  title: '',
  isBack: true,
  background: '#ffffff',
  titleColor: '#000000',
})

let statusBarHeight = 20
let windowWidth = 375
let menuRect: { left?: number, top?: number, height?: number } | null = null

try {
  const info = wx.getWindowInfo()
  statusBarHeight = info.statusBarHeight || 20
  windowWidth = info.windowWidth || 375
}
catch {
  statusBarHeight = 20
}

try {
  menuRect = wx.getMenuButtonBoundingClientRect()
}
catch {
  menuRect = null
}

/** 标题栏高度与胶囊保持一致（上下留白对称） */
const navBarHeight = menuRect?.height
  ? (menuRect.top ?? statusBarHeight) - statusBarHeight + (menuRect.height)
  : 44

/** 右侧给胶囊按钮让位，避免自定义内容被遮挡 */
const capsuleSpace = menuRect?.left
  ? Math.max(0, windowWidth - menuRect.left) + 8
  : 0

function goBack() {
  if (!props.isBack) {
    return
  }
  const pages = getCurrentPages()
  if (pages.length > 1) {
    wx.navigateBack()
    return
  }
  wx.reLaunch({ url: '/pages/index/index' })
}
</script>

<template>
  <view
    class="demo-navbar"
    :style="{ background, paddingTop: `${statusBarHeight}px` }"
  >
    <view
      class="demo-navbar__content"
      :style="{ height: `${navBarHeight}px`, paddingRight: `${capsuleSpace}px` }"
    >
      <view v-if="isBack" class="demo-navbar__back" @click="goBack">
        <text class="demo-navbar__back-icon">‹</text>
      </view>
      <view class="demo-navbar__center">
        <slot>
          <text class="demo-navbar__title" :style="{ color: titleColor }">
            {{ title }}
          </text>
        </slot>
      </view>
    </view>
  </view>
</template>

<style scoped>
.demo-navbar {
  width: 100%;
  box-sizing: border-box;
}

.demo-navbar__content {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 24rpx;
}

.demo-navbar__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 100%;
}

.demo-navbar__back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #333333;
}

.demo-navbar__center {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.demo-navbar__title {
  font-size: 32rpx;
  font-weight: bold;
}
</style>

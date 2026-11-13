<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  background?: string
  titleColor?: string
  isBack?: boolean
}>(), {
  title: '',
  background: '#ffffff',
  titleColor: '#000000',
  isBack: true,
})

let statusBarHeight = 0
try {
  statusBarHeight = wx.getWindowInfo().statusBarHeight || 0
}
catch {
  statusBarHeight = 0
}

function goBack() {
  if (!props.isBack) {
    return
  }
  wx.navigateBack()
}
</script>

<template>
  <view class="demo-navbar" :style="{ background: background }">
    <view :style="{ height: `${statusBarHeight}px` }" />
    <view class="demo-navbar__content">
      <text v-if="isBack" class="demo-navbar__back" @click="goBack">
        ‹
      </text>
      <text class="demo-navbar__title" :style="{ color: titleColor }">
        {{ title }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.demo-navbar {
  width: 100%;
}

.demo-navbar__content {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 30rpx;
}

.demo-navbar__back {
  position: absolute;
  left: 24rpx;
  font-size: 44rpx;
  line-height: 1;
}

.demo-navbar__title {
  font-size: 32rpx;
  font-weight: bold;
}
</style>

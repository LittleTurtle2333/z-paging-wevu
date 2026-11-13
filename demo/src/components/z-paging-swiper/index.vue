<script setup lang="ts">
import { getWindowMetrics } from '../z-paging-wevu/window'

interface ZPagingSwiperProps {
  fixed?: boolean
  safeAreaInsetBottom?: boolean
  fixedTop?: number
  swiperStyle?: Record<string, string | number>
}

withDefaults(defineProps<ZPagingSwiperProps>(), {
  fixed: true,
  safeAreaInsetBottom: false,
  fixedTop: 0,
  swiperStyle: () => ({}),
})
const metrics = getWindowMetrics()
function updateLeftAndRightWidth() {}
defineExpose({ updateLeftAndRightWidth })
</script>

<template>
  <view class="zp-swiper-container" :class="{ 'zp-swiper-container-fixed': fixed }" :style="[`--zp-swiper-top:${fixedTop}px;--zp-swiper-bottom:${safeAreaInsetBottom ? metrics.safeAreaInsetBottom : 0}px;`, swiperStyle]">
    <view class="zp-swiper-top"><slot name="top" /></view>
    <view class="zp-swiper-super">
      <view class="zp-swiper-left"><slot name="left" /></view>
      <view class="zp-swiper"><slot /></view>
      <view class="zp-swiper-right"><slot name="right" /></view>
    </view>
    <view class="zp-swiper-bottom"><slot name="bottom" /></view>
  </view>
</template>

<style scoped>
.zp-swiper-container { display: flex; flex: 1; flex-direction: column; }
.zp-swiper-container-fixed { position: fixed; top: var(--zp-swiper-top, 0px); right: 0; bottom: var(--zp-swiper-bottom, 0px); left: 0; width: auto; height: auto; }
.zp-swiper-super { position: relative; display: flex; flex: 1; flex-direction: row; overflow: hidden; }
.zp-swiper-left, .zp-swiper-right { flex-shrink: 0; height: 100%; }
.zp-swiper { flex: 1; width: 100%; height: 100%; }
</style>

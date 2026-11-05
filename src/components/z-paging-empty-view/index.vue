<script setup lang="ts">
interface ZPagingEmptyViewProps {
  emptyViewText?: string
  emptyViewImg?: string
  showEmptyViewReload?: boolean
  emptyViewReloadText?: string
  isLoadFailed?: boolean
  emptyViewStyle?: Record<string, string | number>
  emptyViewImgStyle?: Record<string, string | number>
  emptyViewTitleStyle?: Record<string, string | number>
  emptyViewReloadStyle?: Record<string, string | number>
  emptyViewZIndex?: number
  emptyViewFixed?: boolean
  unit?: 'rpx' | 'px'
}

withDefaults(defineProps<ZPagingEmptyViewProps>(), {
  emptyViewText: '没有数据哦~',
  emptyViewImg: '',
  showEmptyViewReload: false,
  emptyViewReloadText: '重新加载',
  isLoadFailed: false,
  emptyViewStyle: () => ({}),
  emptyViewImgStyle: () => ({}),
  emptyViewTitleStyle: () => ({}),
  emptyViewReloadStyle: () => ({}),
  emptyViewZIndex: 9,
  emptyViewFixed: true,
  unit: 'rpx',
})

const emit = defineEmits<{
  (e: 'reload'): void
  (e: 'viewClick'): void
  (e: 'view-click'): void
}>()

function handleReload() {
  emit('reload')
}

function handleViewClick() {
  emit('viewClick')
  emit('view-click')
}
</script>

<template>
  <view
    class="zp-container"
    :class="{ 'zp-container-fixed': emptyViewFixed }"
    :style="[emptyViewStyle, { zIndex: emptyViewZIndex }]"
    @click="handleViewClick"
  >
    <view class="zp-main">
      <image
        v-if="emptyViewImg"
        class="zp-main-image"
        :class="`zp-main-image-${unit}`"
        mode="aspectFit"
        :style="emptyViewImgStyle"
        :src="emptyViewImg"
      />
      <view v-else class="zp-main-placeholder" :class="{ 'zp-main-placeholder--error': isLoadFailed }">
        {{ isLoadFailed ? '!' : '·' }}
      </view>
      <text
        class="zp-main-title"
        :class="`zp-main-title-${unit}`"
        :style="emptyViewTitleStyle"
      >
        {{ emptyViewText }}
      </text>
      <text
        v-if="showEmptyViewReload"
        id="z-paging-empty-view-reload"
        class="zp-main-error-btn"
        :class="`zp-main-error-btn-${unit}`"
        :style="emptyViewReloadStyle"
        @click.stop="handleReload"
      >
        {{ emptyViewReloadText }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.zp-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.zp-container-fixed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.zp-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50rpx 0;
}

.zp-main-image-rpx {
  width: 240rpx;
  height: 240rpx;
}

.zp-main-image-px {
  width: 120px;
  height: 120px;
}

.zp-main-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  color: #8a8f98;
  font-size: 88rpx;
  line-height: 1;
  background: #f2f3f5;
  border-radius: 50%;
}

.zp-main-placeholder--error {
  color: #c45b5b;
  background: #fff1f1;
}

.zp-main-title {
  color: #aaaaaa;
  text-align: center;
}

.zp-main-title-rpx {
  margin-top: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.zp-main-title-px {
  margin-top: 5px;
  padding: 0 10px;
  font-size: 14px;
}

.zp-main-error-btn {
  color: #aaaaaa;
  border: 1px solid #dddddd;
}

.zp-main-error-btn-rpx {
  padding: 8rpx 24rpx;
  margin-top: 50rpx;
  font-size: 28rpx;
  border-radius: 6rpx;
}

.zp-main-error-btn-px {
  padding: 4px 12px;
  margin-top: 25px;
  font-size: 14px;
  border-radius: 3px;
}
</style>

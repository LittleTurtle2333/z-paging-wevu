<script setup lang="ts">
import { ref, watch } from 'wevu'

/**
 * 轻量 tabs：替代原 demo 依赖的 z-tabs（uni_modules），
 * 只保留演示需要的切换与下划线动效。
 */
const props = withDefaults(defineProps<{
  list: string[]
  current?: number
}>(), {
  current: 0,
})

const emit = defineEmits<{
  (e: 'change', index: number): void
}>()

const active = ref(props.current)

watch(() => props.current, (value) => {
  if (value !== active.value) {
    active.value = value
  }
})

function select(index: number) {
  if (active.value === index) {
    return
  }
  active.value = index
  emit('change', index)
}
</script>

<template>
  <view class="demo-tabs">
    <view
      v-for="(item, index) in list"
      :key="item"
      class="demo-tabs__item"
      :class="{ 'demo-tabs__item--active': index === active }"
      @click="select(index)"
    >
      {{ item }}
    </view>
  </view>
</template>

<style scoped>
.demo-tabs {
  display: flex;
  flex-direction: row;
  background-color: #ffffff;
  border-bottom: 1px solid #eeeeee;
}

.demo-tabs__item {
  position: relative;
  flex: 1;
  padding: 24rpx 0;
  color: #333333;
  font-size: 28rpx;
  text-align: center;
}

.demo-tabs__item--active {
  color: #007aff;
  font-weight: bold;
}

.demo-tabs__item--active::after {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 60rpx;
  height: 4rpx;
  margin-left: -30rpx;
  background-color: #007aff;
  border-radius: 2rpx;
  content: '';
}
</style>

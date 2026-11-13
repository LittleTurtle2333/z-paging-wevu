<script setup lang="ts">
interface ZPagingCellProps {
  cellStyle?: Record<string, string | number>
}

withDefaults(defineProps<ZPagingCellProps>(), {
  cellStyle: () => ({}),
})

const emit = defineEmits<{
  (e: 'touchstart', event: unknown): void
}>()
</script>

<template>
  <view :style="cellStyle" @touchstart="emit('touchstart', $event)">
    <slot />
  </view>
</template>

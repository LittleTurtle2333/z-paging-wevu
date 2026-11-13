<script setup lang="ts">
import type { ZPagingWevuStyle } from '../z-paging-wevu/props'
import type { ZPagingWevuController, ZPagingWevuQueryFrom, ZPagingWevuResult } from '../z-paging-wevu/types'
import { nextTick, onUnmounted, ref, watch } from 'wevu'
import { createPagingController } from '../z-paging-wevu/types'

interface ZPagingSwiperItemProps {
  tabIndex?: number
  currentIndex?: number
  controller?: ZPagingWevuController
  useVirtualList?: boolean
  useInnerList?: boolean
  cellKeyName?: string
  innerListStyle?: ZPagingWevuStyle
  preloadPage?: number | string
  cellHeightMode?: 'fixed' | 'dynamic'
  virtualListCol?: number | string
  virtualScrollFps?: number | string
}

const props = withDefaults(defineProps<ZPagingSwiperItemProps>(), {
  tabIndex: 0,
  currentIndex: 0,
  useVirtualList: false,
  useInnerList: false,
  cellKeyName: '',
  innerListStyle: () => ({}),
  preloadPage: 12,
  cellHeightMode: 'fixed',
  virtualListCol: 1,
  virtualScrollFps: 60,
})

const emit = defineEmits<{
  (e: 'query', pageNo: number, pageSize: number, from: ZPagingWevuQueryFrom, controller: ZPagingWevuController): void
  (e: 'updateList', list: unknown[]): void
  (e: 'update-list', list: unknown[]): void
}>()

const paging = props.controller ?? createPagingController()
const list = ref<unknown[]>([])
const firstLoaded = ref(false)
const pageNo = ref(1)
const noMore = ref(false)
let loadTimer: ReturnType<typeof setTimeout> | null = null

function currentResult(): ZPagingWevuResult {
  return { totalList: list.value, noMore: noMore.value }
}

function updateList(next: unknown[]) {
  list.value = next
  emit('updateList', next)
  emit('update-list', next)
}

function query(from: ZPagingWevuQueryFrom) {
  emit('query', pageNo.value, 10, from, paging)
  return Promise.resolve(currentResult())
}

function reload(_animate?: boolean) {
  pageNo.value = 1
  noMore.value = false
  updateList([])
  return query('reload')
}

function complete(data?: unknown, success = true): Promise<ZPagingWevuResult> {
  firstLoaded.value = true
  if (!success || !Array.isArray(data)) {
    return Promise.resolve(currentResult())
  }
  updateList(pageNo.value === 1 ? [...data] : [...list.value, ...data])
  noMore.value = data.length < 10
  if (!noMore.value) {
    pageNo.value += 1
  }
  return Promise.resolve(currentResult())
}

// query 的第四个参数复用同一控制器，调用方可以直接 complete。
paging.reload = reload
paging.complete = complete

watch(
  () => props.currentIndex,
  (current) => {
    if (current !== props.tabIndex || firstLoaded.value) {
      return
    }
    nextTick(() => {
      if (loadTimer) {
        clearTimeout(loadTimer)
      }
      loadTimer = setTimeout(() => {
        void reload().catch(() => {})
      }, 5)
    })
  },
  { immediate: true },
)

onUnmounted(() => {
  if (loadTimer) {
    clearTimeout(loadTimer)
  }
})

defineExpose({ reload, complete })
</script>

<template>
  <view class="zp-swiper-item-container">
    <slot name="header" />
    <slot />
    <template v-if="useInnerList">
      <slot name="cell" v-for="(item, index) in list" :item="item" :index="index" />
    </template>
    <slot name="footer" />
  </view>
</template>

<style scoped>
.zp-swiper-item-container {
  height: 100%;
}
</style>

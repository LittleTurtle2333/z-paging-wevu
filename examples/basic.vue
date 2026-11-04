<script setup lang="ts">
import { ref } from 'wevu'
import ZPagingWevu from '../src/components/z-paging-wevu/index.vue'
import { createPagingController } from '../src/components/z-paging-wevu/types'

interface DemoItem {
  id: number
  title: string
}

const TOTAL = 36
const items = ref<DemoItem[]>([])
const paging = createPagingController()

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function queryList([pageNo, pageSize]: [number, number, string]) {
  await wait(240)
  const start = (pageNo - 1) * pageSize
  const count = Math.max(0, Math.min(pageSize, TOTAL - start))
  const page = Array.from({ length: count }, (_, index) => ({
    id: start + index + 1,
    title: `列表项 ${start + index + 1}`,
  }))
  await paging.completeByTotal(page, TOTAL)
}
</script>

<template>
  <ZPagingWevu
    v-model="items"
    :controller="paging"
    :fixed="true"
    :default-page-size="10"
    paging-data-key="basic-example"
    show-empty-view-reload
    @query="queryList"
  >
    <view
      v-for="item in items"
      :key="item.id"
      style="padding: 24rpx; margin: 16rpx; background: #ffffff; border-radius: 16rpx;"
    >
      {{ item.title }}
    </view>
  </ZPagingWevu>
</template>

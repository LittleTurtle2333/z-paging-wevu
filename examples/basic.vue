<script setup lang="ts">
import { reactive } from 'wevu'
import ZPagingWevu from '../src/components/z-paging-wevu/index.vue'
import { createPagingController } from '../src/components/z-paging-wevu/types'

interface DemoItem {
  id: number
  title: string
}

const TOTAL = 36

/**
 * 列表放在 reactive 对象里：wevu 的 ref 在 vue-tsc 下不会被模板自动解包，
 * 直接 v-model 一个 ref 会导致模板里拿到 Ref 对象而报类型错误。
 */
const state = reactive<{ items: DemoItem[] }>({ items: [] })
const paging = createPagingController()

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 组件回写列表时同步到本地状态（等价于 v-model） */
function onListChange(value: unknown[]) {
  state.items = value as DemoItem[]
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
    :model-value="state.items"
    :controller="paging"
    :fixed="true"
    :default-page-size="10"
    paging-data-key="basic-example"
    show-empty-view-reload
    @update:model-value="onListChange"
    @query="queryList"
  >
    <view
      v-for="item in state.items"
      :key="item.id"
      style="padding: 24rpx; margin: 16rpx; background: #ffffff; border-radius: 16rpx;"
    >
      {{ item.title }}
    </view>
  </ZPagingWevu>
</template>

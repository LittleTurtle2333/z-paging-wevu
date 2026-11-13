<script setup lang="ts">
import { usePagePaging } from '@/composables/usePagePaging'
import PageDefaultList from '@/components/page-default-list/page-default-list.vue'
import { createPagingController } from '@/components/z-paging-wevu/types'

definePageJson({
  navigationBarTitleText: '使用页面滚动且在子组件内使用z-paging演示',
  enablePullDownRefresh: true,
})

// 页面滚动模式下由页面接管下拉刷新与触底，controller 交给子组件内的 z-paging 使用
const paging = createPagingController()
usePagePaging(paging)
</script>

<template>
  <view class="content">
    <PageDefaultList :controller="paging" />
  </view>
</template>

<style>
</style>

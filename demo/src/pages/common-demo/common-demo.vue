<script setup lang="ts">
import { ref } from 'wevu'
import ZPagingWevu from 'zp/components/z-paging-wevu/index.vue'
import { createPagingController } from 'zp/components/z-paging-wevu/types'
import DemoTabs from '@/components/demo-tabs/index.vue'
import request from '@/http/request'

definePageJson({
  navigationBarTitleText: '普通模式演示',
})

const paging = createPagingController()

const tabIndex = ref(0)
const tabList = ref(['测试1', '测试2', '测试3', '测试4'])
/** v-model 绑定的数据不要在请求结束回调里手动赋值 */
const dataList = ref<Array<Record<string, unknown>>>([])

function tabsChange(index: number) {
  tabIndex.value = index
  // 切换 tab 或搜索时调用 reload，不要直接调用 queryList
  void paging.reload()
}

function queryList([pageNo, pageSize]: [number, number]) {
  return request
    .queryList({ pageNo, pageSize, type: tabIndex.value + 1 })
    .then((res: { data: { list: Array<Record<string, unknown>> } }) => paging.complete(res.data.list))
    .catch(() => paging.complete(false))
}
</script>

<template>
  <ZPagingWevu
    id="common-paging"
    v-model="dataList"
    :controller="paging"
    @query="queryList"
  >
    <!-- 固定在顶部不滚动的区域放在 #top 插槽 -->
    <template #top>
      <DemoTabs :list="tabList" @change="tabsChange" />
    </template>

    <view v-for="(item, index) in dataList" :key="index" class="item">
      <view class="item-title">
        {{ item.title }}
      </view>
      <view class="item-detail">
        {{ item.detail }}
      </view>
      <view class="item-line" />
    </view>
  </ZPagingWevu>
</template>

<style scoped>
.item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 150rpx;
  padding: 0 30rpx;
}

.item-detail {
  z-index: 1;
  padding: 5rpx 15rpx;
  color: #ffffff;
  font-size: 28rpx;
  background-color: #007aff;
  border-radius: 10rpx;
}

.item-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #eeeeee;
}
</style>

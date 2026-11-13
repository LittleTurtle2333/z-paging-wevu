<!-- 弹窗内的分页列表（单独封装成组件，避免 z-paging 的插槽嵌套在弹窗插槽里导致事件绑定失效） -->
<template>
  <view class="popup-paging">
    <ZPagingWevu
      :controller="paging"
      v-model="dataList"
      :fixed="false"
      @query="queryList"
      refresher-default-style="none"
      :refresher-complete-delay="600"
    >
      <template #top>
        <DemoTabs :list="tabList" @change="tabsChange" />
      </template>
      <view
        v-for="(item, index) in dataList"
        :key="index"
        class="item"
        @click="itemClick(index)"
      >
        <view class="item-title">{{ item.title }}</view>
        <view class="item-detail">{{ item.detail }}</view>
        <view class="item-line" />
      </view>
    </ZPagingWevu>
  </view>
</template>

<script setup>
import DemoTabs from '@/components/demo-tabs/index.vue'
import ZPagingWevu from '@/components/z-paging-wevu/index.vue'
import { createPagingController } from '@/components/z-paging-wevu/types'
import { ref } from 'wevu'
import request from '@/http/request'

const paging = createPagingController()
const tabIndex = ref(0)
const tabList = ref(['测试1', '测试2', '测试3', '测试4'])
const dataList = ref([])

function tabsChange(index) {
  tabIndex.value = index
  paging.reload()
}

function queryList([pageNo, pageSize]) {
  return request
    .queryList({ pageNo, pageSize, type: tabIndex.value + 1 })
    .then((res) => paging.complete(res.data.list))
    .catch(() => paging.complete(false))
}

function itemClick(index) {
  wx.showToast({ title: `点击了第${index + 1}项`, icon: 'none' })
}
</script>

<style>
.popup-paging {
  height: 100%;
}

.item {
  position: relative;
  height: 150rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rpx 30rpx;
}

.item-detail {
  padding: 5rpx 15rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: white;
  background-color: #007aff;
}

.item-line {
  position: absolute;
  bottom: 0rpx;
  left: 0rpx;
  height: 1px;
  width: 100%;
  background-color: #eeeeee;
}
</style>

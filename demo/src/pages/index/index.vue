<script setup lang="ts">
import { ref } from 'wevu'
import ZPagingWevu from 'zp/components/z-paging-wevu/index.vue'
import { createPagingController } from 'zp/components/z-paging-wevu/types'
import { demoList } from './list'

definePageJson({
  navigationBarTitleText: 'z-paging-wevu',
})

const paging = createPagingController()
const items = ref([...demoList])

function handleRefresh() {
  setTimeout(() => {
    void paging.complete()
  }, 800)
}

function openDemo(file: string) {
  wx.navigateTo({ url: `/pages/${file}/${file}` })
}
</script>

<template>
  <view class="content">
    <ZPagingWevu
      id="index-paging"
      v-model="items"
      :controller="paging"
      :refresher-only="true"
      :refresher-complete-delay="600"
      @on-refresh="handleRefresh"
    >
      <view class="demo-list">
        <view
          v-for="item in items"
          :key="item.file"
          class="demo-item"
          @click="openDemo(item.file)"
        >
          <view class="demo-item-main">
            <view class="demo-item-title">
              {{ item.title }}
            </view>
            <view v-if="item.subTitle" class="demo-item-subtitle">
              {{ item.subTitle }}
            </view>
            <view class="demo-item-file">
              <text>{{ item.file }}.vue</text>
            </view>
          </view>
          <text class="demo-item-more">›</text>
        </view>
      </view>
    </ZPagingWevu>
  </view>
</template>

<style scoped>
.content {
  height: 100vh;
  background-color: #ffffff;
}

.demo-item {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #eeeeee;
}

.demo-item-main {
  flex: 1;
  margin-right: 20rpx;
}

.demo-item-main > view:not(:last-child) {
  margin-bottom: 10rpx;
}

.demo-item-title {
  font-size: 32rpx;
  font-weight: bold;
}

.demo-item-subtitle {
  font-size: 26rpx;
  color: #666666;
}

.demo-item-file > text {
  padding: 5rpx 10rpx;
  color: #ffffff;
  font-size: 24rpx;
  background-color: #f96027;
  border-radius: 8rpx;
}

.demo-item-more {
  color: #c8c8c8;
  font-size: 32rpx;
}
</style>

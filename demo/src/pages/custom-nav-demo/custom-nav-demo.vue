<!-- 自定义导航栏演示 -->
<!-- 自定义导航栏由本项目自行实现（components/demo-navbar），不依赖 uView 等 UI 库 -->
<template>
	<view class="content">
		<ZPagingWevu :controller="paging" v-model="dataList" @query="queryList"
		refresher-default-style="none"
		:refresher-complete-delay="600">
			<!-- 将不需要参与滚动的部分，放在slot="top"的view中，如果只有一个标签，可以直接在此标签上写slot="top"，将自定义的导航栏放到里面即可 -->
			<template #top>
				<!-- 页面已在 definePageJson 中开启 navigationStyle: 'custom'，这里接管系统导航栏 -->
				<DemoNavbar>
					<view class="slot-wrap" @click="backClick">
						这是一个自定义导航栏，点击返回上级页面
					</view>
				</DemoNavbar>
				<!-- 注意！此处的z-tabs为独立的组件，可替换为第三方的tabs，若需要使用z-tabs，请在插件市场搜索z-tabs并引入，否则会报插件找不到的错误 -->
				<DemoTabs :list="tabList" @change="tabsChange"   />
			</template>
			<!-- 如果希望其他view跟着页面滚动，可以放在z-paging标签内 -->
			<view class="item" v-for="(item,index) in dataList" :key="index">
				<view class="item-title">{{item.title}}</view>
				<view class="item-detail">{{item.detail}}</view>
				<view class="item-line"></view>
			</view>
		</ZPagingWevu>
	</view>
</template>

<script setup>
import DemoNavbar from '@/components/demo-navbar/index.vue'
import DemoTabs from '@/components/demo-tabs/index.vue'
import ZPagingWevu from '@/components/z-paging-wevu/index.vue'
import { createPagingController } from '@/components/z-paging-wevu/types'

definePageJson({
  navigationBarTitleText: '自定义导航栏演示',
  // 使用自定义导航栏时必须关闭系统导航栏，否则会出现两条导航栏
  navigationStyle: 'custom',
})
	import { ref } from 'wevu';
	import request from '@/http/request';
	
	
    const paging = createPagingController();
	
	const tabIndex = ref(0);
	const tabList = ref(['测试1','测试2','测试3','测试4']);
	// v-model绑定的这个变量不要在分页请求结束中自己赋值！！！
    const dataList = ref([]);
	
	
	const tabsChange = (index) => {
		tabIndex.value = index;
		// 当切换tab或搜索时请调用组件的reload方法，请勿直接调用：queryList方法！！
		paging.reload();
	}
	
	// @query所绑定的方法不要自己调用！！需要刷新列表数据时，只需要调用paging.reload()即可
    const queryList = ([pageNo, pageSize]) => {
		// 组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
		// 这里的pageNo和pageSize会自动计算好，直接传给服务器即可
		// 模拟请求服务器获取分页数据，请替换成自己的网络请求
		const params = {
			pageNo: pageNo,
			pageSize: pageSize,
			type: tabIndex.value + 1
		}
		request.queryList(params).then(res => {
			// 将请求的结果数组传递给z-paging
			paging.complete(res.data.list);
		}).catch(res => {
			// 如果请求失败写paging.complete(false);
			// 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
			// 在底层的网络请求抛出异常时，写统一错误回调;即可
			paging.complete(false);
		})
    }
	
	// 点击了返回上一页
	const backClick = () => {
		// 直接 reLaunch 进来时没有页面栈，退回首页，避免点击无反应
		if (getCurrentPages().length > 1) {
			wx.navigateBack({
				delta: 1
			})
			return
		}
		wx.reLaunch({ url: '/pages/index/index' })
	}
</script>

<style>
	.slot-wrap {
		font-size: 24rpx;
		line-height: 1.4;
		color: #333333;
		text-align: center;
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
		background-color: #007AFF;
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

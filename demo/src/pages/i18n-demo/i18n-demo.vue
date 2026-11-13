<!-- i18n国际化演示(vue) -->
<!-- 原版用 uni.setLocale/uni.getLocale 切换语言，影响的是 z-paging 组件内置文案；微信没有 uni.setLocale，
     这里通过 paging.setLocale() 切换组件内置文案语言（下拉刷新 / 加载更多 / 空数据），页面自身文案保持不变 -->
<template>
	<view class="content">
		<ZPagingWevu :controller="paging" v-model="dataList" @query="queryList"
		refresher-default-style="none"
		:refresher-complete-delay="600">
			<!-- 需要固定在顶部不滚动的view放在slot="top"的view中，如果需要跟着滚动，则不要设置slot="top" -->
			<template #top>
				<view class="language-view" @click="languageSwitch">
					当前语言：[{{ currentLocale }}] 点击切换组件内置文案
				</view>
				<view class="locale-tip">微信不支持运行时切换系统语言，此处切换的是 z-paging 内置文案（下拉刷新 / 加载更多 / 空数据）</view>
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
import DemoTabs from '@/components/demo-tabs/index.vue'
import ZPagingWevu from '@/components/z-paging-wevu/index.vue'
import { createPagingController } from '@/components/z-paging-wevu/types'
import { getPagingLocale } from '@/components/z-paging-wevu/locale'

definePageJson({
  navigationBarTitleText: 'i18n国际化演示',
})
	import { ref } from 'wevu';
	import request from '@/http/request';

	// 跟随系统 / 简体中文 / 繁体中文 / 英文
	const locales = [{
		text: '跟随系统',
		code: 'auto'
	}, {
		text: 'English',
		code: 'en'
	}, {
		text: '简体中文',
		code: 'zh-Hans'
	}, {
		text: '繁体中文',
		code: 'zh-Hant'
	}]

	//------------------------ z-paging分页相关 -----------------------
    const paging = createPagingController();

	// 组件当前实际使用的文案语言（auto 会解析成具体语言）
	const currentLocale = ref(getPagingLocale());

	const tabIndex = ref(0);
	const tabList = ref(['测试1','测试2','测试3','测试4']);
	// v-model绑定的这个变量不要在分页请求结束中自己赋值！！！
    const dataList = ref([]);

	// 点击了切换语言
	const languageSwitch = () => {
		wx.showActionSheet({
			itemList: locales.map(item => item.text),
			success: res => {
				const local = locales[res.tapIndex];
				// 切换 z-paging 内置文案语言
				paging.setLocale(local.code);
				currentLocale.value = paging.getLocale();
			}
		});
	}

	//------------------------ z-paging分页相关 -----------------------
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
</script>

<style>
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

	.language-view {
		background-color: #007AFF;
		text-align: center;
		padding: 20rpx 0rpx;
		font-size: 24rpx;
		color: white;
	}

	.locale-tip {
		padding: 16rpx 24rpx;
		font-size: 22rpx;
		line-height: 1.5;
		color: #888888;
		background-color: #f7f7f7;
	}
</style>

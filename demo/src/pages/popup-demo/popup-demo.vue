<!-- 在弹窗内使用z-paging演示(vue) -->
<template>
	<view class="content">
		<button size="mini" type="primary" @click="open">打开弹窗</button>
		<PopUp ref="popup">
			<!-- 在弹窗内使用z-paging时，z-paging的父view必须确定宽高（或者z-paging本身确定宽高） -->
			<view style="height: 700rpx;width: 500rpx;">
				<!-- 设置fixed=false代表z-paging非铺满全屏，此时z-paging高度未确定，其父view或z-paging本身必须确定宽高 -->
				<!-- 列表封装在独立组件中，避免插槽层级过深 -->
				<PopupPaging v-if="showPaging" />
			</view>
		</PopUp>
	</view>
</template>

<script setup>
import PopUp from '@/components/pop-up/pop-up.vue'
import PopupPaging from '@/components/popup-paging/popup-paging.vue'

definePageJson({
  navigationBarTitleText: '在弹窗内使用z-paging演示',
})
	import { ref } from 'wevu';

	const popup = ref(null);
	// 是否显示z-paging
	const showPaging = ref(false);

	// 打开弹窗
	const open = () => {
		showPaging.value = true;
		popup.value.open();
	}
</script>

<style>
	page {
		height: 100%;
	}

	.content {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

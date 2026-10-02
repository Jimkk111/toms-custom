<template>
	<view class="page">
		<!-- 成果区：CSS 画的勾 + 文案 -->
		<view class="result">
			<view class="icon"></view>
			<view class="title">订单提交成功</view>
			<view class="desc">支付成功，商家正在加紧备餐，请耐心等待</view>
		</view>

		<!-- 底部操作区：查看订单 + 回到首页 -->
		<view class="btn-bar">
			<view class="detail-btn" v-if="orderId" @click="goDetail">查看订单</view>
			<view class="home-btn" @click="goHome">回到首页</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderId: null      // redirectTo 带入，先留着供后续【查看订单】用
			}
		},
	methods: {
		// 回到首页：reLaunch 重置页面栈，首页重新 onLoad 拉最新购物车/菜品
		goHome() {
			uni.reLaunch({ url: '/pages/index/index' })
		},
		// 查看订单详情：用 redirectTo 把成功页替换掉（栈变为 首页→详情），
		// 详情页点原生返回就直接回首页；小程序原生返回无法拦截，只能靠栈控制
		goDetail() {
			uni.redirectTo({ url: `/pages/order/detail?id=${this.orderId}` })
		}
	},
		onLoad(options) {
			this.orderId = options.id || null
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		box-sizing: border-box;
		padding: 0 40rpx calc(60rpx + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		background-color: $bg-page;

		.result {
			flex: 1;                       // 撑满剩余高度，把按钮顶到底部
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 180rpx;

			.icon {
				width: 140rpx;
				height: 140rpx;
				border-radius: 50%;
				background-color: #07c160;
				display: flex;
				align-items: center;
				justify-content: center;

				&::after {               // 右+下边框旋转 45° 得到对勾
					content: '';
					display: block;
					width: 34rpx;
					height: 62rpx;
					margin-top: -8rpx;   // 对勾重心偏右下，略上移做视觉居中
					border-right: 10rpx solid #fff;
					border-bottom: 10rpx solid #fff;
					transform: rotate(45deg);
				}
			}

			.title {
				margin-top: 40rpx;
				font-size: $font-lg;
				font-weight: 600;
				color: $text-main;
			}

			.desc {
				margin-top: 16rpx;
				font-size: $font-sm;
				color: $text-sub;
				text-align: center;
			}
		}

		.btn-bar {
			display: flex;
			gap: 24rpx;

			.detail-btn,
			.home-btn {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 88rpx;
				border-radius: 999rpx;
				font-size: $font-md;
			}

			.detail-btn {
				border: 1rpx solid #d9d9d9;
				background: #fff;
				color: $text-sub;
				font-weight: 400;
			}

			.home-btn {
				background: $brand-gradient;
				color: #1a1a1a;
				font-weight: 600;
			}
		}
	}
</style>

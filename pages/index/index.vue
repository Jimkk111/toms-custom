<template>
	<HomeHeader></HomeHeader>
	<!-- <button @click="doLogin()">测试</button> -->
	<view class="main">
		<view class="head">
			<view class="shop-card">
				<view class="top">
					<view class="logo">
						<image></image>
					</view>
					<view class="info">
						<view class="name">满上</view>
						<view class="meta">
							<view class="item"><text>距离1.5km</text></view>
							<view class="item"><text>配送费6元</text></view>
							<view class="item"><text>预计时长12min</text></view>
						</view>
					</view>
				</view>
				<view class="intro-block">
					<text class="intro">简介: 瑞吉外送是综合外送平台，定位"大众化的外送平台"旨在为顾客打造专业的外送平台。</text>
				</view>
			</view>
		</view>
		<view class="body">
			<view class="right"></view>
			<view class="left"></view>
		</view>
	</view>
	<view class="cart"></view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { login } from '../../api/user.js'
import HomeHeader from './components/HomeHeader.vue'
	export default {
		components:{
        	HomeHeader
    	},
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			
		},
		methods: {
			doLogin(){
				uni.login({
					provider:'weixin',
					success: (res) => {
						const code = res.code
						login({ code })
						.then((res) => {
							const userStore = useUserStore()
							userStore.setSessionId(res.sessionId)
							console.log("user_sessionId=====>",userStore.sessionId)
						})
						.catch((e) => {
							console.log("登录失败！",e)
						})
					}
				})	
			}
		}
	}
</script>

<style lang="scss">

	/* ========== 页面骨架 ========== */
	.main {
		.head {
			box-sizing: border-box;
			height: 292rpx;              // 146px × 2，统一 rpx 随屏缩放
			padding: 26rpx 0;
			background: $nav-gradient;
		}
	}

	/* ========== 店铺信息卡 ========== */
	.shop-card {
		display: flex;
		flex-direction: column;
		width: calc(100% - 60rpx);       // 两侧各留 30rpx，比百分比宽度更可控
		height: 240rpx;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 10rpx rgba(69, 69, 69, 0.1);

		.top {
			flex: 1;                     // 高度吃剩余空间，替代 height: 50%
			display: flex;
			border-bottom: 1px dashed $line-color;

			.logo {
				padding: 16rpx;
				image {
					width: 78rpx;
					height: 78rpx;
					border-radius: 16rpx;
					background-color: $nav-bg;   // 占位底色，图片未加载时不空白
				}
			}

			.info {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;  // 从顶部排布：店名顶边与 logo 图片顶边对齐
				padding: 16rpx 16rpx 16rpx 0;

				.name {
					font-size: $font-lg;
					font-weight: 500;
					line-height: 50rpx;       // 紧凑行高，抵消文字行框自带的顶部空隙
					color: $text-main;
				}

				.meta {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.item {
						font-size: $font-xs;
						color: $text-sub;
					}
				}
			}
		}

		.intro-block {
			padding: 16rpx;

			.intro {
				font-size: $font-xs;
				line-height: 36rpx;
				color: $text-sub;
			}
		}
	}
</style>

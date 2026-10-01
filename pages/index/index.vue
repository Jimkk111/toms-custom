<template>
	<view class="page">
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
				<scroll-view class="left">
					<view v-for="item in menuList" key="item.id" class="menu-item">
						{{ item.name }}
					</view>
				</scroll-view>
				<scroll-view class="right">
					<view class="dish-list">
						<view class="dish" v-for="dish in disList" key="dish.id">
							<image src=""></image>
							<view class="dish-info">
								<view class="name">
									{{ dish.name }}
								</view>
								<view class="intro">
									{{ dish.desc }}
								</view>
								<view class="month-count">
									月销量10
								</view>
								<view class="bottom">
									<view class="price">
										{{ dish.price }}
									</view>
									<view class="select">

									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		<view class="cart"></view>
	</view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { login } from '../../api/user.js'
import { getDishList } from '../../api/dish'
import HomeHeader from './components/HomeHeader.vue'
	export default {
		components:{
        	HomeHeader
    	},
		data() {
			return {
				menuList:[
					{
						id:1,
						name:"招牌推荐"
					},
					{
						id:2,
						name:"经典套餐"
					},
					{
						id:3,
						name:"主食"
					},
					{
						id:4,
						name:"小吃炸物"
					},
					{
						id:5,
						name:"甜点饮品"
					},
					{
						id:6,
						name:"优惠套餐"
					}
				],
				dishList:[],
				categoryId:11
			}
		},
		onLoad() {
			getDishList(this.categoryId).then((res) => {
				if(res.code === 1) {
					this.dishList = res.data.map((dish) => ({
						id:dish.id,
						name:dish.name,
						img:dish.image,
						desc:dish.description,
						price:dish.price
					}))
				}
			})
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
							userStore.setSessionId(res.data.sessionId)
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
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.main {
		flex:1;
		display: flex;
		flex-direction: column;
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

	.body {
		flex: 1;
		display: flex;
		overflow: hidden;
		min-height: 0;

		.left {
			width: 200rpx;
  			height: 100%;
			background-color: $bg-cat;

			.menu-item{
				width:100%;
				height:100rpx;
				line-height: 100rpx;
				text-align: center;
				font-size:28rpx;

				&:hover{
					background-color: #fff;
				}
			}
		}

		.right {
			flex: 1;
			height: 100%;
			min-height: 0;

			.dish-list{
				margin:auto;

				.dish{
					display: flex;
					padding-top:10rpx;
					padding-bottom:10rpx;
					gap:30rpx;

					image{
						width: 172rpx;
						height: 172rpx;
						border-radius: 8rpx;
					}

					.dish-info{
						height: 100%;
						display:flex;
						flex-direction: column;

						.name{
							font-size:32rpx;
							font-weight: 600;
						}

						.intro {
							font-size:22rpx;
							color:#666;
							text-overflow: ellipsis;
							overflow: hidden;
						}

						.month-count{
							font-size:22rpx;
							color:#666
						}
					}
				}
			}
		}
	}
</style>

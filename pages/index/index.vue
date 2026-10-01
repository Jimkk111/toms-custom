<template>
	<view class="page">
		<HomeHeader></HomeHeader>
		<!-- <button @click="doLogin()">测试</button> -->
		<view class="main">
				<view class="hero">
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
			<view class="menu-area">
				<scroll-view class="category-col" scroll-y>
					<view v-for="item in menuList" :key="item.id" class="category-item">
						{{ item.name }}
					</view>
				</scroll-view>
				<scroll-view class="dish-col" scroll-y>
					<view class="dish-list">
						<view class="dish-card" v-for="dish in dishList" :key="dish.id">
							<image :src="dish.img" mode="aspectFill"></image>
							<view class="dish-info">
								<view class="dish-name">
									{{ dish.name }}
								</view>
								<view class="dish-desc">
									{{ dish.desc }}
								</view>
								<view class="dish-sales">
									月销量10
								</view>
								<view class="dish-foot">
									<view class="dish-price">
										<text class="ico">￥</text>{{ dish.price }}
									</view>
									<view class="dish-control">

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
			getDishList(this.categoryId).then((data) => {
				if (!data) return               // 失败已被 request 层统一 toast，这里只管刹车
				this.dishList = data.map((dish) => ({
					id: dish.id,
					name: dish.name,
					img: dish.image,
					desc: dish.description,
					price: dish.price
				}))
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
		.hero {
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

	.menu-area {
		flex: 1;
		display: flex;
		overflow: hidden;
		min-height: 0;

		.category-col {
			width: 200rpx;
			height: 100%;
			background-color: $bg-cat;

			.category-item {
				width: 100%;
				height: 100rpx;
				line-height: 100rpx;
				text-align: center;
				font-size: $font-sm;
				color: $text-sub;

				&.active {              // 分类选中态（做联动时 :class 绑上）
					background-color: #fff;
					color: $text-main;
					font-weight: 500;
				}
			}
		}

		.dish-col {
			flex: 1;
			height: 100%;
			min-height: 0;
			background-color: #fff;

			.dish-list {
				padding-bottom: 140rpx;   // 避让悬浮购物车栏，最后一项能滚到可见

				.dish-card {
					display: flex;
					padding: 10rpx 0;
					gap: 30rpx;

					image {
						width: 172rpx;
						height: 172rpx;
						border-radius: 8rpx;
						flex-shrink: 0;    // 防止长文字把图片挤扁
					}

					.dish-info {
						flex: 1;
						display: flex;
						flex-direction: column;

						.dish-name {
							font-size: $font-md;
							font-weight: 600;
							color: $text-main;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.dish-desc {
							font-size: $font-xxs;
							color: $text-sub;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.dish-sales {
							font-size: $font-xxs;
							color: $text-sub;
						}

						.dish-foot {
							display: flex;
							justify-content: space-between;
							align-items: center;
							margin-top: auto;    // 价格行沉到卡片底部

							.dish-price {
								font-size: $font-lg;
								color: $price-color;
								font-weight: 500;

								.ico {
									font-size: $font-xs;
								}
							}
						}
					}
				}
			}
		}
	}
</style>

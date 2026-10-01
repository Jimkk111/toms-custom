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
					<view v-for="item in menuList" :key="item.id" class="category-item" :class="{ active: item.id === activeCategoryId }" @click="handleChangeCategory(item)">
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
										<view v-if="canDirectAdd(dish)" class="add-btn" @click="handleAddCart(dish)">
											<view class="plus"></view>
											<view class="num">2</view>
										</view>
										<view v-else-if="hasFlavors(dish)" class="choose-btn" @click="handleChooseFlavor(dish)">
											选规格
											<view class="num">2</view>
										</view>
										<view v-else-if="isSetmeal(dish)" class="setmeal-btn" @click="handleChooseSetmeal(dish)">
											选套餐
											<view class="num">2</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		<view class="cart">
			<view class="cart-icon">
				<view class="bag"></view>
				<view class="badge">3</view>
			</view>
			<view class="cart-info">
				<view class="total"><text class="ico">￥</text>52</view>
				<view class="fee">另需配送费￥6元</view>
			</view>
			<view class="cart-btn">去结算</view>
		</view>
	</view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { login } from '../../api/user.js'
import {  getCategoryList, getDishList } from '../../api/dish'
import HomeHeader from './components/HomeHeader.vue'
	export default {
		components:{
        	HomeHeader
    	},
		data() {
			return {
				menuList:[],
				dishList:[],
				activeCategoryId: 0,
			}
		},
		async onLoad() {
			await this.loadCategoryList()
			this.loadDishList()
		},
		methods: {
			async loadCategoryList() {
				const res = await getCategoryList()
				if (!res) return               
				const menuList = res.map((category) => ({
					id: category.id,
					name: category.name,
					type: category.type
				}))
				this.menuList = [{id:0,name:'全部',type:null},...menuList]
			},
			async loadDishList(categoryId) {
				const data = await getDishList(categoryId)
				if (!data) return               
				this.dishList = data.map((dish) => {
					const type = this.menuList.find((category) => category.id === dish.categoryId)?.type || null
					return {
						id: dish.id,
						categoryId: dish.categoryId,
						name: dish.name,
						type: type,
						flavors: dish.flavors,
						img: dish.image,
						desc: dish.description,
						price: dish.price
					}
				})
			},
			async doLogin(){
				const userStore = useUserStore()
				try {
					const loginRes = await uni.login({provider})
					const data = await login({code:loginRes.code})
					if(!data) return
					userStore.setSessionId(data.sessionId)
					userStore.setUser(data.userInfo)
					uni.showToast({ title: '登录成功', icon: 'none' })
				} catch(e) {
					uni.showToast({ title: '微信登录失败', icon: 'none' })
				}
			},
			handleChangeCategory(item){
				this.activeCategoryId = item.id
				if(item.id === 0) {
					this.loadDishList()
				} else {
					this.loadDishList(item.id)
				}
			},
			// 菜品分类（type=1）且无口味 → 可直接"+"加购；套餐/带口味后续走各自入口
			canDirectAdd(dish) {
				return dish.type === 1 && (!dish.flavors || dish.flavors.length === 0)
			},
			// 菜品分类（type=1）且带口味 → "选规格"入口，点击弹口味选择
			hasFlavors(dish) {
				return dish.type === 1 && dish.flavors && dish.flavors.length > 0
			},
			handleChooseFlavor(dish) {
				// TODO: 弹口味选择弹窗
				uni.showToast({ title: '选规格（待实现）', icon: 'none' })
			},
			// 套餐分类（type=2）→ "选套餐"入口，跳套餐详情选内容
			isSetmeal(dish) {
				return dish.type === 2
			},
			handleChooseSetmeal(dish) {
				// TODO: 跳套餐详情页
				uni.showToast({ title: '选套餐（待实现）', icon: 'none' })
			},
			handleAddCart(dish) {
				// TODO: 接购物车数据逻辑
				uni.showToast({ title: '已加入购物车', icon: 'none' })
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
		overflow: hidden;
	}
	.main {
		flex:1;
		min-height: 0;                 // flex 子项默认不小于内容高，缺这行会被列表撑开、col 就无滚可滚
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
				padding: 20rpx 20rpx calc(160rpx + env(safe-area-inset-bottom));   // 左右留边不贴屏；底部避让购物车栏（含凸出圆钮 + iPhone 安全区）
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

						.dish-control {
							display: flex;             // 右对齐占位，后续数量步进器也放这
							align-items: center;

							.add-btn {                 // 直加购"+"：黄圆底黑加号
								position: relative;
								width: 56rpx;
								height: 56rpx;
								border-radius: 50%;
								background: $brand-gradient;

								.plus {
									position: absolute;
									left: 50%;
									top: 50%;
									width: 26rpx;
									height: 26rpx;
									transform: translate(-50%, -50%);

									&::before,          // 横笔
									&::after {          // 竖笔
										content: '';
										position: absolute;
										background-color: #1a1a1a;
									}

									&::before {
										left: 0;
										top: 50%;
										width: 100%;
										height: 5rpx;
										transform: translateY(-50%);
									}

									&::after {
										top: 0;
										left: 50%;
										width: 5rpx;
										height: 100%;
										transform: translateX(-50%);
									}
								}

							}

							.num {                 // 已加购数量角标（硬编码占位，逻辑后接），加购/选规格两钮共用
								position: absolute;
								top: -10rpx;
								right: -10rpx;
								min-width: 30rpx;
								height: 30rpx;
								line-height: 30rpx;
								padding: 0 6rpx;
								border-radius: 15rpx;
								background-color: $price-color;
								color: #fff;
								font-size: $font-xxs;
								text-align: center;
								box-sizing: border-box;
							}

							.choose-btn,             // 带口味菜品的"选规格"入口：黄胶囊
							.setmeal-btn {           // 套餐的"选套餐"入口：同款胶囊
								position: relative;     // 供数量角标定位
								padding: 12rpx 24rpx;
								border-radius: 999rpx;   // 圆角给足成胶囊，高度由文字+内边距撑出
								background: $brand-gradient;
								color: #1a1a1a;
								font-size: $font-xs;
								font-weight: 500;
							}
						}
					}
					}
				}
			}
		}
	}

	/* ========== 悬浮购物车栏 ========== */
	.cart {
		position: fixed;
		left: 20rpx;
		right: 20rpx;
		bottom: calc(20rpx + env(safe-area-inset-bottom));   // 避让 iPhone 底部小黑条
		z-index: 999;
		display: flex;
		align-items: center;
		height: 100rpx;
		padding-left: 140rpx;              // 给左侧凸出的圆钮让位
		box-sizing: border-box;
		background-color: #1a1a1a;
		border-radius: 50rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);

		.cart-icon {
			position: absolute;
			left: 20rpx;
			bottom: 10rpx;                 // 底边悬在栏内，顶部凸出栏外
			width: 110rpx;
			height: 110rpx;
			padding: 8rpx;                 // 深色外圈 = 黄钮描边
			border-radius: 50%;
			background-color: #2b2b2b;
			box-sizing: border-box;

			.bag {                         // CSS 画购物袋：黄圆底 + 袋身/提手两笔
				position: relative;
				width: 100%;
				height: 100%;
				border-radius: 50%;
				background-color: $brand-color;

				&::before {                // 袋身
					content: '';
					position: absolute;
					left: 50%;
					bottom: 20rpx;
					transform: translateX(-50%);
					width: 34rpx;
					height: 26rpx;
					border: 5rpx solid #1a1a1a;
					border-radius: 0 0 8rpx 8rpx;
					box-sizing: border-box;
				}

				&::after {                 // 提手
					content: '';
					position: absolute;
					left: 50%;
					top: 22rpx;
					transform: translateX(-50%);
					width: 18rpx;
					height: 12rpx;
					border: 5rpx solid #1a1a1a;
					border-bottom: none;
					border-radius: 10rpx 10rpx 0 0;
					box-sizing: border-box;
				}
			}

			.badge {
				position: absolute;
				top: -6rpx;
				right: -6rpx;
				min-width: 34rpx;
				height: 34rpx;
				line-height: 30rpx;        // 2rpx 边框补偿，数字居中
				padding: 0 6rpx;
				border: 2rpx solid #1a1a1a;
				border-radius: 17rpx;
				background-color: $price-color;
				color: #fff;
				font-size: $font-xxs;
				text-align: center;
				box-sizing: border-box;
			}
		}

		.cart-info {
			flex: 1;

			.total {
				color: #fff;
				font-size: $font-lg;
				font-weight: 600;

				.ico {
					font-size: $font-xs;
				}
			}

			.fee {
				margin-top: 2rpx;
				font-size: $font-xxs;
				color: #999;
			}
		}

		.cart-btn {
			align-self: stretch;           // 铺满栏高，圆角只留右侧，与黑栏拼成一体
			display: flex;
			align-items: center;
			padding: 0 44rpx;
			border-radius: 0 50rpx 50rpx 0;
			background-color: $brand-color;
			color: #1a1a1a;
			font-size: $font-md;
			font-weight: 600;
		}
	}
</style>

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
											<view class="num" v-if="cartStore.qtyOf(dish.id) > 0">{{ cartStore.qtyOf(dish.id) }}</view>
										</view>
										<view v-else-if="hasFlavors(dish)" class="choose-btn" @click="handleChooseFlavor(dish)">
											选规格
											<view class="num" v-if="cartStore.qtyOf(dish.id) > 0">{{ cartStore.qtyOf(dish.id) }}</view>
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
				<view class="bag" @click="toggleCartPopup"></view>
				<view class="badge" v-if="cartStore.totalCount > 0">{{ cartStore.totalCount }}</view>
			</view>
			<view class="cart-info">
				<view class="total"><text class="ico">￥</text>{{ cartStore.totalAmount }}</view>
				<view class="fee">另需配送费￥6元</view>
			</view>
			<view class="cart-btn">去结算</view>
		</view>
		<!-- 购物车详情弹层：蒙层只盖到栏顶（栏保持可点），面板从栏后往上滑出 -->
		<view class="cart-mask" :class="{ show: cartVisible }" @click="cartVisible = false"></view>
		<view class="cart-panel" :class="{ up: cartVisible }">
			<view class="panel-title">
				已选商品
				<view class="clear-btn" @click="handleClearCart">
					<view class="trash"></view>
					<text>清空</text>
				</view>
			</view>
			<scroll-view v-if="cartStore.items.length" class="panel-list" scroll-y>
				<view class="row" v-for="line in cartStore.items" :key="line.lineKey">
					<image :src="line.image" mode="aspectFill"></image>
					<view class="row-info">
						<view class="row-name">{{ line.name }}</view>
						<view class="row-flavor" v-if="line.flavors.length">{{ line.flavors.join(' / ') }}</view>
					</view>
					<view class="row-right">
						<view class="row-price">￥{{ line.price }}</view>
						<view class="stepper">
							<view class="step minus" @click="cartStore.decrease(line.lineKey)">-</view>
							<view class="qty">{{ line.qty }}</view>
							<view class="step plus" @click="cartStore.increase(line.lineKey)">+</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view v-else class="panel-empty">购物车空空如也，去挑点好吃的吧</view>
		</view>
		<FlavorPopup ref="flavorPopup" @addFlavoredDish="onFlavorConfirm"></FlavorPopup>
	</view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { useCartStore } from '../../stores/cart'
import { login } from '../../api/user.js'
import {  getCategoryList, getDishList } from '../../api/dish'
import HomeHeader from './components/HomeHeader.vue'
import FlavorPopup from './components/FlavorPopup.vue'
	export default {
		components:{
        	HomeHeader,
        	FlavorPopup
    	},
		computed: {
			// 选项式组件里把 store 挂进 computed，模板里的绑定才有响应式
			// mok：这里不太懂，后续补一下知识
			cartStore() {
				return useCartStore()
			}
		},
		data() {
			return {
				menuList:[],
				dishList:[],
				activeCategoryId: 0,
				cartVisible: false,          // 购物车详情弹层开关
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
			toggleCartPopup() {
				this.cartVisible = !this.cartVisible
			},
			// 清空购物车：整车的破坏性操作，先确认再执行；空车直接忽略
			async handleClearCart() {
				if (!this.cartStore.items.length) return
				const res = await uni.showModal({ title: '提示', content: '确定清空购物车吗？' })
				if (res.confirm) this.cartStore.clear()
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
				this.$refs.flavorPopup.open(dish)
			},
			// 口味弹窗提交：组件只管选+校验+发事件，加购在页面侧收口
			onFlavorConfirm({ dish, flavors }) {
				useCartStore().addItem(dish, flavors)
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
				useCartStore().addItem(dish)     // 无口味单品：直接并行加一，角标/购物车栏随之联动
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
		// mok：这里不太懂，后续补一下知识
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

	/* ========== 购物车详情弹层 ========== */
	.cart-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: calc(120rpx + env(safe-area-inset-bottom));   // 只盖到栏顶，购物车栏保持可见可点
		z-index: 997;                    // 层序：蒙层 997 < 面板 998 < 栏 999，面板从栏后滑出
		background: rgba(0, 0, 0, 0.4);
		opacity: 0;
		visibility: hidden;              // 收起时不拦截底层点击
		transition: all .3s;

		&.show {
			opacity: 1;
			visibility: visible;
		}
	}

	.cart-panel {
		position: fixed;
		left: 0;
		right: 0;                          // 通宽占满屏幕
		bottom: 0;                         // 底边直达屏幕底，盖住底下内容；购物车栏(999)浮在面板上层
		z-index: 998;                      // 比购物车栏(999)低、比页面内容(蒙层997之下)高
		display: flex;
		flex-direction: column;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));   // 让出栏高+栏底距+安全区，末行不被悬浮栏压住
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		transform: translateY(100%);     // 收起态：向下平移自身高度，完全滑出屏幕底部
		transition: transform .3s ease;

		&.up {
			transform: translateY(0);
		}

		.panel-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx;
			font-size: $font-md;
			font-weight: 600;
			color: $text-main;
			border-bottom: 1rpx solid $line-color;

			.clear-btn {
				display: flex;
				align-items: center;
				gap: 8rpx;
				font-size: $font-xs;
				font-weight: 400;
				color: $text-sub;

				.trash {                  // CSS 画垃圾桶：桶身 + 桶盖 + 提手
					position: relative;
					width: 26rpx;
					height: 28rpx;
					border: 3rpx solid $text-sub;
					border-radius: 4rpx 4rpx 8rpx 8rpx;
					box-sizing: border-box;

					&::before {          // 桶盖横条
						content: '';
						position: absolute;
						top: -12rpx;
						left: -6rpx;
						width: calc(100% + 12rpx);
						height: 3rpx;
						background-color: $text-sub;
					}

					&::after {           // 提手小弧
						content: '';
						position: absolute;
						top: -20rpx;
						left: 50%;
						transform: translateX(-50%);
						width: 10rpx;
						height: 7rpx;
						border: 3rpx solid $text-sub;
						border-bottom: none;
						border-radius: 6rpx 6rpx 0 0;
						box-sizing: border-box;
					}
				}
			}
		}

		.panel-list {
			max-height: 420rpx;           // 一行 140rpx（上下padding 20×2 + 图 100），3 行封顶，多出内滚

			.row {
				display: flex;
				align-items: center;
				gap: 20rpx;
				padding: 20rpx 24rpx;
				border-bottom: 1rpx solid $line-color;

				&:last-child {
					border-bottom: none;
				}

				image {
					width: 100rpx;
					height: 100rpx;
					border-radius: 8rpx;
					flex-shrink: 0;
					background-color: $bg-cat;   // 占位底色
				}

				.row-info {
					flex: 1;
					min-width: 0;            // 让位给单行省略

					.row-name {
						font-size: $font-sm;
						font-weight: 500;
						color: $text-main;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.row-flavor {
						margin-top: 4rpx;
						font-size: $font-xxs;
						color: $text-sub;
					}
				}

				.row-right {
					display: flex;
					flex-direction: column;
					align-items: flex-end;

					.row-price {
						font-size: $font-md;
						font-weight: 500;
						color: $price-color;
					}

					.stepper {
						display: flex;
						align-items: center;
						gap: 14rpx;
						margin-top: 8rpx;

						.step {
							display: flex;
							align-items: center;
							justify-content: center;
							width: 44rpx;
							height: 44rpx;
							border-radius: 50%;
							font-size: 34rpx;
							line-height: 1;
						}

						.minus {                 // 空心减号，与实心加号配对
							border: 2rpx solid $brand-color;
							color: $brand-color;
						}

						.plus {                  // 实心加号，与菜品卡"+"同一视觉语言
							background: $brand-gradient;
							color: #1a1a1a;
							font-weight: 600;
						}

						.qty {
							min-width: 40rpx;
							text-align: center;
							font-size: $font-sm;
							color: $text-main;
						}
					}
				}
			}
		}

		.panel-empty {
			padding: 100rpx 0;
			text-align: center;
			font-size: $font-sm;
			color: $text-sub;
		}
	}
</style>

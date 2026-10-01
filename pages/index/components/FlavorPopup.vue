<template>
	<view>
		<view class="flavor-mask" :class="{ show: visible }" @click="close"></view>
		<view class="flavor-popup" :class="{ up: visible }">
			<view class="popup-close" @click="close">×</view>
			<!-- 主体：口味组多时内部滚动，高度不无限撑 -->
			<scroll-view class="popup-body" scroll-y>
				<!-- 商品信息行 -->
				<view class="popup-dish">
					<image :src="dish.img" mode="aspectFill"></image>
					<view class="dish-right">
						<view class="dish-name">{{ dish.name }}</view>
						<view class="dish-price"><text class="ico">￥</text>{{ dish.price }}</view>
					</view>
				</view>
				<!-- 口味分组：每组标题 + 选项标签（当前只渲染，选中/收集逻辑后续接） -->
				<view class="flavor-group" v-for="group in flavorGroups" :key="group.name">
					<view class="group-name">{{ group.name }}</view>
					<view class="tags">
						<view class="tag" v-for="opt in group.options" :key="opt">{{ opt }}</view>
					</view>
				</view>
			</scroll-view>
			<!-- 底部操作区：通栏"加入购物车"（样式先行，点击逻辑后接） -->
			<view class="popup-footer">
				<view class="confirm-btn">加入购物车</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'FlavorPopup',
	data() {
		return {
			visible: false,
			dish: {}          // open 时写入，模板渲染全靠它
		}
	},
	computed: {
		// 后端 flavors: [{name:'温度', value:'冷,热'}]，value 是逗号串，拆成数组供渲染
		flavorGroups() {
			return (this.dish.flavors || []).map((group) => ({
				name: group.name,
				options: (group.value || '').split(',')
			}))
		}
	},
	methods: {
		// 对外唯一入口：父组件里 this.$refs.flavorPopup.open(dish)
		open(dish) {
			this.dish = dish
			this.visible = true
		},
		close() {
			this.visible = false
		}
	}
}
</script>

<style lang="scss" scoped>
	.flavor-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 1001;                   // 压过购物车栏(999)：口味弹层才是最顶层
		background: rgba(0, 0, 0, 0.4);
		opacity: 0;
		visibility: hidden;              // 收起时不拦截点击
		transition: all .25s;

		&.show {
			opacity: 1;
			visibility: visible;
		}
	}

	.flavor-popup {
		position: fixed;
		left: 50%;
		top: 50%;                        // 屏幕正中：translate(-50%,-50%) 负 margin 定位
		z-index: 1002;
		display: flex;
		flex-direction: column;
		width: 640rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;                // 收口圆角，内容不顶出去
		transform: translate(-50%, -50%) scale(.92);   // 收起态：缩小+透明
		opacity: 0;
		visibility: hidden;
		transition: all .25s ease;

		&.up {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
			visibility: visible;
		}

		.popup-close {
			position: absolute;
			right: 20rpx;
			top: 20rpx;
			z-index: 1;                  // 浮在滚动内容之上
			width: 56rpx;
			height: 56rpx;
			line-height: 52rpx;          // 视觉居中微调
			text-align: center;
			border-radius: 50%;
			background-color: $bg-cat;
			color: $text-sub;
			font-size: 40rpx;
		}

		.popup-body {
			max-height: 56vh;            // 口味组再多也不出屏，超出内滚
			box-sizing: border-box;
			padding: 40rpx 32rpx 8rpx;
		}

		.popup-dish {
			display: flex;
			gap: 24rpx;
			padding-right: 72rpx;        // 让位给关闭按钮

			image {
				width: 120rpx;
				height: 120rpx;
				border-radius: 12rpx;
				flex-shrink: 0;
				background-color: $bg-cat;
			}

			.dish-right {
				flex: 1;
				min-width: 0;

				.dish-name {
					font-size: $font-md;
					font-weight: 600;
					color: $text-main;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.dish-price {
					margin-top: 12rpx;
					font-size: $font-lg;
					font-weight: 500;
					color: $price-color;

					.ico {
						font-size: $font-xs;
					}
				}
			}
		}

		.flavor-group {
			margin-top: 32rpx;

			.group-name {
				font-size: $font-sm;
				font-weight: 600;
				color: $text-main;
			}

			.tags {
				display: flex;
				flex-wrap: wrap;
				gap: 20rpx;
				margin-top: 20rpx;

				.tag {
					padding: 10rpx 32rpx;
					border-radius: 999rpx;    // 胶囊标签
					background-color: $bg-cat;
					color: $text-sub;
					font-size: $font-xs;
				}
			}
		}

		.popup-footer {
			padding: 24rpx 32rpx 32rpx;

			.confirm-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				height: 88rpx;
				border-radius: 999rpx;        // 通栏胶囊大按钮
				background: $brand-gradient;
				color: #1a1a1a;
				font-size: $font-md;
				font-weight: 600;
			}
		}
	}
</style>

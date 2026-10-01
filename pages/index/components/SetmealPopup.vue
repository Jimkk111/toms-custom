<template>
	<view>
		<view class="setmeal-mask" :class="{ show: visible }" @click="close"></view>
		<view class="setmeal-popup" :class="{ up: visible }">
			<view class="popup-close" @click="close">×</view>
			<scroll-view class="popup-body" scroll-y>
				<image class="setmeal-img" :src="setmeal.img" mode="aspectFill"></image>
				<view class="setmeal-name">{{ setmeal.name }}</view>
				<view class="setmeal-desc" v-if="setmeal.desc">{{ setmeal.desc }}</view>
				<view class="setmeal-price"><text class="ico">￥</text>{{ setmeal.price }}</view>
			</scroll-view>
			<!-- 底部操作区：通栏"加入购物车" -->
			<view class="popup-footer">
				<view class="confirm-btn" @click="handleAddSetmeal">加入购物车</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'SetmealPopup',
	data() {
		return {
			visible: false,
			setmeal: {}       // open 时写入，弹窗里的展示全靠它
		}
	},
	methods: {
		// 对外唯一入口：父组件里 this.$refs.setmealPopup.open(setmeal)
		open(setmeal) {
			this.setmeal = setmeal
			this.visible = true
		},
		close() {
			this.visible = false
		},
		// 套餐没有口味维度，确认即提交：发整套数据给页面，由页面调 store 加购
		handleAddSetmeal() {
			this.$emit('addSetmeal', this.setmeal)
			this.close()
		}
	}
}
</script>

<style lang="scss" scoped>
	.setmeal-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 1001;                   // 压过购物车栏(999)：弹层才是最顶层
		background: rgba(0, 0, 0, 0.4);
		opacity: 0;
		visibility: hidden;              // 收起时不拦截点击
		transition: all .25s;

		&.show {
			opacity: 1;
			visibility: visible;
		}
	}

	.setmeal-popup {
		position: fixed;
		left: 50%;
		top: 50%;                        // 屏幕正中
		z-index: 1002;
		display: flex;
		flex-direction: column;
		width: 640rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
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
			z-index: 1;                  // 浮在图片之上
			width: 56rpx;
			height: 56rpx;
			line-height: 52rpx;          // 视觉居中微调
			text-align: center;
			border-radius: 50%;
			background-color: rgba(0, 0, 0, 0.3);   // 深色底压在图上更清楚
			color: #fff;
			font-size: 40rpx;
		}

		.popup-body {
			max-height: 56vh;
			box-sizing: border-box;
			padding: 24rpx 32rpx 8rpx;
		}

		.setmeal-img {
			width: 100%;
			height: 320rpx;
			border-radius: 12rpx;
			background-color: $bg-cat;
		}

		.setmeal-name {
			margin-top: 24rpx;
			font-size: $font-md;
			font-weight: 600;
			color: $text-main;
		}

		.setmeal-desc {
			margin-top: 8rpx;
			font-size: $font-xs;
			line-height: 36rpx;
			color: $text-sub;
		}

		.setmeal-price {
			margin-top: 16rpx;
			font-size: $font-lg;
			font-weight: 500;
			color: $price-color;

			.ico {
				font-size: $font-xs;
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

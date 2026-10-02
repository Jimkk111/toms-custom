<template>
	<view class="page">
		<!-- 地址信息 + 预计送达（选地址/改地址的跳转后续接） -->
		<view class="card">
			<view class="addr-row">
				<view class="addr-info">
					<view class="contact" v-if="address">
						<text class="consignee">{{ address.consignee }}</text>
						<text class="phone">{{ address.phone }}</text>
					</view>
					<view class="addr-text">{{ address ? fullAddress : '暂无默认收货地址' }}</view>
				</view>
				<view class="arrow"></view>
			</view>
			<view class="eta-row">预计 {{ eta }} 送达（尽快送出）</view>
		</view>

		<!-- 订单明细 -->
		<view class="card">
			<view class="card-head">
				<text class="title">订单明细</text>
				<text class="count">共 {{ cartStore.totalCount }} 件</text>
			</view>
			<view class="line" v-for="line in cartStore.items" :key="line.id">
				<view class="line-info">
					<view class="line-name">{{ line.name }}</view>
					<view class="line-flavor" v-if="line.flavors.length">{{ line.flavors.join(' / ') }}</view>
				</view>
				<view class="line-qty">×{{ line.qty }}</view>
				<view class="line-price">￥{{ (line.price * line.qty).toFixed(2) }}</view>
			</view>
			<view class="total-row">
				<text class="total-label">合计</text>
				<text class="total-price">￥{{ cartStore.totalAmount }}</text>
			</view>
		</view>

		<!-- 添加备注 -->
		<view class="card">
			<view class="card-head">
				<text class="title">添加备注</text>
			</view>
			<textarea class="remark" v-model="remark" :maxlength="200"
				placeholder="口味偏好、放门口等（选填）" placeholder-class="remark-ph" />
		</view>

		<!-- 支付按钮（支付逻辑后续接） -->
		<view class="pay-bar">
			<view class="pay-btn" @click="onPayment()">去支付￥{{ cartStore.totalAmount }}</view>
		</view>
	</view>
</template>

<script>
import { useCartStore } from '../../stores/cart'
import { getDefaultAddress } from '../../api/address.js'
import { orderSubmit,orderPayment,getOrderDetail } from '../../api/order.js'; 

export default {
	data() {
		return {
			remark: '',
			eta: '',
			address: null,      // 默认收货地址，onLoad 拉取；为空显示占位提示
			payMethod: 0,
			isPaying: false
		}
	},
	computed: {
		cartStore() {
			return useCartStore()
		},
		// 省市区 + 详细地址拼成一行
		fullAddress() {
			if (!this.address) return ''
			const { provinceName, cityName, districtName, detail } = this.address
			return `${provinceName || ''}${cityName || ''}${districtName || ''}${detail || ''}`
		}
	},
	methods:{
		async onPayment() {
			if (this.isPaying) return                // 防连点
			if (!this.address) {
				uni.showToast({ title: '请先添加收货地址', icon: 'none' })
				return
			}
			this.isPaying = true
			try {
				// request 层：成功给的就是 data（此处为 {orderNumber,...}），失败为 null 且已 toast
				const order = await orderSubmit({
					addressBookId: this.address.id,
					remark: this.remark,
					payMethod: this.payMethod
				})
				console.log('地址是=====>：',this.address)
				if (!order) return
				await orderPayment({ orderNumber: order.orderNumber, payMethod: this.payMethod })
				this.pollPayStatus(order.id)   // 轮询独立出去，不被 finally 杀
			} catch (e) {
				uni.showToast({ title: e.message || '支付失败', icon: 'none' })
			} finally {
				this.isPaying = false
			}
		},
		// 支付结果轮询：带次数上限，防止后端异常时无限转
		async pollPayStatus(orderId, retries = 15) {
			if (retries <= 0) {
				uni.showToast({ title: '支付结果确认超时，请稍后在订单中查看', icon: 'none' })
				return
			}
			const detail = await getOrderDetail(orderId)   // detail 即订单对象本身
			if (!detail) return
			if (detail.payStatus === 1) {
				uni.showToast({ title: '支付成功', icon: 'success' })
				return
			}
			setTimeout(() => this.pollPayStatus(orderNumber, retries - 1), 2000)
		}
	},
	async onLoad() {
		// 进页先刷一次服务端购物车（车随账号走，以服务端为准）
		await this.cartStore.load()
		// 默认地址：后端没有默认地址时 data 为空，保持占位提示不报错
		this.address = (await getDefaultAddress()) || null
		// 空车直进守卫：正常流程必然从购物车结算进来，不该出现空明细
		if (!useCartStore().items.length) {
			uni.showToast({ title: '请先选购商品', icon: 'none' })
			setTimeout(() => uni.navigateBack(), 600)
			return
		}
		// 预计送达：当前时间 +30 分钟的前端拍脑袋值，后续可换后端预估
		const eta = new Date(Date.now() + 30 * 60 * 1000)
		const pad = (n) => String(n).padStart(2, '0')
		this.eta = `${pad(eta.getHours())}:${pad(eta.getMinutes())}`
	}
}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100%;
		box-sizing: border-box;
		padding: 20rpx 20rpx calc(160rpx + env(safe-area-inset-bottom));   // 底部让位支付按钮
		background-color: $bg-page;

		.card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;
		}

		.card-head {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.title {
				font-size: $font-md;
				font-weight: 600;
				color: $text-main;
			}

			.count {
				font-size: $font-xs;
				color: $text-sub;
			}
		}

		/* ---- 地址卡 ---- */
		.addr-row {
			display: flex;
			align-items: center;
			gap: 16rpx;

			.addr-info {
				flex: 1;
				min-width: 0;            // 长地址收缩，不把箭头挤出去

				.contact {
					display: flex;
					align-items: center;
					gap: 16rpx;
					margin-bottom: 8rpx;

					.consignee {
						font-size: $font-md;
						font-weight: 600;
						color: $text-main;
					}

					.phone {
						font-size: $font-sm;
						color: $text-sub;
					}
				}
			}

			.addr-text {
				font-size: $font-sm;
				color: $text-main;
				line-height: 40rpx;
			}

			.arrow {                          // CSS 画的 ">"，暗示可进地址页（跳转后续接）
				width: 16rpx;
				height: 16rpx;
				flex-shrink: 0;
				border-top: 4rpx solid $text-placeholder;
				border-right: 4rpx solid $text-placeholder;
				transform: rotate(45deg);
			}
		}

		.eta-row {
			margin-top: 16rpx;
			padding-top: 16rpx;
			border-top: 1rpx dashed $line-color;
			font-size: $font-xs;
			color: $text-sub;
		}

		/* ---- 订单明细 ---- */
		.line {
			display: flex;
			align-items: center;
			gap: 16rpx;
			padding: 20rpx 0;

			.line-info {
				flex: 1;
				min-width: 0;                // 长菜名收缩省略，不挤右列

				.line-name {
					font-size: $font-sm;
					color: $text-main;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.line-flavor {
					margin-top: 4rpx;
					font-size: $font-xxs;
					color: $text-sub;
				}
			}

			.line-qty {
				font-size: $font-sm;
				color: $text-sub;
			}

			.line-price {
				min-width: 110rpx;
				text-align: right;
				font-size: $font-sm;
				color: $text-main;
			}
		}

		.total-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-top: 20rpx;
			border-top: 1rpx solid $line-color;

			.total-label {
				font-size: $font-sm;
				color: $text-main;
			}

			.total-price {
				font-size: $font-lg;
				font-weight: 600;
				color: $price-color;
			}
		}

		/* ---- 备注 ---- */
		.remark {
			width: 100%;
			box-sizing: border-box;
			min-height: 120rpx;
			margin-top: 16rpx;
			padding: 16rpx;
			border-radius: 12rpx;
			background-color: $bg-cat;
			font-size: $font-sm;
			color: $text-main;
		}

		.remark-ph {
			color: $text-placeholder;
		}
	}

	/* ---- 底部支付按钮 ---- */
	.pay-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 20rpx calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;

		.pay-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 88rpx;
			border-radius: 999rpx;
			background: $brand-gradient;
			color: #1a1a1a;
			font-size: $font-md;
			font-weight: 600;
		}
	}
</style>

<template>
	<view class="page" v-if="order">
		<!-- 订单状态 -->
		<view class="card status-card">
			<view class="status-row">
				<view class="dot" :style="{ backgroundColor: statusInfo.color }"></view>
				<text class="status-text" :style="{ color: statusInfo.color }">{{ statusInfo.text }}</text>
			</view>
			<view class="status-desc">{{ statusDesc }}</view>
			<view class="reason" v-if="order.status === 6 && (order.cancelReason || order.rejectionReason)">
				{{ order.rejectionReason ? '商家拒单：' : '取消原因：' }}{{ order.rejectionReason || order.cancelReason }}
			</view>
		</view>

		<!-- 订单明细 -->
		<view class="card">
			<view class="card-head"><text class="title">订单明细</text></view>
			<view class="line" v-for="d in detailList" :key="d.id">
				<image class="thumb" v-if="d.image" :src="d.image" mode="aspectFill"></image>
				<view class="thumb thumb-fallback" v-else>{{ (d.name || '').slice(0, 1) }}</view>
				<view class="line-info">
					<view class="line-name">{{ d.name }}</view>
					<view class="line-flavor" v-if="d.dishFlavor">{{ d.dishFlavor }}</view>
				</view>
				<view class="line-qty">×{{ d.number }}</view>
				<view class="line-price">￥{{ fmtAmount(d.amount) }}</view>
			</view>
			<view class="fee-row" v-if="order.packAmount > 0">
				<text>打包费</text>
				<text>￥{{ order.packAmount }}</text>
			</view>
			<view class="total-row">
				<text>合计</text>
				<text class="total-price">￥{{ fmtAmount(order.amount) }}</text>
			</view>
		</view>

		<!-- 配送信息 -->
		<view class="card">
			<view class="card-head"><text class="title">配送信息</text></view>
			<view class="info-row"><text class="k">收货人</text><text class="v">{{ order.consignee }}　{{ order.phone }}</text></view>
			<view class="info-row"><text class="k">收货地址</text><text class="v">{{ order.address || '-' }}</text></view>
			<view class="info-row" v-if="order.estimatedDeliveryTime"><text class="k">预计送达</text><text class="v">{{ fmtTime(order.estimatedDeliveryTime) }}</text></view>
			<view class="info-row" v-if="order.deliveryTime"><text class="k">送达时间</text><text class="v">{{ fmtDateTime(order.deliveryTime) }}</text></view>
			<view class="info-row"><text class="k">下单时间</text><text class="v">{{ fmtDateTime(order.orderTime) }}</text></view>
			<view class="info-row" v-if="order.checkoutTime"><text class="k">支付时间</text><text class="v">{{ fmtDateTime(order.checkoutTime) }}</text></view>
		</view>

		<!-- 订单信息 -->
		<view class="card">
			<view class="card-head"><text class="title">订单信息</text></view>
			<view class="info-row"><text class="k">订单号</text><text class="v">{{ order.number }}</text></view>
			<view class="info-row"><text class="k">支付方式</text><text class="v">{{ payMethodText }}</text></view>
			<view class="info-row"><text class="k">备注</text><text class="v">{{ order.remark || '未填写' }}</text></view>
		</view>

		<!-- 底部操作：与订单列表一致（待付款去支付 / 进行中催单 / 已终态再来一单） -->
		<view class="act-bar" v-if="actionText">
			<view class="act-btn" :class="{ fill: order.status === 1 }" @click="onAction">{{ actionText }}</view>
		</view>
	</view>

	<!-- 加载失败兜底（失败 toast 由 request 层负责，这里只留静态提示） -->
	<view class="page fail" v-else-if="loaded">
		<view class="fail-text">订单加载失败，请返回重试</view>
	</view>
</template>

<script>
	import { getOrderDetail, orderPayment, orderAgain, orderReminder } from '../../api/order.js'
	import { ORDER_STATUS_MAP } from '../../utils/orderStatus.js'

	// 各状态的一句人话描述
	const STATUS_DESC = {
		1: '订单待支付，请尽快完成支付',
		2: '订单已提交，等待商家接单',
		3: '商家已接单，正加紧为您备餐',
		4: '骑手正在派送中，请保持电话畅通',
		5: '订单已完成，感谢您的信任',
		6: '订单已取消'
	}

	export default {
		data() {
			return {
				orderId: null,
				order: null,
				loaded: false,
				paying: false,           // 防重复拉起支付
				reminding: false        // 防连点催单
			}
		},
		computed: {
			statusInfo() {
				const status = this.order ? this.order.status : null
				return ORDER_STATUS_MAP[status] || { text: '未知状态', color: '#999999' }
			},
			statusDesc() {
				return STATUS_DESC[this.order.status] || ''
			},
			// 明细列表：后端字段 orderDetailList/orderDetails 两个口子都认
			detailList() {
				if (!this.order) return []
				return this.order.orderDetailList || this.order.orderDetails || []
			},
			payMethodText() {
				return this.order.payMethod === 2 ? '支付宝支付' : '微信支付'
			},
			actionText() {
				const status = this.order.status
				if (status === 1) return '去支付'
				if (status >= 2 && status <= 4) return '催单'
				if (status === 5 || status === 6) return '再来一单'
				return ''
			}
		},
		methods: {
			fmtAmount(amount) {
				return (Number(amount) || 0).toFixed(2)
			},
			// 时间统一出口：字符串截位；数字时间戳（秒/毫秒）先转 Date
			toDate(t) {
				if (!t) return null
				if (typeof t === 'number') return new Date(t > 1e12 ? t : t * 1000)
				return null
			},
			fmtDateTime(t) {
				if (!t) return ''
				const d = this.toDate(t)
				if (!d) return String(t).replace('T', ' ').slice(0, 16)
				const pad = (n) => String(n).padStart(2, '0')
				return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
			},
			fmtTime(t) {
				if (!t) return ''
				const d = this.toDate(t)
				if (!d) return String(t).replace('T', ' ').slice(11, 16)
				const pad = (n) => String(n).padStart(2, '0')
				return `${pad(d.getHours())}:${pad(d.getMinutes())}`
			},
			async loadDetail() {
				const detail = await getOrderDetail(this.orderId)
				this.order = detail || null
				this.loaded = true
			},
			onAction() {
				if (this.order.status === 1) this.onPay()
				else if (this.order.status >= 2 && this.order.status <= 4) this.onReminder()
				else this.onAgain()
			},
			async onPay() {
				if (this.paying) return
				this.paying = true
				try {
					const payInfo = await orderPayment({ orderNumber: this.order.number, payMethod: 0 })
					if (!payInfo) return                  // 失败 request 层已 toast
					// 有真实支付参数才拉收银台；mock 模式（开发环境）直接轮询结果
					if (payInfo.timeStamp && payInfo.packageStr) {
						const ok = await new Promise((resolve) => {
							uni.requestPayment({
								timeStamp: payInfo.timeStamp,
								nonceStr: payInfo.nonceStr,
								package: payInfo.packageStr,
								signType: payInfo.signType || 'RSA',
								paySign: payInfo.paySign,
								success: () => resolve(true),
								fail: () => resolve(false)
							})
						})
						if (!ok) {
							uni.showToast({ title: '已取消支付', icon: 'none' })
							return
						}
					}
					this.pollPayStatus(this.order.id)
				} finally {
					this.paying = false
				}
			},
			// 支付结果轮询：确认成功后原地重拉详情（状态会从待付款流转到待接单）
			async pollPayStatus(orderId, retries = 15) {
				if (retries <= 0) {
					uni.showToast({ title: '支付结果确认超时，请稍后刷新查看', icon: 'none' })
					return
				}
				const detail = await getOrderDetail(orderId)
				if (!detail) return
				if (detail.payStatus === 1) {
					uni.showToast({ title: '支付成功', icon: 'success' })
					this.loadDetail()
					return
				}
				setTimeout(() => this.pollPayStatus(orderId, retries - 1), 2000)
			},
			async onReminder() {
				if (this.reminding) return
				this.reminding = true
				try {
					const ok = await orderReminder(this.order.id)
					if (ok) uni.showToast({ title: '已提醒商家加急备餐', icon: 'none' })
				} finally {
					this.reminding = false
				}
			},
			async onAgain() {
				const ok = await orderAgain(this.order.id)
				if (!ok) return
				uni.showToast({ title: '菜品已重新加入购物车', icon: 'none' })
			}
		},
		async onLoad(options) {
			this.orderId = options.id
			await this.loadDetail()
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100%;
		box-sizing: border-box;
		padding: 20rpx 20rpx calc(160rpx + env(safe-area-inset-bottom));   // 底部让位操作按钮
		background-color: $bg-page;

		.card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;
		}

		.card-head {
			margin-bottom: 8rpx;

			.title {
				font-size: $font-md;
				font-weight: 600;
				color: $text-main;
			}
		}

		/* ---- 状态卡 ---- */
		.status-card {
			.status-row {
				display: flex;
				align-items: center;
				gap: 16rpx;

				.dot {
					width: 20rpx;
					height: 20rpx;
					border-radius: 50%;
				}

				.status-text {
					font-size: $font-lg;
					font-weight: 600;
				}
			}

			.status-desc {
				margin-top: 12rpx;
				font-size: $font-sm;
				color: $text-sub;
			}

			.reason {
				margin-top: 8rpx;
				font-size: $font-xs;
				color: $text-placeholder;
			}
		}

		/* ---- 订单明细 ---- */
		.line {
			display: flex;
			align-items: center;
			gap: 16rpx;
			padding: 20rpx 0;

			.thumb {
				width: 96rpx;
				height: 96rpx;
				border-radius: 12rpx;
				flex-shrink: 0;
				background-color: $bg-cat;
			}

			.thumb-fallback {          // 无图菜品：灰底 + 菜名首字占位
				display: flex;
				align-items: center;
				justify-content: center;
				color: $text-placeholder;
				font-size: $font-lg;
			}

			.line-info {
				flex: 1;
				min-width: 0;           // 长菜名收缩省略，不挤右列

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

		.fee-row,
		.total-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-top: 20rpx;
			border-top: 1rpx solid $line-color;
			font-size: $font-sm;
			color: $text-main;

			& + .total-row {
				margin-top: 20rpx;
			}
		}

		.total-row {
			.total-price {
				font-size: $font-lg;
				font-weight: 600;
				color: $price-color;
			}
		}

		/* ---- 信息行（配送/订单信息卡共用） ---- */
		.info-row {
			display: flex;
			gap: 24rpx;
			padding: 20rpx 0;

			& + .info-row {
				border-top: 1rpx solid $line-color;
			}

			.k {
				width: 140rpx;
				flex-shrink: 0;
				font-size: $font-sm;
				color: $text-sub;
			}

			.v {
				flex: 1;
				font-size: $font-sm;
				color: $text-main;
				line-height: 40rpx;
				word-break: break-all;
			}
		}
	}

	/* ---- 加载失败 ---- */
	.fail {
		display: flex;
		align-items: center;
		justify-content: center;

		.fail-text {
			font-size: $font-sm;
			color: $text-placeholder;
		}
	}

	/* ---- 底部操作按钮 ---- */
	.act-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 20rpx calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;

		.act-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 88rpx;
			border-radius: 999rpx;
			border: 1rpx solid #d9d9d9;
			color: $text-sub;
			font-size: $font-md;
			font-weight: 600;

			&.fill {
				border: none;
				background: $brand-gradient;
				color: #1a1a1a;
			}
		}
	}
</style>

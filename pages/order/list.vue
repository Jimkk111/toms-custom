<template>
	<view class="page">
		<!-- 状态筛选：横向可滚动 tabs -->
		<scroll-view class="tabs" scroll-x :show-scrollbar="false">
			<view class="tab" v-for="tab in tabs" :key="tab.label"
				:class="{ active: tabStatus === tab.value }"
				@click="switchTab(tab)">{{ tab.label }}</view>
		</scroll-view>

		<!-- 订单卡片 -->
		<view class="card" v-for="order in list" :key="order.id" @click="goDetail(order)">
			<view class="head">
				<text class="shop">满上</text>
				<text class="status" :style="{ color: statusInfo(order.status).color }">
					{{ statusInfo(order.status).text }}
				</text>
			</view>
			<view class="dishes">{{ dishesText(order) }}</view>
			<view class="reason" v-if="order.status === 6 && (order.cancelReason || order.rejectionReason)">
				{{ order.rejectionReason ? '商家拒单：' : '取消原因：' }}{{ order.rejectionReason || order.cancelReason }}
			</view>
			<view class="foot">
				<text class="time">{{ formatTime(order.orderTime) }}</text>
				<view class="amount">
					<text>{{ order.payStatus === 1 ? '实付' : '需付' }}</text>
					<text class="num">￥{{ fmtAmount(order.amount) }}</text>
				</view>
			</view>
			<view class="ops">
				<view class="btn btn-fill" v-if="order.status === 1" @click="onPay(order)">去支付</view>
				<view class="btn" v-if="order.status >= 2 && order.status <= 4" @click="onReminder(order)">催单</view>
				<view class="btn" v-if="order.status === 5 || order.status === 6" @click="onAgain(order)">再来一单</view>
			</view>
		</view>

		<!-- 空态：首拉完成且当前筛选无数据 -->
		<view class="empty" v-if="loaded && !list.length">
			<view class="empty-title">暂无{{ tabStatus === '' ? '' : statusInfo(tabStatus).text }}订单</view>
			<view class="empty-sub">去首页逛逛，好吃的在等你</view>
		</view>

		<!-- 分页加载提示 -->
		<view class="footer" v-if="list.length">
			<text v-if="loading">加载中…</text>
			<text v-else-if="finished">没有更多订单了</text>
		</view>
	</view>
</template>

<script>
	import { getOrderPage, getOrderDetail, orderPayment, orderAgain, orderReminder } from '../../api/order.js'
	import { ORDER_STATUS_MAP } from '../../utils/orderStatus.js'

	export default {
		data() {
			return {
				tabs: [
					{ label: '全部', value: '' },
					{ label: '待付款', value: 1 },
					{ label: '待接单', value: 2 },
					{ label: '已接单', value: 3 },
					{ label: '派送中', value: 4 },
					{ label: '已完成', value: 5 },
					{ label: '已取消', value: 6 }
				],
				tabStatus: '',         // '' = 全部，不传 status（cleanData 会滤掉空串）
				list: [],
				total: 0,
				page: 1,
				pageSize: 10,
				loading: false,
				finished: false,
				loaded: false,         // 首拉完成标志，空态展示门槛
				seq: 0,                // 请求序号：tab 快速切换时丢弃过期响应
				payingId: null,        // 正在支付的订单 id，防重复拉起
				remindingId: null      // 正在催单的订单 id，防连点刷接口
			}
		},
		methods: {
			statusInfo(status) {
				return ORDER_STATUS_MAP[status] || { text: '未知状态', color: '#999999' }
			},
			goDetail(order) {
				uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
			},
			// 菜品摘要：优先后端拼好的 orderDishes，兜底自己拼明细
			dishesText(order) {
				if (order.orderDishes) return order.orderDishes
				const details = order.orderDetailList || order.orderDetails || []
				return details.map((d) => `${d.name}×${d.number}`).join('，')
			},
			// 下单时间：字符串截到分钟；数字时间戳（秒/毫秒都兼容）转一遍
			formatTime(t) {
				if (!t) return ''
				if (typeof t === 'number') {
					const d = new Date(t > 1e12 ? t : t * 1000)
					const pad = (n) => String(n).padStart(2, '0')
					return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
				}
				return String(t).replace('T', ' ').slice(0, 16)
			},
			fmtAmount(amount) {
				return (Number(amount) || 0).toFixed(2)
			},
			switchTab(tab) {
				if (this.tabStatus === tab.value) return
				this.tabStatus = tab.value
				this.load(true)
			},
			// reset=true 重拉第一页（切 tab/下拉/支付成功后）；否则加载下一页
			async load(reset = false) {
				if (!reset && (this.loading || this.finished)) return
				if (reset) {
					this.page = 1
					this.finished = false
				}
				this.loading = true
				const seq = ++this.seq
				const data = await getOrderPage({
					page: this.page,
					pageSize: this.pageSize,
					status: this.tabStatus
				})
				this.loading = false
				if (seq !== this.seq) return              // 过期响应：期间切了 tab 或又触发过 reset
				const records = (data && data.records) || []
				this.list = reset ? records : this.list.concat(records)
				this.total = (data && data.total) || 0
				this.finished = this.list.length >= this.total || records.length < this.pageSize
				if (!this.finished) this.page++
				this.loaded = true
			},
			async onPay(order) {
				if (this.payingId) return                 // 防连点
				this.payingId = order.id
				try {
					const payInfo = await orderPayment({ orderNumber: order.number, payMethod: 0 })
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
					this.pollPayStatus(order.id)
				} finally {
					this.payingId = null
				}
			},
			// 支付结果轮询：确认成功后原地刷新列表（提交订单页那套是跳成功页，这里保持列表上下文）
			async pollPayStatus(orderId, retries = 15) {
				if (retries <= 0) {
					uni.showToast({ title: '支付结果确认超时，请稍后刷新查看', icon: 'none' })
					return
				}
				const detail = await getOrderDetail(orderId)
				if (!detail) return
				if (detail.payStatus === 1) {
					uni.showToast({ title: '支付成功', icon: 'success' })
					this.load(true)
					return
				}
				setTimeout(() => this.pollPayStatus(orderId, retries - 1), 2000)
			},
			async onReminder(order) {
				if (this.remindingId) return          // 同一时间只放行一个催单请求
				this.remindingId = order.id
				try {
					const ok = await orderReminder(order.id)
					if (ok) uni.showToast({ title: '已提醒商家加急备餐', icon: 'none' })
				} finally {
					this.remindingId = null
				}
			},
			async onAgain(order) {
				const ok = await orderAgain(order.id)
				if (!ok) return
				uni.showToast({ title: '菜品已重新加入购物车', icon: 'none' })
			}
		},
		onLoad() {
			this.load(true)
		},
		onReachBottom() {
			this.load()
		},
		async onPullDownRefresh() {
			await this.load(true)
			uni.stopPullDownRefresh()
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100%;
		box-sizing: border-box;
		padding: 20rpx 20rpx calc(40rpx + env(safe-area-inset-bottom));
		background-color: $bg-page;

		/* ---- 状态 tabs ---- */
		.tabs {
			white-space: nowrap;
			margin-bottom: 20rpx;

			.tab {
				display: inline-block;
				padding: 12rpx 28rpx;
				margin-right: 16rpx;
				border-radius: 999rpx;
				background-color: #fff;
				color: $text-sub;
				font-size: $font-sm;

				&.active {
					background: $brand-gradient;
					color: #1a1a1a;
					font-weight: 600;
				}
			}
		}

		/* ---- 订单卡片 ---- */
		.card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;

			.head {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.shop {
					font-size: $font-md;
					font-weight: 600;
					color: $text-main;
				}

				.status {
					font-size: $font-sm;
				}
			}

			.dishes {
				margin-top: 12rpx;
				font-size: $font-sm;
				color: $text-sub;
				line-height: 40rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}

			.reason {
				margin-top: 8rpx;
				font-size: $font-xs;
				color: $text-placeholder;
			}

			.foot {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 12rpx;

				.time {
					font-size: $font-xs;
					color: $text-placeholder;
				}

				.amount {
					font-size: $font-xs;
					color: $text-sub;

					.num {
						font-size: $font-md;
						font-weight: 600;
						color: $price-color;
					}
				}
			}

			.ops {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				gap: 20rpx;
				margin-top: 16rpx;
				padding-top: 16rpx;
				border-top: 1rpx solid $line-color;

				.btn {
					padding: 10rpx 36rpx;
					border-radius: 999rpx;
					border: 1rpx solid #d9d9d9;
					color: $text-sub;
					font-size: $font-sm;
				}

				.btn-fill {
					border: none;
					background: $brand-gradient;
					color: #1a1a1a;
					font-weight: 600;
				}
			}
		}

		/* ---- 空态 ---- */
		.empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 200rpx;

			.empty-title {
				font-size: $font-md;
				color: $text-main;
			}

			.empty-sub {
				margin-top: 12rpx;
				font-size: $font-xs;
				color: $text-placeholder;
			}
		}

		.footer {
			padding: 8rpx 0 24rpx;
			text-align: center;
			font-size: $font-xs;
			color: $text-placeholder;
		}
	}
</style>

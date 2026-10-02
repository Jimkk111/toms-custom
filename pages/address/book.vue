<template>
	<view class="page">
		<!-- 选地址模式提示：进页前登记过返回目标（"我的"/提交订单页）即为选地址场景 -->
		<view class="tip" v-if="isSelectMode">请选择收货地址</view>

		<!-- 地址卡片 -->
		<view class="card" v-for="addr in list" :key="addr.id" @click="onSelect(addr)">
			<view class="contact">
				<text class="consignee">{{ addr.consignee }}</text>
				<text class="phone">{{ addr.phone }}</text>
				<text class="badge-default" v-if="addr.isDefault === 1">默认</text>
				<text class="badge-label" v-if="addr.label">{{ addr.label }}</text>
			</view>
			<view class="addr-text">{{ fullAddress(addr) }}</view>
			<view class="ops">
				<view class="default-toggle" @click.stop="noop">
					<text class="default-label">默认地址</text>
					<switch :checked="addr.isDefault === 1" color="#ffc200"
						@change="onToggleDefault(addr, $event)" />
				</view>
				<view class="text-ops">
					<text class="op" @click.stop="goEdit(addr)">编辑</text>
					<text class="op op-danger" @click.stop="onDelete(addr)">删除</text>
				</view>
			</view>
		</view>

		<!-- 空态：首拉完成且无数据才显示，避免进页闪一下"暂无地址" -->
		<view class="empty" v-if="loaded && !list.length">
			<view class="empty-title">暂无收货地址</view>
			<view class="empty-sub">添加地址后下单更方便</view>
		</view>

		<!-- 底部新增按钮 -->
		<view class="add-bar">
			<view class="add-btn" @click="goAdd">＋ 新增地址</view>
		</view>
	</view>
</template>

<script>
import { useAppStore } from '../../stores/app'
import { listAddress, deleteAddress, setDefaultAddress, updateAddress } from '../../api/address.js'

export default {
	data() {
		return {
			list: [],
			loaded: false       // 首拉完成标志，空态展示门槛
		}
	},
	computed: {
		appStore() {
			return useAppStore()
		},
		isSelectMode() {
			return this.appStore.addressBackUrl === 'pages/order/submit'
		}
	},
	onShow() {
		// 首次进入和从新增/编辑页返回都走这里，统一拉列表
		this.loadList()
	},
	methods: {
		fullAddress(addr) {
			return `${addr.provinceName || ''}${addr.cityName || ''}${addr.districtName || ''}${addr.detail || ''}`
		},
		async loadList() {
			const data = await listAddress()
			this.list = data || []
			this.loaded = true
		},
		// 选中地址：写入 app store 给返回目标页消费，redirectTo 回登记页（用完即清）
		onSelect(addr) {
			if (!this.isSelectMode) return
			this.appStore.setSelectedAddress(addr)
			const backUrl = this.appStore.addressBackUrl
			this.appStore.setAddressBackUrl('')
			uni.redirectTo({ url: backUrl })
		},
		noop() {},
		// 默认地址开关：开 = default 接口（后端顺带清掉其他默认）；
		// 关 = 通用修改接口把 isDefault 落回 0（default 接口实测无法取消默认）
		async onToggleDefault(addr, e) {
			if (e.detail.value) {
				await setDefaultAddress(addr.id)
			} else {
				await updateAddress({ id: addr.id, isDefault: 0 })
			}
			this.loadList()   // 成败都重拉，让开关回到真值（失败 request 层已 toast）
		},
		goAdd() {
			uni.navigateTo({ url: '/pages/address/edit' })
		},
		goEdit(addr) {
			uni.navigateTo({ url: `/pages/address/edit?id=${addr.id}` })
		},
		onDelete(addr) {
			uni.showModal({
				title: '提示',
				content: `确定删除「${addr.consignee}」的这个地址吗？`,
				success: async ({ confirm }) => {
					if (!confirm) return
					await deleteAddress([addr.id])
					this.loadList()
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100%;
		box-sizing: border-box;
		padding: 20rpx 20rpx calc(160rpx + env(safe-area-inset-bottom));   // 底部让位新增按钮
		background-color: $bg-page;

		.tip {
			padding: 16rpx 24rpx;
			margin-bottom: 20rpx;
			border-radius: 12rpx;
			background-color: rgba(255, 194, 0, 0.15);
			font-size: $font-xs;
			color: #b8860b;
		}

		.card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;

			.contact {
				display: flex;
				align-items: center;
				gap: 16rpx;

				.consignee {
					font-size: $font-md;
					font-weight: 600;
					color: $text-main;
				}

				.phone {
					font-size: $font-sm;
					color: $text-sub;
				}

				.badge-default {
					padding: 2rpx 12rpx;
					border-radius: 6rpx;
					background-color: rgba(255, 194, 0, 0.18);
					color: #d99a00;
					font-size: $font-xxs;
				}

				.badge-label {
					padding: 2rpx 12rpx;
					border-radius: 6rpx;
					background-color: $bg-cat;
					color: $text-sub;
					font-size: $font-xxs;
				}
			}

			.addr-text {
				margin-top: 12rpx;
				font-size: $font-sm;
				color: $text-main;
				line-height: 40rpx;
			}

			.ops {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 16rpx;
				padding-top: 16rpx;
				border-top: 1rpx solid $line-color;

				.default-toggle {
					display: flex;
					align-items: center;
					gap: 16rpx;

					.default-label {
						font-size: $font-sm;
						color: $text-sub;
					}
				}

				.text-ops {
					display: flex;
					align-items: center;
					gap: 48rpx;

					.op {
						font-size: $font-sm;
						color: $text-sub;
					}

					.op-danger {
						color: $price-color;
					}
				}
			}
		}

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
	}

	/* ---- 底部新增按钮 ---- */
	.add-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 20rpx calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;

		.add-btn {
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

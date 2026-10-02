<template>
	<view class="page">
		<!-- 用户信息卡：头像色块占位 + 昵称（登录后写入 user store） -->
		<view class="user-card">
			<view class="avatar">{{ avatarChar }}</view>
			<view class="info">
				<view class="name">{{ nickname }}</view>
				<view class="sub">欢迎回来，想吃什么？</view>
			</view>
		</view>

		<!-- 功能入口 -->
		<view class="card">
			<view class="menu-item" @click="goOrderList">
				<view class="menu-name">订单列表</view>
				<view class="arrow"></view>
			</view>
			<view class="menu-item" @click="goAddressBook">
				<view class="menu-name">地址簿</view>
				<view class="arrow"></view>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-btn" @click="handleLogout">退出登录</view>
	</view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { useCartStore } from '../../stores/cart'
import { useAppStore } from '../../stores/app'

export default {
	computed: {
		userStore() {
			return useUserStore()
		},
		// 后端 userInfo 字段名未定稿，nickName/nickname 都认，兜底"微信用户"
		nickname() {
			const info = this.userStore.userInfo || {}
			return info.nickName || info.nickname || '微信用户'
		},
		avatarChar() {
			return this.nickname.slice(0, 1)
		}
	},
	methods: {
		goOrderList() {
			uni.navigateTo({ url: '/pages/order/list' })
		},
		goAddressBook() {
			// 按 app store 约定：进地址页前先写返回目标，地址页选完地址 redirectTo 回"我的"
			useAppStore().setAddressBackUrl('/pages/my/my')
			uni.navigateTo({ url: '/pages/address/book' })
		},
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定退出登录吗？',
				success: ({ confirm }) => {
					if (!confirm) return
					useUserStore().logOut()        // 清 sessionId + userInfo（含 storage）
					useCartStore().$reset()        // 服务端购物车随账号走，本地缓存视图一并清掉
					uni.showToast({ title: '已退出登录', icon: 'none' })
					setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 500)
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
		padding: 20rpx 20rpx calc(40rpx + env(safe-area-inset-bottom));
		background-color: $bg-page;

		/* ---- 用户信息卡 ---- */
		.user-card {
			display: flex;
			align-items: center;
			gap: 24rpx;
			padding: 40rpx 24rpx;
			margin-bottom: 20rpx;
			background-color: #fff;
			border-radius: 16rpx;

			.avatar {                      // 色块头像占位，后续换微信头像
				display: flex;
				align-items: center;
				justify-content: center;
				width: 110rpx;
				height: 110rpx;
				border-radius: 50%;
				background: $brand-gradient;
				color: #1a1a1a;
				font-size: 44rpx;
				font-weight: 600;
			}

			.info {
				flex: 1;
				min-width: 0;

				.name {
					font-size: $font-lg;
					font-weight: 600;
					color: $text-main;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.sub {
					margin-top: 8rpx;
					font-size: $font-xs;
					color: $text-sub;
				}
			}
		}

		/* ---- 功能入口 ---- */
		.card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 0 24rpx;

			.menu-item {
				display: flex;
				align-items: center;
				gap: 16rpx;
				padding: 32rpx 0;

				& + .menu-item {
					border-top: 1rpx solid $line-color;
				}

				.menu-name {
					flex: 1;
					font-size: $font-md;
					color: $text-main;
				}

				.arrow {                  // CSS 画的 ">"
					width: 16rpx;
					height: 16rpx;
					flex-shrink: 0;
					border-top: 4rpx solid $text-placeholder;
					border-right: 4rpx solid $text-placeholder;
					transform: rotate(45deg);
				}
			}
		}

		/* ---- 退出登录 ---- */
		.logout-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 88rpx;
			margin-top: 40rpx;
			border-radius: 16rpx;
			background-color: #fff;
			color: $price-color;
			font-size: $font-md;
			font-weight: 600;
		}
	}
</style>

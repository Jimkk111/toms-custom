<template>
	<view class="page">
		<!-- <view class="brand">
			<view class="logo">满</view>
			<view class="name">满上</view>
			<view class="slogan">大众化的外送平台</view>
		</view> -->
		<view class="login-btn" @click="handleLogin">微信一键登录</view>
	</view>
</template>

<script>
import { login } from '../../api/user.js'
import { useUserStore } from '../../stores/user'

export default {
	methods: {
		async handleLogin() {
			const userStore = useUserStore()
			try {
				const loginRes = await uni.login({ provider: 'weixin' })
				const data = await login({ code: loginRes.code })
				if (!data) return            // 失败已被 request 层统一 toast
				userStore.setSessionId(data.sessionId)
				userStore.setUser(data.userInfo)
				uni.showToast({ title: '登录成功', icon: 'none' })
				setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 500)
			} catch (e) {
				uni.showToast({ title: '微信登录失败', icon: 'none' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		background-color: #fff;

		.brand {
			display: flex;
			flex-direction: column;
			align-items: center;

			.logo {                       // 色块logo占位，后续换图片
				display: flex;
				align-items: center;
				justify-content: center;
				width: 140rpx;
				height: 140rpx;
				border-radius: 32rpx;
				background: $brand-gradient;
				color: #1a1a1a;
				font-size: 72rpx;
				font-weight: 600;
			}

			.name {
				margin-top: 24rpx;
				font-size: 44rpx;
				font-weight: 600;
				color: $text-main;
			}

			.slogan {
				margin-top: 8rpx;
				font-size: $font-xs;
				color: $text-sub;
			}
		}

		.login-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 70%;
			height: 88rpx;
			margin-top: 120rpx;
			border-radius: 999rpx;
			background: $brand-gradient;
			color: #1a1a1a;
			font-size: $font-md;
			font-weight: 600;
		}
	}
</style>

<template>
	<HomeHeader></HomeHeader>
	<!-- <button @click="doLogin()">测试</button> -->
	<view class="main">
		<view class="head">
			<view class="shop-card">
				<view class="top">
					<view class="left">
						<image></image>
					</view>
					<view class="right">
						<view class="name">满上</view>
						<view class="list">
							<view class="item"><text>距离1.5km</text></view>
							<view class="item"><text>配送费6元</text></view>
							<view class="item"><text>预计时长12min</text></view>
						</view>
					</view>
				</view>
				<view class="bottom">
					<text class="intro">简介: 瑞吉外送是综合外送平台，定位"大众化的外送平台"旨在为顾客打造专业的外送平台。</text>
				</view>
			</view>
		</view>
		<view class="body">
			<view class="right"></view>
			<view class="left"></view>
		</view>
	</view>
	<view class="cart"></view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { login } from '../../api/user.js'
import HomeHeader from './components/HomeHeader.vue'
import { text } from 'stream/consumers';
	export default {
		components:{
        	HomeHeader
    	},
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			
		},
		methods: {
			doLogin(){
				uni.login({
					provider:'weixin',
					success: (res) => {
						const code = res.code
						login({ code })
						.then((res) => {
							const userStore = useUserStore()
							userStore.setSessionId(res.sessionId)
							console.log("user_sessionId=====>",userStore.sessionId)
						})
						.catch((e) => {
							console.log("登录失败！",e)
						})
					}
				})	
			}
		}
	}
</script>

<style lang="scss">
	.main{

		.head{
			box-sizing: border-box;
			height:146px;
			background: $nav-gradient;
			padding-top: 13px;
			padding-bottom: 13px;

			.shop-card{
				height:120px;
				width: 86%;
				border-radius: 10px;
				margin:auto;
				background-color: #fff;

				.top{
					border-bottom: 1px solid #f5f5f5;
					height:50%;
					display: flex;
					
					.left{
						padding:16rpx;
						image{
							width: 78rpx;
							height: 78rpx;
							border:1px solid black;
							border-radius: 16rpx;
						}
					}

					.right{
						padding:16rpx;
						display: flex;
						flex-direction: column;

						.name{
							height: 50%;
						}

						.list{
							height: 50%;
							display: flex;
							justify-content: space-between;
							align-items: center;

							.item{
								font-size: 24rpx;
							}
						}
					}
				}

				.bottom{
					padding:16rpx;

					.intro{
						font-size:24rpx;
						color:$text-sub
					}
				}
			}
		}
	}
</style>

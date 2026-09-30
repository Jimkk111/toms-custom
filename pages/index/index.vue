<template>
	<!-- <button @click="doLogin()">测试</button> -->
</template>

<script>
import { useUserStore } from '../../stores/user'
import { login } from '../../api/user.js'
	export default {
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

<style>

</style>

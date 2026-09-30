<script>
import { useAppStore } from './stores/app'; 
	export default {
		onLaunch: function() {
			console.log('App Launch')
			const appStore = useAppStore()
			const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
			appStore.setStatusBarHeight(statusBarHeight)
			console.log("statusBarHeight======>",appStore.statusBarHeight)
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>

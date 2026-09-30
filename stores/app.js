import { defineStore } from 'pinia'

// 应用级全局状态：无业务归属、跨页面共享的"横切状态"
// 与 user.js 的区别：user 有业务归属（用户域）且需要持久化；
// app 管的是运行时状态，每次冷启动从零开始才是正确行为，故不写 storage
export const useAppStore = defineStore('app', {
    state: () => ({
        // 全局 loading：由 utils/request.js 驱动（请求前开、complete 里关），
        // 任意页面用 v-if="appStore.loading" 挂遮罩消费
        loading: false,
        // 地址页的返回目标：从"我的"或"提交订单页"进地址页前各写一次，
        // 地址页选完后 redirectTo 回这里，用完即清
        addressBackUrl: '',
        statusBarHeight:0,
        capsuleBarHeight:44
    }),
    actions: {
        setLoading(v) {
            this.loading = v
        },
        setAddressBackUrl(url) {
            this.addressBackUrl = url
        },
        setStatusBarHeight(value){
            this.statusBarHeight = value
        }
    }
})

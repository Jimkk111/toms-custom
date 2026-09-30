import { defineStore } from 'pinia'

export const useUserStore = defineStore('user',{
    state: () => ({ 
        sessionId: uni.getStorageSync('SESSIONID') || '',
        userInfo: uni.getStorageSync('USERINFO') || {}
     }),
     actions: {
        setSessionId(sessionId){
            this.sessionId = sessionId
            uni.setStorageSync("SESSIONID",this.sessionId)
        },
        setUser(userInfo){
            this.userInfo = { 
                ...this.userInfo,
                ...userInfo
            }
            uni.setStorageSync("USERINFO",this.userInfo)
        },
        logOut(){
            this.sessionId = ''
            this.userInfo = {}
            uni.removeStorageSync('SESSIONID')
            uni.removeStorageSync('USERINFO')
        }
     }
})
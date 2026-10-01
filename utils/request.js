import baseUrl from '@/env.js'
import { useUserStore } from '../stores/user'
import { useAppStore } from '../stores/app'

const urlWhiteList = ['user/login']

const request = async function({url,data,method }){
    const appStore = useAppStore()
    const userStore = useUserStore()
    const setLoading = appStore.setLoading
    const sessionId = userStore.sessionId
    try{
        setLoading(true)
        const res = await uni.request({
            url: baseUrl + url,
            method,
            data,
            header:{
                Cookie: 'JSESSIONID=' + sessionId
            }
        })
        if (res.statusCode === '401' && !urlWhiteList.includes(url)) {
            userStore.logOut()
            setLoading(false)
            throw { code: 401, msg: res.data.msg }
        }
        setLoading(false)
        return res.data
    } catch(e) {
        console.warn(e)
        setLoading(false)
    }
}

export default request

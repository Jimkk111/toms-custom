import baseUrl from '@/env.js'
import { useUserStore } from '../stores/user'
import { useAppStore } from '../stores/app'

// ===== 与后端对齐的契约常量（后端约定变了只改这里）=====
const SUCCESS_CODE = 1        // 业务成功码
const NO_AUTH_URLS = [        // 无需登录态即可调用的接口（登录本身要在拿到凭证前调）
    '/user/login'
]

// 并发计数：>0 即 loading。布尔开关会被并发请求"提前关闭"
let pendingCount = 0

const request = async function ({ url, data = {}, method = 'GET', header = {}, silent = false }) {
    const userStore = useUserStore()
    const appStore = useAppStore()

    // 前置拦截：白名单外、未登录 → 不发请求（省一次注定失败的往返）
    if (!NO_AUTH_URLS.includes(url) && !userStore.sessionId) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return null
    }

    if (!silent) {
        pendingCount++
        appStore.setLoading(pendingCount > 0)
    }

    try {
        const res = await uni.request({
            url: baseUrl + url,
            method,
            data,
            timeout: 10000,                    // 默认 60s 太久，用户等不了
            header: {
                Cookie: 'JSESSIONID=' + userStore.sessionId,
                ...header                      // 调用方可扩展（如上传文件时的 Content-Type）
            }
        })

        // ---- HTTP 层 ----
        // 鉴权失败：后端返回 HTTP 401（实测确认）→ 清本地登录态，引导重登
        if (res.statusCode === 401) {
            userStore.logOut()
            uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
            return null
        }
        // 404/500/502 等：body 是网关错误体，结构不可信
        if (res.statusCode !== 200) {
            uni.showToast({ title: '服务异常，请稍后重试', icon: 'none' })
            return null
        }

        // ---- 业务层：{code, data, msg} ----
        const body = res.data
        if (body.code === SUCCESS_CODE) {
            return body.data                   // 唯一的成功出口：只交业务数据
        }
        uni.showToast({ title: body.msg || '操作失败', icon: 'none' })   // 其他业务失败，说后端的话
        return null
    } catch (e) {                              // ---- 网络层：断网/超时/URL 非法 ----
        console.warn('[request fail]', url, e)
        uni.showToast({ title: '网络不给力，请检查网络', icon: 'none' })
        return null
    } finally {                                // 无论成败，收口一处关 loading
        if (!silent) {
            pendingCount--
            appStore.setLoading(pendingCount > 0)
        }
    }
}

export default request

import request from "@/utils/request.js"

// 地址簿接口（需要登录态，不进白名单）
export const getDefaultAddress = () => {
	return request({
		url: '/addressBook/default',
		method: 'get'
	})
}

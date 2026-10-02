import request from "@/utils/request.js"

// 地址簿接口（需要登录态，不进白名单）
// 写接口（增/删/改/设默认）成功时 data 是提示字符串，失败返回 null —— 调用方以此判断成败

// 查询当前用户地址列表
export const listAddress = () => {
	return request({
		url: '/addressBook/list',
		method: 'get'
	})
}

// 查询默认地址
export const getDefaultAddress = () => {
	return request({
		url: '/addressBook/default',
		method: 'get'
	})
}

// 根据 id 查询地址（编辑页回显用）
export const getAddressById = (id) => {
	return request({
		url: `/addressBook/${id}`,
		method: 'get'
	})
}

// 新增地址
export const addAddress = (data) => {
	return request({
		url: '/addressBook',
		method: 'post',
		data
	})
}

// 修改地址
export const updateAddress = (data) => {
	return request({
		url: '/addressBook',
		method: 'put',
		data
	})
}

// 删除地址：后端是 @RequestParam List<Long> ids；微信端 DELETE 的 data 不保证上请求，直接拼进 URL 最稳
export const deleteAddress = (ids) => {
	return request({
		url: `/addressBook?ids=${ids.join(',')}`,
		method: 'delete'
	})
}

// 设为默认地址（body 只需要 id）
export const setDefaultAddress = (id) => {
	return request({
		url: '/addressBook/default',
		method: 'put',
		data: { id }
	})
}

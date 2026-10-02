import request from "@/utils/request.js"

// 地址簿接口（需要登录态，不进白名单）
// 后端写接口（增/删/改/设默认）成功时 data 为 null（实测），统一传 voidOk：成功拿 true、失败 null

// 查询当前用户地址列表
export const listAddress = () => {
	return request({
		url: '/addressBook/list',
		method: 'get'
	})
}

// 查询默认地址（没设过默认时 data 为 null，这是业务语义不是失败，调用方自行兜底）
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
		data,
		voidOk: true
	})
}

// 修改地址（也用于单字段更新，如取消默认：只传 {id, isDefault:0}，其他字段不会被冲掉）
export const updateAddress = (data) => {
	return request({
		url: '/addressBook',
		method: 'put',
		data,
		voidOk: true
	})
}

// 删除地址：后端是 @RequestParam List<Long> ids；微信端 DELETE 的 data 不保证上请求，直接拼进 URL 最稳
export const deleteAddress = (ids) => {
	return request({
		url: `/addressBook?ids=${ids.join(',')}`,
		method: 'delete',
		voidOk: true
	})
}

// 设为默认地址（body 只需要 id；后端会顺带清掉该用户其他地址的默认标记，且实测无法用它取消默认）
export const setDefaultAddress = (id) => {
	return request({
		url: '/addressBook/default',
		method: 'put',
		data: { id },
		voidOk: true
	})
}

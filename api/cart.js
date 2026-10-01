import request from "@/utils/request.js"

// 服务端购物车接口
// 行身份 = dishId/setmealId + dishFlavor 三件套，后端据此并行/定位行
export const addCart = ( data ) => {
	return request({
		url: '/shoppingCart/add',
		method: 'post',
		data
	})
}

export const subCart = ( data ) => {
	return request({
		url: '/shoppingCart/sub',
		method: 'post',
		data
	})
}

export const cleanCart = () => {
	return request({
		url: '/shoppingCart/clean',
		method: 'delete'
	})
}

export const listCart = () => {
	return request({
		url: '/shoppingCart/list',
		method: 'get'
	})
}

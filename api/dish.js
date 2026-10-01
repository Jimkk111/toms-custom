import request from "@/utils/request.js"

export const getCategoryList = ( ) => {
	return request({
		url: '/category/list',
		method:'get',
		data:{ }
	})
}	

export const getDishList = ( categoryId ) => {
	return request({
		url: '/dish/list',
		method:'get',
		data:{ categoryId }
	})
}

export const getSetmealList = ( categoryId ) => {
	return request({
		url: '/setmeal/list',
		method:'get',
		data:{ categoryId }
	})
}

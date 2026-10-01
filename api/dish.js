import request from "@/utils/request.js"

export const getDishList = ( categoryId ) => {
	return request({
		url: '/dish/list',
		method:'get',
		data:{ categoryId }
	})
}

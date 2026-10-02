import request from "@/utils/request.js"

export const orderSubmit = (data) => {
    return request({
        url: '/order/submit',
        method: 'post',
        data:data
    })
}

export const orderPayment = (data) => {
    return request({
        url: '/order/payment',
        method: 'post',
        data:data
    })
}

export const getOrderDetail = (orderId) => {
    return request({
        url: `/order/orderDetail/${orderId}`,
        method: 'get'
    })
}

// 历史订单分页（status 传空查全部；写接口与用户页共用 {page,pageSize} 契约）
export const getOrderPage = (params) => {
    return request({
        url: '/order/userPage',
        method: 'get',
        data: params
    })
}

// 再来一单：后端把该订单的菜品重新加回购物车（body 实际只用 id；成功 data 为 null，voidOk 拿 true）
export const orderAgain = (id) => {
    return request({
        url: '/order/again',
        method: 'post',
        data: { id },
        voidOk: true
    })
}

// 催单（成功 data 为 null，voidOk 拿 true）
export const orderReminder = (id) => {
    return request({
        url: `/order/reminder/${id}`,
        method: 'put',
        voidOk: true
    })
}
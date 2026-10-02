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
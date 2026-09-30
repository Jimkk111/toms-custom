import request from '@/utils/request'

export const login = function( data ){
    return request({
        url:'/user/login',
        method:'post',
        data
    })
}
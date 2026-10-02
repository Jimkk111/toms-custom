// 订单状态枚举：与后端 Orders.status 对齐（订单列表/详情页共用）
export const ORDER_STATUS_MAP = {
	1: { text: '待付款', color: '#e94e3c' },
	2: { text: '待接单', color: '#d99a00' },
	3: { text: '已接单', color: '#d99a00' },
	4: { text: '派送中', color: '#d99a00' },
	5: { text: '已完成', color: '#07c160' },
	6: { text: '已取消', color: '#999999' }
}

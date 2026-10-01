import { defineStore } from 'pinia'
import { addCart, subCart, cleanCart, listCart } from '@/api/cart.js'

// 服务端购物车：接口数据为准，本地 state 只是缓存视图（不再落 storage，车随账号走）
// 后端行身份 = dishId/setmealId + dishFlavor 三件套；行上冗余保留 dishId/setmealId 供卡片角标跨口味聚合
// amount 是后端存的单价快照，合计 = Σ amount × number
const toLine = (row) => ({
    id: row.id,
    dishId: row.dishId || null,
    setmealId: row.setmealId || null,
    dishFlavor: row.dishFlavor || '',
    name: row.name,
    image: row.image,
    price: row.amount,
    flavors: row.dishFlavor ? row.dishFlavor.split(',') : [],
    qty: row.number
})

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: []
    }),

    getters: {
        // 购物车栏大角标：总份数
        totalCount: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),
        // 合计金额（乘加后收口到分）
        totalAmount: (state) =>
            Math.round(state.items.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100
    },

    actions: {
        // 菜品卡角标：同 dishId 的所有口味行数量之和
        qtyOf(dishId) {
            return this.items
                .filter((item) => item.dishId === dishId)
                .reduce((sum, item) => sum + item.qty, 0)
        },
        // 套餐卡角标：dish 与 setmeal 的 id 来自不同表、可能撞号，分开两个口子查
        setmealQtyOf(setmealId) {
            return this.items
                .filter((item) => item.setmealId === setmealId)
                .reduce((sum, item) => sum + item.qty, 0)
        },

        // 拉取服务端购物车并整体覆盖（登录后/进主页/每次增删后调用）
        async load() {
            const data = await listCart()
            this.items = (data || []).map(toLine)
        },

        // 菜品加购：口味数组按分组顺序拼成 dishFlavor 字符串（同一道菜每次选择顺序一致，后端才能并到同一行）
        async addItem(dish, flavors = []) {
            await addCart({ dishId: dish.id, setmealId: null, dishFlavor: [...(flavors || [])].join(',') })
            await this.load()
        },
        // 套餐加购：无口味维度，setmealId 即身份
        async addSetmeal(setmeal) {
            await addCart({ dishId: null, setmealId: setmeal.id, dishFlavor: '' })
            await this.load()
        },
        // 步进器加：对已有行身份再 add 一次，后端定位到同一行 number+1
        async increase(line) {
            await addCart({ dishId: line.dishId, setmealId: line.setmealId, dishFlavor: line.dishFlavor })
            await this.load()
        },
        // 步进器减：后端减到 0 自动删行
        async decrease(line) {
            await subCart({ dishId: line.dishId, setmealId: line.setmealId, dishFlavor: line.dishFlavor })
            await this.load()
        },
        // 清空（下单成功后/用户主动清空）
        async clean() {
            await cleanCart()
            this.items = []
        }
    }
})

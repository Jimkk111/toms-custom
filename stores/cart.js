import { defineStore } from 'pinia'

// 购物车：本地唯一数据源，storage 兜底防冷启动丢车；结算时整体提交，价格以后端重算为准
// 行的两级身份（字段冗余是故意的，职责不同）：
//   lineKey —— 行的身份：同菜品+同口味组合（口味排序归一化后）才算同一行，加购时据此并行
//   dishId / setmealId —— 归属聚合：菜品卡角标要跨口味行汇总数量，靠它查询
const CART_KEY = 'CART'

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: uni.getStorageSync(CART_KEY) || []
    }),

    getters: {
        // 购物车栏大角标：总份数
        totalCount: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),
        // 购物车栏合计金额（乘加后收口到分，避免展示 52.00000000001）
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

        // 菜品加购：无口味直接 addItem(dish)；口味弹窗确认后 addItem(dish, ['少冰','半糖'])
        addItem(dish, flavors = []) {
            const flv = [...(flavors || [])].sort()      // 拷贝+排序归一化，别复用入参数组
            this.upsert({
                lineKey: `dish_${dish.id}_${flv.join('/')}`,
                dishId: dish.id,
                setmealId: null,
                name: dish.name,
                image: dish.img || dish.image,
                price: dish.price,
                flavors: flv,
                qty: 1
            })
        },
        // 套餐加购：没有口味维度，setmealId 即身份
        addSetmeal(setmeal) {
            this.upsert({
                lineKey: `setmeal_${setmeal.id}`,
                dishId: null,
                setmealId: setmeal.id,
                name: setmeal.name,
                image: setmeal.img || setmeal.image,
                price: setmeal.price,
                flavors: [],
                qty: 1
            })
        },
        // 步进器加号：只对已有行 +1（新行一律由 addItem/addSetmeal 创建，职责分开）
        increase(lineKey) {
            const line = this.items.find((item) => item.lineKey === lineKey)
            if (!line) return
            line.qty++
            this.persist()
        },
        // 步进器减号：减到 0 直接删行，车里不留 qty=0 的行，角标和结算都省判空
        decrease(lineKey) {
            const idx = this.items.findIndex((item) => item.lineKey === lineKey)
            if (idx === -1) return
            if (--this.items[idx].qty <= 0) this.items.splice(idx, 1)
            this.persist()
        },
        // 下单成功后清空
        clear() {
            this.items = []
            this.persist()
        },

        /* ---- 以下内部实现，页面不要直接调 ---- */

        // 按 lineKey 并行：已有该行则 qty+1，否则插入新行
        upsert(line) {
            const existing = this.items.find((item) => item.lineKey === line.lineKey)
            if (existing) existing.qty++
            else this.items.push(line)
            this.persist()
        },
        // 持久化在 store 内收口，组件层不各自读写 storage，避免两套数据源打架
        persist() {
            uni.setStorageSync(CART_KEY, this.items)
        }
    }
})

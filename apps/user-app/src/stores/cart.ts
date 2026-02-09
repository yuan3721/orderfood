import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  menuId: number
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const existing = items.value.find((i) => i.menuId === item.menuId)
    if (existing) {
      if (existing.quantity < existing.stock) {
        existing.quantity++
      } else {
        uni.showToast({ title: '已达库存上限', icon: 'none' })
      }
    } else {
      items.value.push({ ...item, quantity: 1 })
    }
  }

  const removeItem = (menuId: number) => {
    const index = items.value.findIndex((i) => i.menuId === menuId)
    if (index > -1) {
      if (items.value[index].quantity > 1) {
        items.value[index].quantity--
      } else {
        items.value.splice(index, 1)
      }
    }
  }

  const getItemCount = (menuId: number): number => {
    const item = items.value.find((i) => i.menuId === menuId)
    return item?.quantity || 0
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    getItemCount,
    clearCart
  }
})

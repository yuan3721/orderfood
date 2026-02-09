/**
 * 订单状态
 */
export enum OrderStatus {
  PENDING = 0, // 待支付
  PAID = 1, // 已支付
  CANCELLED = 2 // 已取消
}

/**
 * 订单项
 */
export interface OrderItem {
  id: number
  orderId: number
  menuId: number
  menuName: string
  quantity: number
  price: number
  subtotal: number
}

/**
 * 订单
 */
export interface Order {
  id: number
  orderNo: string
  userId: number
  userName?: string
  totalPrice: number
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  paidAt?: string
  canceledAt?: string
  remark?: string
}

/**
 * 创建订单参数
 */
export interface CreateOrderInput {
  items: Array<{
    menuId: number
    quantity: number
  }>
  remark?: string
}

/**
 * 订单统计
 */
export interface OrderStats {
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  totalRevenue: string
  menuStats: Array<{
    menuId: number
    menuName: string
    totalQuantity: number
    totalAmount: string
  }>
}

/**
 * 购物车项
 */
export interface CartItem {
  menuId: number
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

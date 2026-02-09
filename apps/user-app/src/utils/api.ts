import { get, post } from './request'

// ============ 认证相关 ============
export const authApi = {
  login: (code: string) => post<{ token: string; user: any }>('/auth/login', { code }),
  refreshToken: () => post<{ token: string }>('/auth/refresh')
}

// ============ 菜单相关 ============
export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  stock: number
  sold: number
}

export interface TodayMenuResponse {
  cutoffTime: string
  isExpired: boolean
  items: MenuItem[]
}

export const menuApi = {
  getToday: () => get<TodayMenuResponse>('/menu/today'),
  getHistory: (page = 1, limit = 20) =>
    get<{ items: MenuItem[]; total: number }>('/menu/history', { page, limit })
}

// ============ 订单相关 ============
export interface OrderItem {
  menuId: number
  name: string
  price: number
  quantity: number
}

export interface CreateOrderInput {
  items: Array<{ menuId: number; quantity: number }>
  remark?: string
}

export interface Order {
  id: number
  orderNo: string
  status: number
  totalPrice: number
  remark: string
  items: OrderItem[]
  createdAt: string
  paidAt: string | null
  completedAt: string | null
}

export const orderApi = {
  create: (data: CreateOrderInput) => post<Order>('/order', data),
  list: (page = 1, limit = 20) =>
    get<{ items: Order[]; total: number }>('/order/list', { page, limit }),
  detail: (id: number) => get<Order>(`/order/${id}`),
  pay: (id: number) =>
    post<{
      appId: string
      timeStamp: string
      nonceStr: string
      package: string
      signType: string
      paySign: string
    }>(`/order/${id}/pay`)
}

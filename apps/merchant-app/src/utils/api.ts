import { get, post, put, del } from './request'

// ============ 认证相关 ============
export const authApi = {
  login: (phone: string, password: string) =>
    post<{ token: string; merchant: any }>('/auth/admin/login', { phone, password }),
  refreshToken: () => post<{ token: string }>('/auth/refresh')
}

// ============ 菜单管理 ============
export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  stock: number
  sold: number
  isActive: boolean
  createdAt: string
}

export interface CreateMenuInput {
  name: string
  description?: string
  price: number
  image?: string
  stock: number
}

export interface UpdateMenuInput extends Partial<CreateMenuInput> {
  isActive?: boolean
}

export const menuApi = {
  getToday: () => get<{ cutoffTime: string; items: MenuItem[] }>('/admin/menu/today'),
  getHistory: (page = 1, limit = 20) =>
    get<{ items: MenuItem[]; total: number }>('/admin/menu/history', { page, limit }),
  create: (data: CreateMenuInput) => post<MenuItem>('/admin/menu', data),
  update: (id: number, data: UpdateMenuInput) => put<MenuItem>(`/admin/menu/${id}`, data),
  delete: (id: number) => del(`/admin/menu/${id}`),
  setCutoffTime: (time: string) => post('/admin/menu/cutoff', { cutoffTime: time })
}

// ============ 订单管理 ============
export interface OrderItem {
  menuId: number
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: number
  orderNo: string
  status: number
  totalPrice: number
  remark: string
  items: OrderItem[]
  user: {
    id: number
    nickname: string
    phone: string
  }
  createdAt: string
  paidAt: string | null
}

export interface OrderStats {
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  menuStats: Array<{
    menuId: number
    name: string
    quantity: number
  }>
}

export const orderApi = {
  getToday: (status?: number) =>
    get<{ items: Order[]; total: number }>('/admin/order/today', status !== undefined ? { status } : {}),
  getStats: () => get<OrderStats>('/admin/order/stats'),
  detail: (id: number) => get<Order>(`/admin/order/${id}`),
  export: () => get<Blob>('/admin/order/export', undefined)
}

// ============ 上传 ============
export const uploadApi = {
  uploadImage: async (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/upload`,
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${uni.getStorageSync('merchant_token')}`
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data.url)
            } else {
              reject(new Error(data.message))
            }
          } catch (e) {
            reject(new Error('上传失败'))
          }
        },
        fail: reject
      })
    })
  }
}

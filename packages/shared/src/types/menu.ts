/**
 * 菜品
 */
export interface MenuItem {
  id: number
  date: string
  name: string
  price: number
  image: string
  stock: number
  sold: number
  cutoffTime: string
  createdAt: string
  updatedAt?: string
}

/**
 * 创建菜品参数
 */
export interface CreateMenuInput {
  name: string
  price: number
  image: string
  stock: number
  cutoffTime?: string
}

/**
 * 更新菜品参数
 */
export interface UpdateMenuInput {
  name?: string
  price?: number
  image?: string
  stock?: number
  cutoffTime?: string
}

/**
 * 今日菜单响应
 */
export interface TodayMenuResponse {
  list: MenuItem[]
  cutoffTime: string | null
}

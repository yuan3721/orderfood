/**
 * 用户信息
 */
export interface User {
  id: number
  openid: string
  nickname: string
  avatar: string
  phone?: string
  createdAt: string
  updatedAt?: string
}

/**
 * 商家信息
 */
export interface Merchant {
  id: number
  name: string
  account: string
  role: 'admin' | 'operator'
  createdAt: string
}

/**
 * 登录用户信息
 */
export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
}

/**
 * 商家信息
 */
export interface MerchantInfo {
  id: number
  name: string
  account: string
  role: string
}

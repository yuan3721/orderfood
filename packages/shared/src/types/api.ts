/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  user: {
    id: number
    nickname: string
    avatar: string
  }
}

/**
 * 商家登录响应
 */
export interface AdminLoginResponse {
  token: string
  merchant: {
    id: number
    name: string
    account: string
    role: string
  }
}

/**
 * 错误码
 */
export enum ErrorCode {
  SUCCESS = 0,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  INTERNAL_ERROR = 500,
  ORDER_EXPIRED = 1001,
  STOCK_INSUFFICIENT = 1002,
  ORDER_ALREADY_PAID = 1003
}

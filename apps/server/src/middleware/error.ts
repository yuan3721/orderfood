import { Context, Next } from 'koa'
import { ApiResponse, ErrorCode } from '@orderfood/shared'

/**
 * 自定义业务错误
 */
export class AppError extends Error {
  code: number
  statusCode: number

  constructor(message: string, code: number = ErrorCode.BAD_REQUEST, statusCode: number = 400) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next()
  } catch (err) {
    const error = err as Error

    if (error instanceof AppError) {
      ctx.status = error.statusCode
      ctx.body = {
        code: error.code,
        message: error.message,
        data: null
      } as ApiResponse
    } else {
      console.error('Unexpected error:', error)
      ctx.status = 500
      ctx.body = {
        code: ErrorCode.INTERNAL_ERROR,
        message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误',
        data: null
      } as ApiResponse
    }
  }
}

/**
 * 成功响应
 */
export const success = <T>(data: T, message: string = 'success'): ApiResponse<T> => {
  return {
    code: ErrorCode.SUCCESS,
    message,
    data
  }
}

/**
 * 失败响应
 */
export const fail = (message: string, code: number = ErrorCode.BAD_REQUEST): ApiResponse => {
  return {
    code,
    message,
    data: null
  }
}

import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { AppError } from './error'
import { ErrorCode } from '@orderfood/shared'

interface JwtPayload {
  id: number
  type: 'user' | 'merchant'
}

/**
 * 用户认证中间件
 */
export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.header.authorization?.replace('Bearer ', '')

  if (!token) {
    throw new AppError('请先登录', ErrorCode.UNAUTHORIZED, 401)
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload

    if (payload.type !== 'user') {
      throw new AppError('无权限访问', ErrorCode.FORBIDDEN, 403)
    }

    ctx.state.user = {
      id: payload.id,
      type: payload.type
    }

    await next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token 已过期', ErrorCode.UNAUTHORIZED, 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Token 无效', ErrorCode.UNAUTHORIZED, 401)
    }
    throw error
  }
}

/**
 * 商家认证中间件
 */
export const adminMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.header.authorization?.replace('Bearer ', '')

  if (!token) {
    throw new AppError('请先登录', ErrorCode.UNAUTHORIZED, 401)
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload

    if (payload.type !== 'merchant') {
      throw new AppError('无权限访问', ErrorCode.FORBIDDEN, 403)
    }

    ctx.state.merchant = {
      id: payload.id,
      type: payload.type
    }

    await next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token 已过期', ErrorCode.UNAUTHORIZED, 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Token 无效', ErrorCode.UNAUTHORIZED, 401)
    }
    throw error
  }
}

/**
 * 生成用户 Token
 */
export const generateUserToken = (userId: number): string => {
  return jwt.sign(
    { id: userId, type: 'user' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )
}

/**
 * 生成商家 Token
 */
export const generateMerchantToken = (merchantId: number): string => {
  return jwt.sign(
    { id: merchantId, type: 'merchant' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )
}

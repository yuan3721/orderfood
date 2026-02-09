import { Context } from 'koa'
import { prisma } from '../lib/prisma'
import { code2Session } from '../utils/wechat'
import { generateUserToken, generateMerchantToken } from '../middleware/auth'
import { success } from '../middleware/error'
import { AppError } from '../middleware/error'
import { ErrorCode } from '@orderfood/shared'
import crypto from 'crypto'

export const authController = {
  /**
   * 用户微信登录
   */
  async login(ctx: Context) {
    const { code, userInfo } = ctx.request.body as {
      code: string
      userInfo?: { nickName: string; avatarUrl: string }
    }

    if (!code) {
      throw new AppError('缺少 code 参数', ErrorCode.BAD_REQUEST)
    }

    // 通过 code 获取 openid
    const session = await code2Session(code)

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { openid: session.openid }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid: session.openid,
          nickname: userInfo?.nickName || '用户',
          avatar: userInfo?.avatarUrl || ''
        }
      })
    } else if (userInfo) {
      // 更新用户信息
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl
        }
      })
    }

    // 生成 token
    const token = generateUserToken(Number(user.id))

    ctx.body = success({
      token,
      user: {
        id: Number(user.id),
        nickname: user.nickname,
        avatar: user.avatar
      }
    })
  },

  /**
   * 商家登录
   */
  async adminLogin(ctx: Context) {
    const { account, password } = ctx.request.body as {
      account: string
      password: string
    }

    if (!account || !password) {
      throw new AppError('请输入账号和密码', ErrorCode.BAD_REQUEST)
    }

    // 查找商家
    const merchant = await prisma.merchant.findUnique({
      where: { account }
    })

    if (!merchant) {
      throw new AppError('账号或密码错误', ErrorCode.UNAUTHORIZED, 401)
    }

    // 验证密码 (简单 hash 对比)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    if (merchant.password !== hashedPassword) {
      throw new AppError('账号或密码错误', ErrorCode.UNAUTHORIZED, 401)
    }

    // 生成 token
    const token = generateMerchantToken(Number(merchant.id))

    ctx.body = success({
      token,
      merchant: {
        id: Number(merchant.id),
        name: merchant.name,
        account: merchant.account,
        role: merchant.role
      }
    })
  },

  /**
   * 刷新 Token
   */
  async refreshToken(ctx: Context) {
    // 从当前 token 中获取用户信息，重新生成
    const user = ctx.state.user
    const merchant = ctx.state.merchant

    if (user) {
      const token = generateUserToken(user.id)
      ctx.body = success({ token })
    } else if (merchant) {
      const token = generateMerchantToken(merchant.id)
      ctx.body = success({ token })
    } else {
      throw new AppError('无效的 Token', ErrorCode.UNAUTHORIZED, 401)
    }
  }
}

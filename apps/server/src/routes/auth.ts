import Router from '@koa/router'
import { authController } from '../controllers/auth'

const authRouter = new Router()

// 用户微信登录
authRouter.post('/login', authController.login)

// 商家登录
authRouter.post('/admin/login', authController.adminLogin)

// Token 刷新
authRouter.post('/refresh', authController.refreshToken)

export { authRouter }

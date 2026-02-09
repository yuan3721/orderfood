import Router from '@koa/router'
import { authRouter } from './auth'
import { menuRouter } from './menu'
import { orderRouter } from './order'
import { adminRouter } from './admin'
import { uploadRouter } from './upload'
import { paymentRouter } from './payment'

const router = new Router({
  prefix: '/api/v1'
})

// 健康检查
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() }
})

// 注册路由
router.use('/auth', authRouter.routes(), authRouter.allowedMethods())
router.use('/menu', menuRouter.routes(), menuRouter.allowedMethods())
router.use('/order', orderRouter.routes(), orderRouter.allowedMethods())
router.use('/admin', adminRouter.routes(), adminRouter.allowedMethods())
router.use('/upload', uploadRouter.routes(), uploadRouter.allowedMethods())
router.use('/payment', paymentRouter.routes(), paymentRouter.allowedMethods())

export { router }

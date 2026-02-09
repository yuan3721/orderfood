import Router from '@koa/router'
import { orderController } from '../controllers/order'
import { authMiddleware } from '../middleware/auth'

const orderRouter = new Router()

// 需要登录的路由
orderRouter.use(authMiddleware)

// 创建订单
orderRouter.post('/create', orderController.create)

// 用户订单列表
orderRouter.get('/list', orderController.list)

// 订单详情
orderRouter.get('/:id', orderController.detail)

// 发起支付
orderRouter.post('/:id/pay', orderController.pay)

export { orderRouter }

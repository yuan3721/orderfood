import Router from '@koa/router'
import { paymentController } from '../controllers/payment'

const paymentRouter = new Router()

// 微信支付回调
paymentRouter.post('/notify', paymentController.notify)

export { paymentRouter }

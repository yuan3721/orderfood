import Router from '@koa/router'
import { adminMenuController } from '../controllers/admin/menu'
import { adminOrderController } from '../controllers/admin/order'
import { adminMiddleware } from '../middleware/auth'

const adminRouter = new Router()

// 需要商家登录
adminRouter.use(adminMiddleware)

// 菜谱管理
adminRouter.post('/menu', adminMenuController.create)
adminRouter.put('/menu/:id', adminMenuController.update)
adminRouter.delete('/menu/:id', adminMenuController.delete)
adminRouter.get('/menu/today', adminMenuController.getToday)
adminRouter.get('/menu/history', adminMenuController.getHistory)
adminRouter.post('/menu/cutoff', adminMenuController.setCutoffTime)

// 订单管理
adminRouter.get('/order/today', adminOrderController.getToday)
adminRouter.get('/order/stats', adminOrderController.getStats)
adminRouter.get('/order/export', adminOrderController.export)
adminRouter.get('/order/:id', adminOrderController.detail)

export { adminRouter }

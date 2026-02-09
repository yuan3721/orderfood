import Router from '@koa/router'
import { menuController } from '../controllers/menu'

const menuRouter = new Router()

// 获取今日菜单
menuRouter.get('/today', menuController.getToday)

// 获取历史菜谱
menuRouter.get('/history', menuController.getHistory)

export { menuRouter }

import Router from '@koa/router'
import { uploadController } from '../controllers/upload'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const uploadRouter = new Router()

// 图片上传
uploadRouter.post('/image', adminMiddleware, uploadController.upload)

export { uploadRouter }

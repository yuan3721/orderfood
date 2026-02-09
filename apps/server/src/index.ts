import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import { router } from './routes'
import { errorHandler } from './middleware/error'
import { config } from './config'
import { startOrderTimeoutJob } from './jobs/orderTimeout'

const app = new Koa()

// 中间件
app.use(logger())
app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(bodyParser())
app.use(errorHandler)

// 路由
app.use(router.routes())
app.use(router.allowedMethods())

// 启动定时任务
startOrderTimeoutJob()

// 启动服务
const PORT = config.port || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app

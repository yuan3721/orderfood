import schedule from 'node-schedule'
import { prisma } from '../lib/prisma'
import { config } from '../config'

/**
 * 订单超时取消定时任务
 * 每分钟检查一次，取消超过 30 分钟未支付的订单
 */
export const startOrderTimeoutJob = () => {
  // 每分钟执行
  schedule.scheduleJob('* * * * *', async () => {
    try {
      const timeoutMinutes = config.order.timeout
      const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000)

      // 查找超时未支付的订单
      const timeoutOrders = await prisma.order.findMany({
        where: {
          status: 0,
          createdAt: { lt: timeoutDate }
        },
        include: { items: true }
      })

      if (timeoutOrders.length === 0) return

      console.log(`[OrderTimeoutJob] 发现 ${timeoutOrders.length} 个超时订单`)

      for (const order of timeoutOrders) {
        await prisma.$transaction(async (tx) => {
          // 取消订单
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 2,
              canceledAt: new Date()
            }
          })

          // 恢复库存
          for (const item of order.items) {
            await tx.menu.update({
              where: { id: item.menuId },
              data: {
                sold: { decrement: item.quantity }
              }
            })
          }
        })

        console.log(`[OrderTimeoutJob] 订单 ${order.orderNo} 已取消`)
      }
    } catch (error) {
      console.error('[OrderTimeoutJob] 执行失败:', error)
    }
  })

  console.log('[OrderTimeoutJob] 定时任务已启动')
}

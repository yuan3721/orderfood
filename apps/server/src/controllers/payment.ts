import { Context } from 'koa'
import { prisma } from '../lib/prisma'
import { success } from '../middleware/error'

export const paymentController = {
  /**
   * 微信支付回调
   */
  async notify(ctx: Context) {
    // 获取回调数据
    const xmlData = ctx.request.body as string

    // TODO: 解析 XML 数据
    // TODO: 验证签名
    // 这里提供模拟实现

    try {
      // 模拟从回调中获取订单号
      const orderNoMatch = xmlData.match(/<out_trade_no><!\[CDATA\[(.*?)\]\]><\/out_trade_no>/)
      const transactionIdMatch = xmlData.match(
        /<transaction_id><!\[CDATA\[(.*?)\]\]><\/transaction_id>/
      )

      if (!orderNoMatch) {
        ctx.body = '<xml><return_code><![CDATA[FAIL]]></return_code></xml>'
        return
      }

      const orderNo = orderNoMatch[1]
      const transactionId = transactionIdMatch?.[1] || ''

      // 查找订单
      const order = await prisma.order.findUnique({
        where: { orderNo }
      })

      if (!order) {
        ctx.body = '<xml><return_code><![CDATA[FAIL]]></return_code></xml>'
        return
      }

      // 幂等处理：已支付直接返回成功
      if (order.status === 1) {
        ctx.body = '<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>'
        return
      }

      // 更新订单状态
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: 1,
            paidAt: new Date()
          }
        }),
        prisma.payment.create({
          data: {
            orderId: order.id,
            transactionId,
            amount: order.totalPrice,
            status: 1,
            payTime: new Date()
          }
        })
      ])

      ctx.body = '<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>'
    } catch (error) {
      console.error('支付回调处理失败:', error)
      ctx.body = '<xml><return_code><![CDATA[FAIL]]></return_code></xml>'
    }
  }
}

/**
 * 模拟支付成功 (开发测试用)
 */
export const mockPaySuccess = async (orderNo: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNo }
  })

  if (!order || order.status !== 0) {
    return false
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: 1,
        paidAt: new Date()
      }
    }),
    prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: `mock_${Date.now()}`,
        amount: order.totalPrice,
        status: 1,
        payTime: new Date()
      }
    })
  ])

  return true
}

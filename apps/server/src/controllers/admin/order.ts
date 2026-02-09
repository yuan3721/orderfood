import { Context } from 'koa'
import { prisma } from '../../lib/prisma'
import { success, AppError } from '../../middleware/error'
import { ErrorCode } from '@orderfood/shared'
import * as XLSX from 'xlsx'

export const adminOrderController = {
  /**
   * 获取今日订单
   */
  async getToday(ctx: Context) {
    const { status } = ctx.query as { status?: string }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const where: Record<string, unknown> = {
      createdAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }

    if (status !== undefined && status !== '-1') {
      where.status = Number(status)
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: { nickname: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    ctx.body = success({
      list: orders.map((order) => ({
        id: Number(order.id),
        orderNo: order.orderNo,
        userName: order.user.nickname || '用户',
        totalPrice: Number(order.totalPrice),
        status: order.status,
        itemsCount: order.items.length,
        items: order.items.map((item) => ({
          id: Number(item.id),
          menuName: item.menuName,
          quantity: item.quantity,
          subtotal: Number(item.subtotal)
        })),
        createdAt: order.createdAt.toISOString()
      }))
    })
  },

  /**
   * 获取订单统计
   */
  async getStats(ctx: Context) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const where = {
      createdAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }

    // 订单统计
    const [totalOrders, paidOrders, pendingOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 1 } }),
      prisma.order.count({ where: { ...where, status: 0 } })
    ])

    // 收入统计
    const revenueResult = await prisma.order.aggregate({
      where: { ...where, status: 1 },
      _sum: { totalPrice: true }
    })

    // 菜品统计
    const menuStats = await prisma.orderItem.groupBy({
      by: ['menuId', 'menuName'],
      where: {
        order: where
      },
      _sum: {
        quantity: true,
        subtotal: true
      }
    })

    ctx.body = success({
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue: (Number(revenueResult._sum.totalPrice) || 0).toFixed(2),
      menuStats: menuStats.map((item) => ({
        menuId: Number(item.menuId),
        menuName: item.menuName,
        totalQuantity: item._sum.quantity || 0,
        totalAmount: (Number(item._sum.subtotal) || 0).toFixed(2)
      }))
    })
  },

  /**
   * 订单详情
   */
  async detail(ctx: Context) {
    const { id } = ctx.params

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        user: {
          select: { nickname: true, avatar: true }
        }
      }
    })

    if (!order) {
      throw new AppError('订单不存在', ErrorCode.NOT_FOUND, 404)
    }

    ctx.body = success({
      id: Number(order.id),
      orderNo: order.orderNo,
      user: {
        nickname: order.user.nickname,
        avatar: order.user.avatar
      },
      totalPrice: Number(order.totalPrice),
      status: order.status,
      remark: order.remark,
      items: order.items.map((item) => ({
        menuName: item.menuName,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal)
      })),
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString()
    })
  },

  /**
   * 导出订单
   */
  async export(ctx: Context) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        items: true,
        user: {
          select: { nickname: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // 构建 Excel 数据
    const data = orders.flatMap((order) =>
      order.items.map((item) => ({
        订单号: order.orderNo,
        用户: order.user.nickname || '用户',
        菜品: item.menuName,
        数量: item.quantity,
        单价: Number(item.price),
        小计: Number(item.subtotal),
        订单总价: Number(order.totalPrice),
        状态: order.status === 1 ? '已支付' : order.status === 2 ? '已取消' : '待支付',
        下单时间: order.createdAt.toLocaleString('zh-CN')
      }))
    )

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, '今日订单')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const dateStr = today.toISOString().split('T')[0]
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ctx.set('Content-Disposition', `attachment; filename=orders_${dateStr}.xlsx`)
    ctx.body = buffer
  }
}

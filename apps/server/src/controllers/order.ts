import { Context } from 'koa'
import { prisma } from '../lib/prisma'
import { success, AppError } from '../middleware/error'
import { ErrorCode, CreateOrderInput } from '@orderfood/shared'
import { generateOrderNo } from '../utils/wechat'

export const orderController = {
  /**
   * 创建订单
   */
  async create(ctx: Context) {
    const userId = ctx.state.user.id
    const { items, remark } = ctx.request.body as CreateOrderInput

    if (!items || items.length === 0) {
      throw new AppError('请选择菜品', ErrorCode.BAD_REQUEST)
    }

    // 获取菜品信息
    const menuIds = items.map((item) => BigInt(item.menuId))
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds } }
    })

    if (menus.length !== items.length) {
      throw new AppError('部分菜品不存在', ErrorCode.BAD_REQUEST)
    }

    // 检查截止时间
    const now = new Date()
    for (const menu of menus) {
      if (now > menu.cutoffTime) {
        throw new AppError('点餐已截止', ErrorCode.ORDER_EXPIRED)
      }
    }

    // 检查库存并计算总价
    let totalPrice = 0
    const orderItems: Array<{
      menuId: bigint
      menuName: string
      quantity: number
      price: number
      subtotal: number
    }> = []

    for (const item of items) {
      const menu = menus.find((m) => Number(m.id) === item.menuId)!
      const remaining = menu.stock - menu.sold

      if (item.quantity > remaining) {
        throw new AppError(`${menu.name} 库存不足`, ErrorCode.STOCK_INSUFFICIENT)
      }

      const subtotal = Number(menu.price) * item.quantity
      totalPrice += subtotal

      orderItems.push({
        menuId: menu.id,
        menuName: menu.name,
        quantity: item.quantity,
        price: Number(menu.price),
        subtotal
      })
    }

    // 使用事务创建订单并扣减库存
    const order = await prisma.$transaction(async (tx) => {
      // 乐观锁扣减库存
      for (const item of items) {
        const result = await tx.menu.updateMany({
          where: {
            id: BigInt(item.menuId),
            sold: { lte: prisma.menu.fields.stock }
          },
          data: {
            sold: { increment: item.quantity }
          }
        })

        if (result.count === 0) {
          throw new AppError('库存不足，请重试', ErrorCode.STOCK_INSUFFICIENT)
        }
      }

      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNo: generateOrderNo(),
          userId: BigInt(userId),
          totalPrice,
          status: 0,
          remark: remark || null,
          items: {
            create: orderItems.map((item) => ({
              menuId: item.menuId,
              menuName: item.menuName,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal
            }))
          }
        },
        include: { items: true }
      })

      return newOrder
    })

    ctx.body = success({
      id: Number(order.id),
      orderNo: order.orderNo,
      totalPrice: Number(order.totalPrice),
      status: order.status,
      items: order.items.map((item) => ({
        menuId: Number(item.menuId),
        menuName: item.menuName,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal)
      })),
      createdAt: order.createdAt.toISOString()
    })
  },

  /**
   * 获取用户订单列表
   */
  async list(ctx: Context) {
    const userId = ctx.state.user.id
    const { page = 1, limit = 10 } = ctx.query as { page?: number; limit?: number }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: BigInt(userId) },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.order.count({
        where: { userId: BigInt(userId) }
      })
    ])

    ctx.body = success({
      list: orders.map((order) => ({
        id: Number(order.id),
        orderNo: order.orderNo,
        totalPrice: Number(order.totalPrice),
        status: order.status,
        items: order.items.map((item) => ({
          menuName: item.menuName,
          quantity: item.quantity,
          subtotal: Number(item.subtotal)
        })),
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString()
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: Number(page) * Number(limit) < total
    })
  },

  /**
   * 获取订单详情
   */
  async detail(ctx: Context) {
    const userId = ctx.state.user.id
    const { id } = ctx.params

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true }
    })

    if (!order) {
      throw new AppError('订单不存在', ErrorCode.NOT_FOUND, 404)
    }

    if (Number(order.userId) !== userId) {
      throw new AppError('无权限访问', ErrorCode.FORBIDDEN, 403)
    }

    ctx.body = success({
      id: Number(order.id),
      orderNo: order.orderNo,
      totalPrice: Number(order.totalPrice),
      status: order.status,
      remark: order.remark,
      items: order.items.map((item) => ({
        id: Number(item.id),
        menuId: Number(item.menuId),
        menuName: item.menuName,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal)
      })),
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      canceledAt: order.canceledAt?.toISOString()
    })
  },

  /**
   * 发起支付
   */
  async pay(ctx: Context) {
    const userId = ctx.state.user.id
    const { id } = ctx.params

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) }
    })

    if (!order) {
      throw new AppError('订单不存在', ErrorCode.NOT_FOUND, 404)
    }

    if (Number(order.userId) !== userId) {
      throw new AppError('无权限访问', ErrorCode.FORBIDDEN, 403)
    }

    if (order.status === 1) {
      throw new AppError('订单已支付', ErrorCode.ORDER_ALREADY_PAID)
    }

    if (order.status === 2) {
      throw new AppError('订单已取消', ErrorCode.BAD_REQUEST)
    }

    // TODO: 调用微信支付统一下单接口
    // 这里返回模拟的支付参数
    ctx.body = success({
      orderId: Number(order.id),
      orderNo: order.orderNo,
      totalPrice: Number(order.totalPrice),
      // 微信支付参数 (实际需要调用微信支付接口获取)
      payParams: {
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: Math.random().toString(36).substring(2, 15),
        package: `prepay_id=mock_${order.orderNo}`,
        signType: 'MD5',
        paySign: 'mock_sign'
      }
    })
  }
}

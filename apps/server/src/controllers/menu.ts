import { Context } from 'koa'
import { prisma } from '../lib/prisma'
import { success } from '../middleware/error'

export const menuController = {
  /**
   * 获取今日菜单
   */
  async getToday(ctx: Context) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menus = await prisma.menu.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // 获取截止时间 (取第一个菜品的截止时间)
    const cutoffTime = menus.length > 0 ? menus[0].cutoffTime : null

    ctx.body = success({
      list: menus.map((menu) => ({
        id: Number(menu.id),
        date: menu.date.toISOString().split('T')[0],
        name: menu.name,
        price: Number(menu.price),
        image: menu.image,
        stock: menu.stock - menu.sold, // 剩余库存
        sold: menu.sold,
        cutoffTime: menu.cutoffTime.toISOString(),
        createdAt: menu.createdAt.toISOString()
      })),
      cutoffTime: cutoffTime?.toISOString() || null
    })
  },

  /**
   * 获取历史菜谱
   */
  async getHistory(ctx: Context) {
    const { page = 1, limit = 20 } = ctx.query as { page?: number; limit?: number }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where: {
          date: { lt: today }
        },
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.menu.count({
        where: {
          date: { lt: today }
        }
      })
    ])

    ctx.body = success({
      list: menus.map((menu) => ({
        id: Number(menu.id),
        date: menu.date.toISOString().split('T')[0],
        name: menu.name,
        price: Number(menu.price),
        image: menu.image,
        stock: menu.stock,
        sold: menu.sold,
        cutoffTime: menu.cutoffTime.toISOString()
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: Number(page) * Number(limit) < total
    })
  }
}

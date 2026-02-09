import { Context } from 'koa'
import { prisma } from '../../lib/prisma'
import { success, AppError } from '../../middleware/error'
import { ErrorCode } from '@orderfood/shared'

export const adminMenuController = {
  /**
   * 创建菜品
   */
  async create(ctx: Context) {
    const merchantId = ctx.state.merchant.id
    const { name, price, image, stock, cutoffTime } = ctx.request.body as {
      name: string
      price: number
      image?: string
      stock: number
      cutoffTime?: string
    }

    if (!name || price === undefined || stock === undefined) {
      throw new AppError('请填写完整信息', ErrorCode.BAD_REQUEST)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 默认截止时间为今天 11:00
    let cutoff = new Date(today)
    cutoff.setHours(11, 0, 0, 0)
    if (cutoffTime) {
      const [hours, minutes] = cutoffTime.split(':').map(Number)
      cutoff.setHours(hours, minutes, 0, 0)
    }

    const menu = await prisma.menu.create({
      data: {
        date: today,
        name,
        price,
        image: image || '',
        stock,
        sold: 0,
        cutoffTime: cutoff,
        merchantId: BigInt(merchantId)
      }
    })

    ctx.body = success({
      id: Number(menu.id),
      name: menu.name,
      price: Number(menu.price),
      image: menu.image,
      stock: menu.stock,
      cutoffTime: menu.cutoffTime.toISOString()
    })
  },

  /**
   * 更新菜品
   */
  async update(ctx: Context) {
    const { id } = ctx.params
    const { name, price, image, stock, cutoffTime } = ctx.request.body as {
      name?: string
      price?: number
      image?: string
      stock?: number
      cutoffTime?: string
    }

    const menu = await prisma.menu.findUnique({
      where: { id: BigInt(id) }
    })

    if (!menu) {
      throw new AppError('菜品不存在', ErrorCode.NOT_FOUND, 404)
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = price
    if (image !== undefined) updateData.image = image
    if (stock !== undefined) updateData.stock = stock
    if (cutoffTime) {
      const [hours, minutes] = cutoffTime.split(':').map(Number)
      const cutoff = new Date(menu.date)
      cutoff.setHours(hours, minutes, 0, 0)
      updateData.cutoffTime = cutoff
    }

    const updated = await prisma.menu.update({
      where: { id: BigInt(id) },
      data: updateData
    })

    ctx.body = success({
      id: Number(updated.id),
      name: updated.name,
      price: Number(updated.price),
      image: updated.image,
      stock: updated.stock,
      cutoffTime: updated.cutoffTime.toISOString()
    })
  },

  /**
   * 删除菜品
   */
  async delete(ctx: Context) {
    const { id } = ctx.params

    const menu = await prisma.menu.findUnique({
      where: { id: BigInt(id) }
    })

    if (!menu) {
      throw new AppError('菜品不存在', ErrorCode.NOT_FOUND, 404)
    }

    await prisma.menu.delete({
      where: { id: BigInt(id) }
    })

    ctx.body = success(null, '删除成功')
  },

  /**
   * 获取今日菜单（商家端）
   */
  async getToday(ctx: Context) {
    const merchantId = ctx.state.merchant.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menus = await prisma.menu.findMany({
      where: {
        merchantId: BigInt(merchantId),
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const cutoffTime = menus.length > 0 ? menus[0].cutoffTime : null

    ctx.body = success({
      list: menus.map((menu) => ({
        id: Number(menu.id),
        name: menu.name,
        price: Number(menu.price),
        image: menu.image,
        stock: menu.stock,
        sold: menu.sold,
        cutoffTime: menu.cutoffTime.toISOString()
      })),
      cutoffTime: cutoffTime?.toISOString() || null
    })
  },

  /**
   * 获取历史菜谱
   */
  async getHistory(ctx: Context) {
    const merchantId = ctx.state.merchant.id
    const { page = 1, limit = 20 } = ctx.query as { page?: number; limit?: number }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where: {
          merchantId: BigInt(merchantId),
          date: { lt: today }
        },
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.menu.count({
        where: {
          merchantId: BigInt(merchantId),
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
        sold: menu.sold
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: Number(page) * Number(limit) < total
    })
  },

  /**
   * 设置截止时间
   */
  async setCutoffTime(ctx: Context) {
    const merchantId = ctx.state.merchant.id
    const { cutoffTime } = ctx.request.body as { cutoffTime: string }

    if (!cutoffTime) {
      throw new AppError('请选择截止时间', ErrorCode.BAD_REQUEST)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [hours, minutes] = cutoffTime.split(':').map(Number)
    const cutoff = new Date(today)
    cutoff.setHours(hours, minutes, 0, 0)

    // 更新今日所有菜品的截止时间
    await prisma.menu.updateMany({
      where: {
        merchantId: BigInt(merchantId),
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      data: {
        cutoffTime: cutoff
      }
    })

    ctx.body = success(null, '设置成功')
  }
}

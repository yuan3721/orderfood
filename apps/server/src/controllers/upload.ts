import { Context } from 'koa'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { uploadFile, getTempCredentials } from '../utils/cos'
import { success, AppError } from '../middleware/error'

// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
// 最大文件大小 5MB
const MAX_SIZE = 5 * 1024 * 1024

export const uploadController = {
  /**
   * 上传图片
   */
  async upload(ctx: Context) {
    const file = ctx.request.files?.file

    if (!file || Array.isArray(file)) {
      throw new AppError(400, '请上传文件')
    }

    console.log('uploaded file:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size
    })
    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.mimetype || '')) {
      throw new AppError(400, '不支持的文件类型，仅支持 jpg/png/gif/webp')
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      throw new AppError(400, '文件大小不能超过 5MB')
    }

    // 生成文件名
    const ext = path.extname(file.originalFilename || '.jpg')
    const filename = `${uuidv4()}${ext}`
    const key = `menu/${filename}`

    // 读取文件内容
    const fs = await import('fs')
    const buffer = fs.readFileSync(file.filepath)
    console.log('buffer size:', buffer.length)
    // 上传到 COS
    const url = await uploadFile(buffer, key)

    // 删除临时文件
    fs.unlinkSync(file.filepath)

    success(ctx, { url })
  },

  /**
   * 获取上传凭证 (供前端直传使用)
   */
  async getCredentials(ctx: Context) {
    const credentials = await getTempCredentials()
    success(ctx, credentials)
  }
}

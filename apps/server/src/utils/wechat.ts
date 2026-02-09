import { config } from '../config'

interface WechatSessionResponse {
  openid: string
  session_key: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

/**
 * 通过微信 code 获取 openid
 */
export const code2Session = async (code: string): Promise<WechatSessionResponse> => {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechat.appId}&secret=${config.wechat.appSecret}&js_code=${code}&grant_type=authorization_code`

  const response = await fetch(url)
  const data = (await response.json()) as WechatSessionResponse

  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg}`)
  }

  return data
}

/**
 * 生成订单号
 */
export const generateOrderNo = (): string => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()

  return `${year}${month}${day}${hour}${minute}${second}${random}`
}

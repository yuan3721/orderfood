export const config = {
  // 服务端口
  port: process.env.PORT || 3000,
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: '7d'
  },
  
  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || ''
  },
  
  // 微信支付配置
  wechatPay: {
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    certPath: process.env.WECHAT_CERT_PATH || '',
    keyPath: process.env.WECHAT_KEY_PATH || '',
    notifyUrl: process.env.WECHAT_NOTIFY_URL || ''
  },
  
  // 腾讯云 COS 配置
  cos: {
    secretId: process.env.COS_SECRET_ID || '',
    secretKey: process.env.COS_SECRET_KEY || '',
    bucket: process.env.COS_BUCKET || '',
    region: process.env.COS_REGION || 'ap-guangzhou'
  },
  
  // 订单配置
  order: {
    // 订单超时时间（分钟）
    timeout: 30
  }
}

import COS from 'cos-nodejs-sdk-v5'
import { config } from '../config'

export const cos = new COS({
  SecretId: config.cos.secretId,
  SecretKey: config.cos.secretKey
})

export const uploadFile = async (
  buffer: Buffer,
  key: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: config.cos.bucket,
        Region: config.cos.region,
        Key: key,
        Body: buffer
      },
      (err, data) => {
        console.log('cos putObject data:', data)
        if (err) {
          console.log('cos putObject err:', err)
          reject(err)
        } else {
          const url = `https://${config.cos.bucket}.cos.${config.cos.region}.myqcloud.com/${key}`
          resolve(url)
        }
      }
    )
  })
}

export const deleteFile = async (key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: config.cos.bucket,
        Region: config.cos.region,
        Key: key
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

/**
 * 获取临时上传凭证 (供前端直传使用)
 */
export const getTempCredentials = async (): Promise<{
  credentials: {
    tmpSecretId: string
    tmpSecretKey: string
    sessionToken: string
  }
  startTime: number
  expiredTime: number
}> => {
  // 使用 STS 服务获取临时凭证
  // 这里简化处理，生产环境应使用 STS
  return {
    credentials: {
      tmpSecretId: config.cos.secretId,
      tmpSecretKey: config.cos.secretKey,
      sessionToken: ''
    },
    startTime: Math.floor(Date.now() / 1000),
    expiredTime: Math.floor(Date.now() / 1000) + 7200
  }
}

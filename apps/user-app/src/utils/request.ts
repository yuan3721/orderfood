import { useUserStore } from '@/stores/user'

// API 基础地址
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  const userStore = useUserStore()

  return new Promise((resolve, reject) => {
    if (options.showLoading !== false) {
      uni.showLoading({ title: '加载中...', mask: true })
    }

    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 自动携带 Token
    if (userStore.token) {
      header['Authorization'] = `Bearer ${userStore.token}`
    }

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        uni.hideLoading()
        const response = res.data as ApiResponse<T>

        if (response.code === 0) {
          resolve(response.data)
        } else if (response.code === 401) {
          // Token 过期，跳转登录
          userStore.logout()
          uni.showToast({ title: '请重新登录', icon: 'none' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/mine/index' })
          }, 1500)
          reject(new Error('Unauthorized'))
        } else {
          if (options.showError !== false) {
            uni.showToast({ title: response.message || '请求失败', icon: 'none' })
          }
          reject(new Error(response.message))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        if (options.showError !== false) {
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

// 便捷方法
export const get = <T = any>(url: string, data?: Record<string, any>) => {
  return request<T>({ url, method: 'GET', data })
}

export const post = <T = any>(url: string, data?: Record<string, any>) => {
  return request<T>({ url, method: 'POST', data })
}

export const put = <T = any>(url: string, data?: Record<string, any>) => {
  return request<T>({ url, method: 'PUT', data })
}

export const del = <T = any>(url: string, data?: Record<string, any>) => {
  return request<T>({ url, method: 'DELETE', data })
}

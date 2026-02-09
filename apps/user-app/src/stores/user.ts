import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  openId: string
  nickname: string
  avatar: string
  phone: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    uni.setStorageSync('userInfo', JSON.stringify(info))
  }

  const loadUserInfo = () => {
    const cached = uni.getStorageSync('userInfo')
    if (cached) {
      try {
        userInfo.value = JSON.parse(cached)
      } catch (e) {
        console.error('Failed to parse userInfo')
      }
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    loadUserInfo,
    logout
  }
})

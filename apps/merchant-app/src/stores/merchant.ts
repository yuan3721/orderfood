import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MerchantInfo {
  id: number
  name: string
  phone: string
  address: string
}

export const useMerchantStore = defineStore('merchant', () => {
  const token = ref<string>(uni.getStorageSync('merchant_token') || '')
  const merchantInfo = ref<MerchantInfo | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    uni.setStorageSync('merchant_token', newToken)
  }

  const setMerchantInfo = (info: MerchantInfo) => {
    merchantInfo.value = info
    uni.setStorageSync('merchantInfo', JSON.stringify(info))
  }

  const loadMerchantInfo = () => {
    const cached = uni.getStorageSync('merchantInfo')
    if (cached) {
      try {
        merchantInfo.value = JSON.parse(cached)
      } catch (e) {
        console.error('Failed to parse merchantInfo')
      }
    }
  }

  const logout = () => {
    token.value = ''
    merchantInfo.value = null
    uni.removeStorageSync('merchant_token')
    uni.removeStorageSync('merchantInfo')
  }

  return {
    token,
    merchantInfo,
    isLoggedIn,
    setToken,
    setMerchantInfo,
    loadMerchantInfo,
    logout
  }
})

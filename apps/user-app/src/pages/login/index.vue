<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">欢迎使用订餐系统</text>
      <text class="subtitle">一键登录，即可订餐</text>
    </view>

    <view class="login-actions">
      <button 
        class="login-btn" 
        open-type="getUserInfo"
        @getuserinfo="handleLogin"
        :loading="loading"
      >
        微信一键登录
      </button>
      <text class="agreement">
        登录即表示同意《用户服务协议》和《隐私政策》
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/utils/api'

const userStore = useUserStore()
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return

  try {
    loading.value = true

    // 获取微信登录 code
    const loginRes = await uni.login({ provider: 'weixin' })
    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    // 调用后端登录接口
    const data = await authApi.login(loginRes.code)

    // 保存登录信息
    userStore.setToken(data.token)
    userStore.setUserInfo(data.user)

    uni.showToast({ title: '登录成功', icon: 'success' })

    // 返回上一页或跳转首页
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }, 1500)
  } catch (error: any) {
    console.error('登录失败:', error)
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: linear-gradient(180deg, #e8f5e9 0%, #ffffff 100%);
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 100rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 40rpx;
  }

  .title {
    font-size: 44rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: #999;
  }
}

.login-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .login-btn {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    background-color: #07c160;
    color: #fff;
    font-size: 32rpx;
    border-radius: 48rpx;
    border: none;
    margin-bottom: 24rpx;

    &::after {
      border: none;
    }
  }

  .agreement {
    font-size: 24rpx;
    color: #999;
    text-align: center;
  }
}
</style>

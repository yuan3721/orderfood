<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">商家管理后台</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="form.phone"
          type="number"
          class="input"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>
      <view class="form-item">
        <text class="label">密码</text>
        <input
          v-model="form.password"
          :password="true"
          class="input"
          placeholder="请输入密码"
        />
      </view>
      <button 
        class="login-btn" 
        :disabled="!canSubmit || loading" 
        :loading="loading"
        @tap="handleLogin"
      >
        登录
      </button>
    </view>

    <view class="login-footer">
      <text class="tip">如需开通商家账号，请联系管理员</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMerchantStore } from '@/stores/merchant'
import { authApi } from '@/utils/api'

const merchantStore = useMerchantStore()
const loading = ref(false)

const form = ref({
  phone: '',
  password: ''
})

const canSubmit = computed(() => {
  return form.value.phone.length === 11 && form.value.password.length >= 6
})

const handleLogin = async () => {
  if (!canSubmit.value || loading.value) return

  try {
    loading.value = true
    const data = await authApi.login(form.value.phone, form.value.password)
    
    merchantStore.setToken(data.token)
    merchantStore.setMerchantInfo(data.merchant)

    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error: any) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 80rpx 48rpx;
  background: #f5f5f5;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
  }

  .title {
    display: block;
    font-size: 44rpx;
    font-weight: bold;
    color: #333;
  }
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.form-item {
  margin-bottom: 32rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .input {
    width: 100%;
    height: 88rpx;
    background: #f8f8f8;
    border-radius: 16rpx;
    padding: 0 24rpx;
    font-size: 30rpx;
    box-sizing: border-box;
  }
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: #1890ff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  border: none;
  margin-top: 20rpx;

  &[disabled] {
    background: #ccc;
  }

  &::after {
    border: none;
  }
}

.login-footer {
  margin-top: 48rpx;
  text-align: center;

  .tip {
    font-size: 24rpx;
    color: #999;
  }
}
</style>

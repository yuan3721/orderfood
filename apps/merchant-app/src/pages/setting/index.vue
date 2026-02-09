<template>
  <view class="setting-page">
    <!-- 商家信息 -->
    <view class="merchant-card">
      <text class="merchant-name">{{ merchantInfo.name }}</text>
      <text class="merchant-account">账号: {{ merchantInfo.account }}</text>
    </view>
    
    <!-- 设置列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="goToHistory">
        <text class="menu-icon">📅</text>
        <text class="menu-text">历史菜谱</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToNotify">
        <text class="menu-icon">🔔</text>
        <text class="menu-text">推送通知</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-btn" @tap="handleLogout">
      退出登录
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMerchantStore } from '@/stores/merchant'

const merchantStore = useMerchantStore()
const merchantInfo = computed(() => merchantStore.merchantInfo || { name: '未登录', phone: '' })

onMounted(() => {
  merchantStore.loadMerchantInfo()
})

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        merchantStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}

const goToHistory = () => {
  uni.switchTab({ url: '/pages/menu/index' })
}

const goToNotify = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const goToAbout = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.setting-page {
  min-height: 100vh;
}

.merchant-card {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  padding: 48rpx 40rpx;
  color: #fff;
}

.merchant-name {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.merchant-account {
  font-size: 26rpx;
  opacity: 0.8;
  margin-top: 12rpx;
  display: block;
}

.menu-list {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout-btn {
  margin: 48rpx 24rpx;
  background: #fff;
  color: #ee0a24;
  text-align: center;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
}
</style>

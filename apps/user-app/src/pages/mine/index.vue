<template>
  <view class="mine-page">
    <!-- 用户信息 -->
    <view class="user-card">
      <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" />
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
        <text v-if="!isLoggedIn" class="login-tip" @tap="handleLogin">点击登录</text>
      </view>
    </view>
    
    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="goToOrders">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view v-if="isLoggedIn" class="logout-btn" @tap="handleLogout">
      退出登录
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo || { nickname: '未登录', avatar: '' })

onMounted(() => {
  userStore.loadUserInfo()
})

const handleLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    }
  })
}

const goToOrders = () => {
  uni.switchTab({ url: '/pages/order/index' })
}

const goToSettings = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const goToAbout = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
}

.user-card {
  background: linear-gradient(135deg, #07c160, #00d26a);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.user-info {
  margin-left: 32rpx;
  color: #fff;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.login-tip {
  font-size: 26rpx;
  opacity: 0.8;
  margin-top: 8rpx;
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

<template>
  <view class="index-page">
    <!-- 今日统计卡片 -->
    <view class="stats-card">
      <view class="stats-title">今日数据</view>
      <view class="stats-grid">
        <view class="stats-item">
          <text class="stats-value">{{ stats.totalOrders }}</text>
          <text class="stats-label">总订单</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ stats.paidOrders }}</text>
          <text class="stats-label">已支付</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">¥{{ stats.totalRevenue }}</text>
          <text class="stats-label">总收入</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ stats.pendingOrders }}</text>
          <text class="stats-label">待支付</text>
        </view>
      </view>
    </view>
    
    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-item" @tap="goToMenuEdit">
        <text class="action-icon">📝</text>
        <text class="action-text">上传菜品</text>
      </view>
      <view class="action-item" @tap="goToStats">
        <text class="action-icon">📊</text>
        <text class="action-text">菜品汇总</text>
      </view>
      <view class="action-item" @tap="goToHistory">
        <text class="action-icon">📅</text>
        <text class="action-text">历史菜谱</text>
      </view>
      <view class="action-item" @tap="exportOrders">
        <text class="action-icon">📤</text>
        <text class="action-text">导出订单</text>
      </view>
    </view>
    
    <!-- 待处理订单 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">待处理订单</text>
        <text class="section-more" @tap="goToOrders">查看全部</text>
      </view>
      <view v-if="pendingOrders.length > 0" class="order-list">
        <view 
          v-for="order in pendingOrders" 
          :key="order.id" 
          class="order-item"
          @tap="goToOrderDetail(order.id)"
        >
          <view class="order-info">
            <text class="order-user">{{ order.userName }}</text>
            <text class="order-items">{{ order.itemsCount }}件商品</text>
          </view>
          <view class="order-meta">
            <text class="order-price">¥{{ order.totalPrice }}</text>
            <text class="order-time">{{ formatTime(order.createdAt) }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>暂无待处理订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { orderApi, type OrderStats } from '@/utils/api'

interface PendingOrder {
  id: number
  userName: string
  itemsCount: number
  totalPrice: number
  createdAt: string
}

const stats = ref<OrderStats>({
  totalOrders: 0,
  paidOrders: 0,
  totalRevenue: 0,
  menuStats: []
})

const pendingOrders = ref<PendingOrder[]>([])

const fetchData = async () => {
  try {
    const [statsRes, ordersRes] = await Promise.all([
      orderApi.getStats(),
      orderApi.getToday(0)
    ])
    stats.value = statsRes
    pendingOrders.value = ordersRes.items.slice(0, 5).map((order) => ({
      id: order.id,
      userName: order.user?.nickname || '未知用户',
      itemsCount: order.items.length,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt
    }))
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const goToMenuEdit = () => {
  uni.navigateTo({ url: '/pages/menu/edit' })
}

const goToStats = () => {
  uni.navigateTo({ url: '/pages/order/stats' })
}

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/menu/index' })
}

const goToOrders = () => {
  uni.switchTab({ url: '/pages/order/index' })
}

const goToOrderDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

const exportOrders = async () => {
  uni.showToast({ title: '导出功能请在后台操作', icon: 'none' })
}

onMounted(() => {
  fetchData()
})

onShow(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  padding: 24rpx;
}

.stats-card {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 16rpx;
  padding: 32rpx;
  color: #fff;
  margin-bottom: 24rpx;
}

.stats-title {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 24rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.stats-item {
  text-align: center;
}

.stats-value {
  font-size: 40rpx;
  font-weight: 600;
  display: block;
}

.stats-label {
  font-size: 24rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  display: block;
}

.quick-actions {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
}

.section-more {
  font-size: 26rpx;
  color: #1890ff;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.order-user {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.order-items {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.order-meta {
  text-align: right;
}

.order-price {
  font-size: 30rpx;
  color: #ee0a24;
  font-weight: 500;
  display: block;
}

.order-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
}
</style>

<template>
  <view class="order-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        v-for="item in statusFilters" 
        :key="item.value"
        :class="['filter-item', { active: currentStatus === item.value }]"
        @tap="onFilterChange(item.value)"
      >
        {{ item.label }}
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view 
        v-for="order in orderList" 
        :key="order.id" 
        class="order-card"
        @tap="goToDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-user">{{ order.userName }}</text>
          <text :class="['order-status', `status-${order.status}`]">
            {{ statusText[order.status] }}
          </text>
        </view>
        <view class="order-items">
          <view v-for="item in order.items" :key="item.id" class="item-row">
            <text class="item-name">{{ item.menuName }}</text>
            <text class="item-qty">x{{ item.quantity }}</text>
            <text class="item-price">¥{{ item.subtotal }}</text>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-time">{{ formatTime(order.createdAt) }}</text>
          <text class="order-total">合计: ¥{{ order.totalPrice }}</text>
        </view>
      </view>
      
      <view v-if="orderList.length === 0" class="empty-state">
        <text>暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { orderApi, type Order } from '@/utils/api'

const statusFilters = [
  { label: '全部', value: -1 },
  { label: '待支付', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已取消', value: 2 }
]

const statusText: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '已取消'
}

const currentStatus = ref(-1)
const orderList = ref<Order[]>([])

const fetchOrders = async () => {
  try {
    const res = await orderApi.getToday(currentStatus.value === -1 ? undefined : currentStatus.value)
    orderList.value = res.items
  } catch (error) {
    console.error('获取订单失败', error)
  }
}

const onFilterChange = (status: number) => {
  currentStatus.value = status
  fetchOrders()
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

onMounted(() => {
  fetchOrders()
})

onShow(() => {
  fetchOrders()
})
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 24rpx;
  gap: 24rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-item {
  font-size: 28rpx;
  color: #666;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  
  &.active {
    background: #1890ff;
    color: #fff;
  }
}

.order-list {
  padding: 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-user {
  font-size: 30rpx;
  font-weight: 500;
}

.order-status {
  font-size: 26rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  
  &.status-0 {
    background: #fff7e6;
    color: #fa8c16;
  }
  
  &.status-1 {
    background: #f6ffed;
    color: #52c41a;
  }
  
  &.status-2 {
    background: #f5f5f5;
    color: #999;
  }
}

.order-items {
  border-top: 1rpx solid #f5f5f5;
  border-bottom: 1rpx solid #f5f5f5;
  padding: 16rpx 0;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.item-name {
  flex: 1;
  font-size: 28rpx;
}

.item-qty {
  font-size: 26rpx;
  color: #999;
  margin-right: 20rpx;
}

.item-price {
  font-size: 28rpx;
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  font-size: 30rpx;
  color: #ee0a24;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>

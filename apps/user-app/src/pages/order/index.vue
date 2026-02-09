<template>
  <view class="order-page">
    <view v-if="orderList.length > 0" class="order-list">
      <view 
        v-for="order in orderList" 
        :key="order.id" 
        class="order-card"
        @tap="goToDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text :class="['order-status', `status-${order.status}`]">
            {{ statusText[order.status] }}
          </text>
        </view>
        <view class="order-items">
          <text v-for="(item, idx) in order.items.slice(0, 2)" :key="idx">
            {{ item.menuName }} x{{ item.quantity }}
          </text>
          <text v-if="order.items.length > 2">等{{ order.items.length }}件商品</text>
        </view>
        <view class="order-footer">
          <text class="order-time">{{ formatTime(order.createdAt) }}</text>
          <text class="order-total">¥{{ order.totalPrice }}</text>
        </view>
        <view v-if="order.status === 0" class="order-action">
          <button class="pay-btn" @tap.stop="continuePay(order)">继续支付</button>
        </view>
      </view>
    </view>
    
    <view v-else class="empty-state">
      <text>暂无订单记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { orderApi, type Order } from '@/utils/api'

const orderList = ref<Order[]>([])

const statusText: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '已取消'
}

const fetchOrders = async () => {
  try {
    const res = await orderApi.list()
    orderList.value = res.items
  } catch (error) {
    console.error('获取订单失败', error)
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

const continuePay = async (order: Order) => {
  try {
    const payParams = await orderApi.pay(order.id)
    await uni.requestPayment({
      provider: 'wxpay',
      ...payParams
    })
    uni.showToast({ title: '支付成功', icon: 'success' })
    fetchOrders()
  } catch (error) {
    console.error('支付失败', error)
  }
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
  padding: 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-no {
  font-size: 26rpx;
  color: #666;
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
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  
  text {
    display: block;
    margin-bottom: 8rpx;
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  font-size: 32rpx;
  color: #ee0a24;
  font-weight: 600;
}

.order-action {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
}

.pay-btn {
  background: #07c160;
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  border: none;
}

.empty-state {
  text-align: center;
  padding: 200rpx 0;
  color: #999;
}
</style>

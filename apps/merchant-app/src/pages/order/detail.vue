<template>
  <view class="detail-page">
    <view v-if="order" class="order-content">
      <!-- 状态栏 -->
      <view :class="['status-bar', `status-${order.status}`]">
        <text class="status-text">{{ statusText[order.status] }}</text>
      </view>

      <!-- 用户信息 -->
      <view class="info-section">
        <view class="section-title">用户信息</view>
        <view class="info-item">
          <text class="label">昵称</text>
          <text class="value">{{ order.user?.nickname || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">手机号</text>
          <text class="value">{{ order.user?.phone || '-' }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-section">
        <view class="section-title">订单信息</view>
        <view class="info-item">
          <text class="label">订单编号</text>
          <text class="value">{{ order.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="label">下单时间</text>
          <text class="value">{{ formatTime(order.createdAt) }}</text>
        </view>
        <view v-if="order.paidAt" class="info-item">
          <text class="label">支付时间</text>
          <text class="value">{{ formatTime(order.paidAt) }}</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="info-section">
        <view class="section-title">商品明细</view>
        <view v-for="item in order.items" :key="item.menuId" class="item-row">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-qty">x{{ item.quantity }}</text>
          <text class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</text>
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="order.remark" class="info-section">
        <view class="section-title">备注</view>
        <text class="remark-text">{{ order.remark }}</text>
      </view>

      <!-- 合计 -->
      <view class="total-section">
        <text class="total-label">订单金额</text>
        <text class="total-price">¥{{ order.totalPrice.toFixed(2) }}</text>
      </view>
    </view>

    <view v-else class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderApi, type Order } from '@/utils/api'

const order = ref<Order | null>(null)

const statusText: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '已取消'
}

onLoad(async (options) => {
  if (options?.id) {
    try {
      order.value = await orderApi.detail(parseInt(options.id))
    } catch (error) {
      console.error('获取订单详情失败', error)
      uni.showToast({ title: '获取订单失败', icon: 'none' })
    }
  }
})

const formatTime = (time: string) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.status-bar {
  padding: 40rpx;
  color: #fff;
  text-align: center;

  &.status-0 {
    background: linear-gradient(135deg, #ff9800, #ffc107);
  }

  &.status-1 {
    background: linear-gradient(135deg, #07c160, #00d26a);
  }

  &.status-2 {
    background: linear-gradient(135deg, #999, #bbb);
  }

  .status-text {
    font-size: 36rpx;
    font-weight: 600;
  }
}

.info-section {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #999;
    font-size: 28rpx;
  }

  .value {
    color: #333;
    font-size: 28rpx;
  }
}

.item-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .item-name {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .item-qty {
    width: 80rpx;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }

  .item-price {
    width: 120rpx;
    text-align: right;
    font-size: 28rpx;
    color: #333;
  }
}

.remark-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.total-section {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .total-label {
    font-size: 30rpx;
    color: #333;
  }

  .total-price {
    font-size: 40rpx;
    font-weight: 600;
    color: #ee0a24;
  }
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>

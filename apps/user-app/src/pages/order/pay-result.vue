<template>
  <view class="result-page">
    <view class="result-icon">
      <image 
        v-if="status === 'success'" 
        src="/static/icons/success.png" 
        mode="aspectFit"
      />
      <image 
        v-else 
        src="/static/icons/pending.png" 
        mode="aspectFit"
      />
    </view>

    <text class="result-title">
      {{ status === 'success' ? '支付成功' : '待支付' }}
    </text>
    <text class="result-desc">
      {{ status === 'success' ? '订单已提交，请等待取餐' : '订单已创建，请尽快完成支付' }}
    </text>

    <view class="result-actions">
      <button class="action-btn primary" @tap="viewOrder">查看订单</button>
      <button class="action-btn" @tap="goHome">返回首页</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const status = ref<'success' | 'pending'>('pending')
const orderId = ref<number>(0)

onLoad((options) => {
  if (options?.status) {
    status.value = options.status as 'success' | 'pending'
  }
  if (options?.orderId) {
    orderId.value = parseInt(options.orderId)
  }
})

const viewOrder = () => {
  if (orderId.value) {
    uni.redirectTo({
      url: `/pages/order/detail?id=${orderId.value}`
    })
  } else {
    uni.switchTab({ url: '/pages/order/index' })
  }
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.result-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: #fff;
}

.result-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.result-title {
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.result-desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.result-actions {
  width: 100%;

  .action-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    margin-bottom: 24rpx;
    background: #f5f5f5;
    color: #333;
    border: none;

    &::after {
      border: none;
    }

    &.primary {
      background: #07c160;
      color: #fff;
    }
  }
}
</style>

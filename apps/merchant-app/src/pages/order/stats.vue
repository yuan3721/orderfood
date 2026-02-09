<template>
  <view class="stats-page">
    <!-- 汇总卡片 -->
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-value">{{ stats.totalOrders }}</text>
        <text class="summary-label">总订单</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">{{ stats.paidOrders }}</text>
        <text class="summary-label">已支付</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">¥{{ stats.totalRevenue.toFixed(2) }}</text>
        <text class="summary-label">总收入</text>
      </view>
    </view>

    <!-- 菜品统计列表 -->
    <view class="stats-section">
      <view class="section-title">菜品销量统计</view>
      <view v-if="stats.menuStats.length > 0" class="stats-list">
        <view v-for="(item, index) in stats.menuStats" :key="item.menuId" class="stats-item">
          <view class="rank">{{ index + 1 }}</view>
          <view class="info">
            <text class="name">{{ item.name }}</text>
          </view>
          <view class="quantity">{{ item.quantity }} 份</view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>暂无销售数据</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi, type OrderStats } from '@/utils/api'

const stats = ref<OrderStats>({
  totalOrders: 0,
  paidOrders: 0,
  totalRevenue: 0,
  menuStats: []
})

const fetchStats = async () => {
  try {
    stats.value = await orderApi.getStats()
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.stats-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.summary-card {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-around;
  color: #fff;
}

.summary-item {
  text-align: center;

  .summary-value {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
  }

  .summary-label {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.stats-section {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.stats-list {
  .stats-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .rank {
    width: 48rpx;
    height: 48rpx;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    color: #666;
    margin-right: 20rpx;

    &:nth-child(1) {
      background: #ffd700;
      color: #fff;
    }

    &:nth-child(2) {
      background: #c0c0c0;
      color: #fff;
    }

    &:nth-child(3) {
      background: #cd7f32;
      color: #fff;
    }
  }

  .info {
    flex: 1;

    .name {
      font-size: 30rpx;
      color: #333;
    }
  }

  .quantity {
    font-size: 28rpx;
    color: #1890ff;
    font-weight: 500;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>

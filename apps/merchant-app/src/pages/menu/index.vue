<template>
  <view class="menu-page">
    <!-- 截止时间设置 -->
    <view class="cutoff-card">
      <view class="cutoff-label">今日截止时间</view>
      <picker mode="time" :value="cutoffTime" @change="onCutoffChange">
        <view class="cutoff-value">{{ cutoffTime || '点击设置' }}</view>
      </picker>
    </view>
    
    <!-- 菜品列表 -->
    <view class="menu-list">
      <view class="list-header">
        <text class="list-title">今日菜品 ({{ menuList.length }})</text>
        <button class="add-btn" @tap="goToAdd">+ 添加菜品</button>
      </view>
      
      <view v-for="item in menuList" :key="item.id" class="menu-item">
        <image class="menu-image" :src="item.image" mode="aspectFill" />
        <view class="menu-info">
          <text class="menu-name">{{ item.name }}</text>
          <view class="menu-meta">
            <text class="menu-price">¥{{ item.price }}</text>
            <text class="menu-stock">库存: {{ item.stock }} | 已售: {{ item.sold }}</text>
          </view>
        </view>
        <view class="menu-actions">
          <button class="edit-btn" @tap="goToEdit(item)">编辑</button>
          <button class="delete-btn" @tap="handleDelete(item)">删除</button>
        </view>
      </view>
      
      <view v-if="menuList.length === 0" class="empty-state">
        <text>暂无菜品，点击上方添加</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { menuApi, type MenuItem } from '@/utils/api'

const menuList = ref<MenuItem[]>([])
const cutoffTime = ref('')

const fetchMenu = async () => {
  try {
    const res = await menuApi.getToday()
    menuList.value = res.items
    cutoffTime.value = res.cutoffTime ? new Date(res.cutoffTime).toTimeString().slice(0, 5) : ''
  } catch (error) {
    console.error('获取菜单失败', error)
  }
}

const onCutoffChange = async (e: any) => {
  const time = e.detail.value
  try {
    await menuApi.setCutoffTime(time)
    cutoffTime.value = time
    uni.showToast({ title: '设置成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '设置失败', icon: 'none' })
  }
}

const goToAdd = () => {
  uni.navigateTo({ url: '/pages/menu/edit' })
}

const goToEdit = (item: MenuItem) => {
  uni.navigateTo({ url: `/pages/menu/edit?id=${item.id}` })
}

const handleDelete = (item: MenuItem) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除菜品"${item.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await menuApi.delete(item.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          fetchMenu()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

onMounted(() => {
  fetchMenu()
})

onShow(() => {
  fetchMenu()
})
</script>

<style lang="scss" scoped>
.menu-page {
  min-height: 100vh;
  padding: 24rpx;
}

.cutoff-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.cutoff-label {
  font-size: 28rpx;
  color: #333;
}

.cutoff-value {
  font-size: 32rpx;
  color: #1890ff;
  font-weight: 500;
}

.menu-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.list-title {
  font-size: 30rpx;
  font-weight: 500;
}

.add-btn {
  background: #1890ff;
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  border: none;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.menu-info {
  flex: 1;
  margin-left: 20rpx;
}

.menu-name {
  font-size: 28rpx;
  font-weight: 500;
  display: block;
}

.menu-meta {
  margin-top: 12rpx;
}

.menu-price {
  font-size: 28rpx;
  color: #ee0a24;
  margin-right: 16rpx;
}

.menu-stock {
  font-size: 24rpx;
  color: #999;
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.edit-btn {
  background: #e6f7ff;
  color: #1890ff;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  border: none;
}

.delete-btn {
  background: #fff1f0;
  color: #ee0a24;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  border: none;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
}
</style>

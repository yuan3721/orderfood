<template>
  <view class="index-page">
    <!-- 倒计时区域 -->
    <view class="countdown-bar">
      <text v-if="!isExpired">距离点餐截止还有 {{ countdown }}</text>
      <text v-else class="expired">今日点餐已截止</text>
    </view>
    
    <!-- 菜单列表 -->
    <view class="menu-list">
      <view v-for="item in menuList" :key="item.id" class="menu-item">
        <image class="menu-image" :src="item.image" mode="aspectFill" />
        <view class="menu-info">
          <text class="menu-name">{{ item.name }}</text>
          <view class="menu-meta">
            <text class="menu-price">¥{{ item.price }}</text>
            <text v-if="item.stock > 0" class="menu-stock">剩余 {{ item.stock }}</text>
            <text v-else class="menu-sold-out">已售罄</text>
          </view>
        </view>
        <view class="menu-action">
          <button 
            v-if="item.stock > 0 && !isExpired" 
            class="add-btn" 
            @tap="addToCart(item)"
          >+</button>
        </view>
      </view>
      
      <view v-if="menuList.length === 0" class="empty-state">
        <text>暂无今日菜单</text>
      </view>
    </view>
    
    <!-- 购物车入口 -->
    <view v-if="cartCount > 0" class="cart-float" @tap="goToConfirm">
      <text class="cart-count">{{ cartCount }}</text>
      <text class="cart-text">去下单</text>
      <text class="cart-total">¥{{ cartTotal }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCartStore } from '@/stores/cart'
import { menuApi, type MenuItem } from '@/utils/api'

const menuList = ref<MenuItem[]>([])
const cutoffTime = ref<Date | null>(null)
const countdown = ref('00:00:00')
const isExpired = ref(false)

const cartStore = useCartStore()

const cartCount = computed(() => cartStore.totalCount)
const cartTotal = computed(() => cartStore.totalPrice.toFixed(2))

// 获取今日菜单
const fetchMenu = async () => {
  try {
    const res = await menuApi.getToday()
    menuList.value = res.items
    isExpired.value = res.isExpired
    if (res.cutoffTime) {
      cutoffTime.value = new Date(res.cutoffTime)
      startCountdown()
    }
  } catch (error) {
    console.error('获取菜单失败', error)
  }
}

// 倒计时
let timer: number | null = null
const startCountdown = () => {
  if (timer) clearInterval(timer)
  
  const updateCountdown = () => {
    if (!cutoffTime.value) return
    
    const now = Date.now()
    const diff = cutoffTime.value.getTime() - now
    
    if (diff <= 0) {
      isExpired.value = true
      countdown.value = '00:00:00'
      if (timer) clearInterval(timer)
      return
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    countdown.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  updateCountdown()
  timer = setInterval(updateCountdown, 1000) as unknown as number
}

// 添加到购物车
const addToCart = (item: MenuItem) => {
  cartStore.addItem({
    menuId: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    stock: item.stock
  })
  uni.showToast({ title: '已加入购物车', icon: 'success', duration: 1000 })
}

// 跳转确认订单
const goToConfirm = () => {
  uni.navigateTo({ url: '/pages/order/confirm' })
}

onMounted(() => {
  fetchMenu()
})

onShow(() => {
  fetchMenu()
})
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.countdown-bar {
  background: linear-gradient(135deg, #07c160, #00d26a);
  color: #fff;
  padding: 24rpx 32rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 500;
  
  .expired {
    color: #ffeb3b;
  }
}

.menu-list {
  padding: 24rpx;
}

.menu-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.menu-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.menu-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.menu-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-price {
  font-size: 36rpx;
  color: #ee0a24;
  font-weight: 600;
}

.menu-stock {
  font-size: 24rpx;
  color: #999;
}

.menu-sold-out {
  font-size: 24rpx;
  color: #ee0a24;
  background: #fff0f0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.menu-action {
  display: flex;
  align-items: flex-end;
}

.add-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #07c160;
  color: #fff;
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  line-height: 1;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.cart-float {
  position: fixed;
  bottom: 40rpx;
  left: 32rpx;
  right: 32rpx;
  height: 100rpx;
  background: #333;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  padding: 0 40rpx;
  color: #fff;
  
  .cart-count {
    background: #07c160;
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    text-align: center;
    line-height: 48rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
  }
  
  .cart-text {
    flex: 1;
    font-size: 30rpx;
  }
  
  .cart-total {
    font-size: 36rpx;
    font-weight: 600;
  }
}
</style>

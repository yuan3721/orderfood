<template>
  <view class="confirm-page">
    <!-- 订单项列表 -->
    <view class="order-section">
      <view class="section-title">订单详情</view>
      <view class="order-items">
        <view v-for="item in cartItems" :key="item.menuId" class="order-item">
          <image class="item-image" :src="item.image" mode="aspectFill" />
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-price">¥{{ item.price }}</text>
          </view>
          <view class="item-quantity">
            <button class="qty-btn" @tap="decreaseItem(item.menuId)">-</button>
            <text class="qty-num">{{ item.quantity }}</text>
            <button class="qty-btn" @tap="increaseItem(item)">+</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="remark-section">
      <view class="section-title">备注</view>
      <textarea
        v-model="remark"
        class="remark-input"
        placeholder="请输入备注信息（选填）"
        maxlength="200"
      />
    </view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="total-info">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ totalPrice }}</text>
      </view>
      <button 
        class="submit-btn" 
        :disabled="cartItems.length === 0 || submitting"
        :loading="submitting"
        @tap="submitOrder"
      >
        提交订单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { orderApi } from '@/utils/api'

const cartStore = useCartStore()
const userStore = useUserStore()

const remark = ref('')
const submitting = ref(false)

const cartItems = computed(() => cartStore.items)
const totalPrice = computed(() => cartStore.totalPrice.toFixed(2))

const increaseItem = (item: any) => {
  cartStore.addItem(item)
}

const decreaseItem = (menuId: number) => {
  cartStore.removeItem(menuId)
}

const submitOrder = async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (cartItems.value.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }

  try {
    submitting.value = true

    // 创建订单
    const order = await orderApi.create({
      items: cartItems.value.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity
      })),
      remark: remark.value
    })

    // 清空购物车
    cartStore.clearCart()

    // 发起支付
    try {
      const payParams = await orderApi.pay(order.id)
      
      // 调用微信支付
      await uni.requestPayment({
        provider: 'wxpay',
        ...payParams
      })

      // 支付成功
      uni.redirectTo({
        url: `/pages/order/pay-result?status=success&orderId=${order.id}`
      })
    } catch (payError) {
      // 支付取消或失败，跳转到订单详情
      uni.redirectTo({
        url: `/pages/order/pay-result?status=pending&orderId=${order.id}`
      })
    }
  } catch (error: any) {
    console.error('创建订单失败:', error)
    uni.showToast({ title: error.message || '创建订单失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.confirm-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.order-section,
.remark-section {
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

.order-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 20rpx;

  .item-name {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
  }

  .item-price {
    font-size: 32rpx;
    color: #ee0a24;
    font-weight: 500;
  }
}

.item-quantity {
  display: flex;
  align-items: center;

  .qty-btn {
    width: 56rpx;
    height: 56rpx;
    background: #f0f0f0;
    border-radius: 50%;
    font-size: 36rpx;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 0;
    line-height: 1;

    &::after {
      border: none;
    }
  }

  .qty-num {
    width: 60rpx;
    text-align: center;
    font-size: 28rpx;
  }
}

.remark-input {
  width: 100%;
  height: 160rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.total-info {
  flex: 1;

  .total-label {
    font-size: 28rpx;
    color: #666;
  }

  .total-price {
    font-size: 40rpx;
    color: #ee0a24;
    font-weight: 600;
  }
}

.submit-btn {
  width: 240rpx;
  height: 80rpx;
  background: #07c160;
  color: #fff;
  font-size: 32rpx;
  border-radius: 40rpx;
  border: none;

  &[disabled] {
    background: #ccc;
  }

  &::after {
    border: none;
  }
}
</style>

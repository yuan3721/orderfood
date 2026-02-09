<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useMerchantStore } from './stores/merchant'

onLaunch(() => {
  console.log('Merchant App Launch')
  // 检查登录状态
  const merchantStore = useMerchantStore()
  merchantStore.checkLoginStatus()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

/* 常用工具类 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.text-center {
  text-align: center;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 主题色 - 商家端用蓝色 */
.text-primary {
  color: #1890ff;
}

.bg-primary {
  background-color: #1890ff;
}

.text-danger {
  color: #ee0a24;
}

.text-success {
  color: #52c41a;
}

.text-gray {
  color: #999;
}
</style>

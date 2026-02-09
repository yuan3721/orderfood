<template>
  <view class="edit-page">
    <view class="form-section">
      <!-- 图片上传 -->
      <view class="form-item">
        <text class="label">菜品图片</text>
        <view class="image-upload" @tap="chooseImage">
          <image v-if="form.image" :src="form.image" mode="aspectFill" class="preview-image" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击上传</text>
          </view>
        </view>
      </view>

      <!-- 菜品名称 -->
      <view class="form-item">
        <text class="label">菜品名称 *</text>
        <input v-model="form.name" class="input" placeholder="请输入菜品名称" />
      </view>

      <!-- 菜品描述 -->
      <view class="form-item">
        <text class="label">菜品描述</text>
        <textarea v-model="form.description" class="textarea" placeholder="请输入菜品描述" />
      </view>

      <!-- 价格 -->
      <view class="form-item">
        <text class="label">价格 *</text>
        <input v-model="form.price" type="digit" class="input" placeholder="请输入价格" />
      </view>

      <!-- 库存 -->
      <view class="form-item">
        <text class="label">库存 *</text>
        <input v-model="form.stock" type="number" class="input" placeholder="请输入库存数量" />
      </view>
    </view>

    <view class="submit-bar">
      <button 
        class="submit-btn" 
        :disabled="!canSubmit || submitting" 
        :loading="submitting"
        @tap="handleSubmit"
      >
        {{ isEdit ? '保存修改' : '添加菜品' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { menuApi, uploadApi, type MenuItem } from '@/utils/api'

const isEdit = ref(false)
const menuId = ref<number | null>(null)
const submitting = ref(false)

const form = ref({
  name: '',
  description: '',
  price: '',
  stock: '',
  image: ''
})

const canSubmit = computed(() => {
  return form.value.name && form.value.price && form.value.stock
})

onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    menuId.value = parseInt(options.id)
    loadMenuData()
  }
})

const loadMenuData = async () => {
  if (!menuId.value) return
  
  try {
    const res = await menuApi.getToday()
    const item = res.items.find((m) => m.id === menuId.value)
    if (item) {
      form.value = {
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        stock: item.stock.toString(),
        image: item.image || ''
      }
    }
  } catch (error) {
    console.error('加载菜品失败', error)
  }
}

const chooseImage = async () => {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    if (res.tempFilePaths?.length) {
      uni.showLoading({ title: '上传中...' })
      const url = await uploadApi.uploadImage(res.tempFilePaths[0])
      form.value.image = url
      uni.hideLoading()
    }
  } catch (error: any) {
    uni.hideLoading()
    if (error.errMsg !== 'chooseImage:fail cancel') {
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  try {
    submitting.value = true

    const data = {
      name: form.value.name,
      description: form.value.description,
      price: parseFloat(form.value.price),
      stock: parseInt(form.value.stock),
      image: form.value.image
    }

    if (isEdit.value && menuId.value) {
      await menuApi.update(menuId.value, data)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      await menuApi.create(data)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.form-section {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }

  .input {
    width: 100%;
    height: 88rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }

  .textarea {
    width: 100%;
    height: 160rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
}

.image-upload {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .upload-icon {
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }

  .upload-text {
    font-size: 24rpx;
    color: #999;
  }
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #1890ff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  border: none;

  &[disabled] {
    background: #ccc;
  }

  &::after {
    border: none;
  }
}
</style>

<template>
  <!-- 弹窗组件 -->
  <a-modal v-model:open="open" title="图片裁切" :footer="false">
    <div class="image-cropper">
      <!-- 图片裁切组件 -->
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        output-type="png"
        :can-move="true"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
        style="height: 360px"
      />
      <!-- 图片操作 -->
      <div class="image-cropper-actions">
        <a-space>
          <a-button @click="rotateLeft">左旋<RotateLeftOutlined /></a-button>
          <a-button @click="rotateRight">右旋<RotateRightOutlined /></a-button>
          <a-button @click="changeScale(1)"><ZoomInOutlined />放大</a-button>
          <a-button @click="changeScale(-1)"><ZoomOutOutlined />缩小</a-button>
          <a-button type="primary" :loading="loading" @click="handleConfirm"><CheckCircleOutlined />确认</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { defineExpose, ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined ,ZoomOutOutlined,ShrinkOutlined,CheckCircleOutlined} from '@ant-design/icons-vue';
import { uploadPictureUsingPost } from '@/api/pictureController.ts'

// region 弹窗逻辑
const open = ref<boolean>(false)

// 显示对话框
const openModal = () => {
  open.value = true
}

// 定义 Props 接口
interface Props {
  picture?: API.PictureVO
  spaceId?: any
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const cropperRef = ref()
const loading = ref<boolean>(false)

// 使用 computed 动态获取 imageUrl
const imageUrl = computed(() => props.picture?.url || '')


// 暴露 openModal 函数给父组件
defineExpose({
  openModal,
})
// endregion

// region 图片裁切逻辑
// 定义 changeScale 函数，用于放大或缩小图片
const changeScale = (num: number) => {
  num = num || 1
  cropperRef.value.changeScale(num)
}

// 定义 rotateLeft 函数，用于左旋图片
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
}

// 定义 rotateRight 函数，用于右旋图片
const rotateRight = () => {
  cropperRef.value.rotateRight()
}

// 定义 clearCrop 函数，用于清空图片
const clearCrop = () => {
  // 清除 imageUrl
  // 注意：这里不能直接修改 computed 属性，需要通过其他方式实现
  console.warn('imageUrl is a computed property and cannot be directly modified.')
}

// 定义 handleConfirm 函数，用于裁切图片并提交
const handleConfirm = () => {
  cropperRef.value.getCropBlob(
    (blob: Blob) => {
      // Blob 对象 已经裁切的图片文件
      const fileName = (props.picture?.picName || 'image') + '.png'
      const file = new File([blob], fileName, {
        type: blob.type,
      })

      // TODO: 提交图片到服务器
      handleUpload({ file })
      open.value = false // 关闭弹窗
    },
    (err: any) => {
      console.error('图片裁切失败', err)
    },
  )
}

/**
 * 上传
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    if (props.spaceId) {
      params.spaceId = props.spaceId
    }
    const res = await uploadPictureUsingPost(params, {}, file)
    //@ts-ignore
    if (res.data.code === 0 && res.data.data) {
      message.success('上传成功')
      //@ts-ignore
      props.onSuccess?.(res.data.data)
    } else {
      //@ts-ignore
      message.error('上传失败,' + res.data.message)
    }
  } catch (error) {
    message.error('上传过程中发生错误')
  } finally {
    loading.value = false
  }
}

// endregion
</script>
<style scoped>
.image-cropper {
  text-align: center;
}

.image-cropper-actions {
  margin-top: 16px;
  text-align: center;
}
</style>

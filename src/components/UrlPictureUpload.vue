<template>
  <div class="url-picture-upload">
    <!-- Url上传图片输入框 -->
    <a-input-search
      v-model:value="fileUrl"
      placeholder="输入图片链接🔗"
      size="large"
      :loading="loading"
      @search="handleUpload"
    >
      <template #enterButton>
        <a-button :loading="loading" type="primary">
          <template #icon>
            <UploadOutlined />
          </template>
          上传
        </a-button>
      </template>
    </a-input-search>

    <div class="url-uploader">
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
    </div>
  </div>
  <!-- 表单 -->
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'
import { UploadOutlined } from '@ant-design/icons-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const fileUrl = ref<string>()
const loading = ref<boolean>(false)

/**
 * 上传图片
 * @param file
 */
interface UploadResponseData {
  code: number
  message: string
  data: any
}

const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    if (props.spaceId) {
      params.spaceId = props.spaceId
    }
    const res = await uploadPictureByUrlUsingPost(params)
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

</script>

<style scoped>
.url-picture-upload img {
  max-height: 600px;

  box-sizing: border-box; /* 确保内边距和边框包含在元素的宽度和高度内 */
}

.url-uploader {
  margin-top: 16px;
  display: flex;
  border: dashed #ccc; /* 添加虚线边框 */
  justify-content: center;
  align-items: center;
}
</style>

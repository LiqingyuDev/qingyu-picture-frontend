<template>
  <div class="picture-upload">
    <!--    图片上传组件-->
    <a-upload
      list-type="picture-card"
      class="avatar-uploader"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击上传</div>
      </div>
    </a-upload>
  </div>
  <!--  表单-->
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: any
}

const props = defineProps<Props>()

/**
 * 上传图片
 * @param file
 */
interface UploadResponseData {
  code: number
  message: string
  data: any
}

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

const loading = ref<boolean>(false)

/**
 * 上传文件之前校验
 * @param file
 */
// @ts-ignore
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('您只能上传 JPG 或 PNG 文件！')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小必须小于 2MB！')
  }
  return isJpgOrPng && isLt2M
}
</script>

<style scoped>
/*.picture-upload {
  margin-inline: 100px;
  width: 80%;
  margin: 0 auto;
}*/
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-width: 152px;
  min-height: 152px;
}

.picture-upload img {
  max-height: 600px;
}

.ant-upload-select-picture-card i {
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  color: #666;
}
</style>

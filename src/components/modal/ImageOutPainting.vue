<template>
  <!-- 弹窗组件 -->
  <a-modal v-model:open="open" title="AI扩图" :footer="false">
    <div class="image-out-painting">
      <!-- AI扩图组件 -->
      <div class="image-out-painting-展示">
        <a-row gutter="16">
          <a-col span="12">
            <h4>原始图片：</h4>
            <img :src="picture?.url" style="max-width: 100%" :alt="picture?.picName" />
          </a-col>
          <a-col span="12" v-if="resultImageUrl">
            <h4>扩图结果：</h4>
            <img
              :src="resultImageUrl"
              style="max-width: 100%"
              :alt="picture?.picName"
            />
          </a-col>
        </a-row>
      </div>
      <!-- 图片操作 -->
      <div class="image-out-painting-actions">
        <a-space>
          <a-button type="primary" :loading="!!taskId" ghost  @click="doOutPainting({ xScale: 1.5, yScale: 1.5 })">
            <RobotOutlined />
            等比扩图
          </a-button>
          <a-button type="primary" :loading="!!taskId" ghost  @click="doOutPainting({ xScale: 1.5, yScale: 1 })">
            <RobotOutlined />
            横向扩图
          </a-button>
          <a-button type="primary" :loading="!!taskId" ghost  @click="doOutPainting({ xScale: 1, yScale: 1.5 })">
            <RobotOutlined />
            纵向扩图
          </a-button>
          <a-button type="primary" @click="handleUpload">
            <CheckCircleOutlined />
            保存结果
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { defineExpose, onUnmounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { RobotOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'

// region 弹窗逻辑
const open = ref<boolean>(false)

// 显示对话框
const openModal = () => {
  open.value = true
}
const closeModal = () => {
  open.value = false
}

// 定义 Props 接口
interface Props {
  picture?: API.PictureVO
  spaceId?: any
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const resultImageUrl = ref<string>()

// 暴露 openModal 函数给父组件
defineExpose({
  openModal,
})
// endregion

// region AI扩图逻辑
let taskId = ref<string>()

// 定义 doOutPainting 函数
const doOutPainting = async (parameters: { xScale: number; yScale: number }) => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture?.id,
    parameters: parameters,
  })
  if (res.data.code == 0 && res.data.data) {
    message.success('AI扩图中,请勿关闭此界面!')
    console.log(res.data.data.output?.taskId)
    taskId.value = res.data.data?.output?.taskId
    //轮询
    startPolling()
  } else {
    message.error('创建任务失败，' + res.data.message)
  }
}
// 轮询定时器
let pollingTimer: NodeJS.Timeout = null

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    //@ts-ignore
    taskId.value = null
  }
}

// 开始轮询
const startPolling = () => {
  if (!taskId.value) return

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        //@ts-ignore
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult?.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务成功')
          resultImageUrl.value = taskResult?.outputImageUrl
          clearPolling()
        } else if (taskResult?.taskStatus === 'FAILED') {
          message.error('扩图任务失败')
          clearPolling()
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败', error)
      message.error('检测任务状态失败，请稍后重试')
      clearPolling()
    }
  }, 5000) // 每隔 5 秒轮询一次
}

// 清理定时器，避免内存泄漏
onUnmounted(() => {
  clearPolling()
})

const uploadLoading = ref<boolean>(false)

const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// endregion
</script>


<style scoped>
.image-out-painting-actions {
  margin-top: 16px;
  text-align: center;
}
</style>

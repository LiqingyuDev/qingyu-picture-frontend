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
        style="height: 400px"
      />
      <!-- 协同编辑操作 -->
      <div class="image-edit-actions" v-if="isTeamSpace">
        <template v-if="!editingUser">
          <h2 disabled>点击进入编辑</h2>
          <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
        </template>
        <template v-else>
          <h2 disabled>{{ editingUser.userName }} 正在编辑</h2>
          <a-button v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
        </template>
      </div>

      <!-- 图片操作 -->
      <div class="image-cropper-actions">
        <a-space>
          <a-button @click="rotateLeft" :disabled="!canEdit">左旋<RotateLeftOutlined /></a-button>
          <a-button @click="rotateRight" :disabled="!canEdit">右旋<RotateRightOutlined /></a-button>
          <a-button @click="changeScale(1)" :disabled="!canEdit"><ZoomInOutlined />放大</a-button>
          <a-button @click="changeScale(-1)" :disabled="!canEdit"><ZoomOutOutlined />缩小</a-button>
          <a-button type="primary" :loading="loading" @click="handleConfirm" :disabled="!canEdit"
            ><CheckCircleOutlined />确认</a-button
          >
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { defineExpose, ref, computed, watchEffect, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ShrinkOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/PictureEditWebSocket.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

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
  space?: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}
//Is it a team space?
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

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
  cropperRef.value.changeScale(num)
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}

// 定义 rotateLeft 函数，用于左旋图片
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 定义 rotateRight 函数，用于右旋图片
const rotateRight = () => {
  cropperRef.value.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 定义 clearCrop 函数，用于清空图片
const clearCrop = () => {
  // 清除 imageUrl
  // 注意：这里不能直接修改 computed 属性，需要通过其他方式实现
  console.warn('imageUrl is a computed property and cannot be directly modified.')
}
// region --------- 实时编辑 ---------

const loginUserStore = useLoginUserStore()
let loginUser = loginUserStore.loginUser
// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 没有用户正在编辑中，可进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 正在编辑的用户是本人，可退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})
// 可以编辑
const canEdit = computed(() => {
  //not team space,default can edit
  if (!isTeamSpace.value) {
    return true
  }
  return editingUser.value?.id === loginUser.id
})

// endregion
let websocket: PictureEditWebSocket | null

// 初始化 WebSocket 连接，绑定事件
const initWebsocket = () => {
  const pictureId = props.picture?.id
  if (!pictureId || !open.value) {
    return
  }
  // 防止之前的连接未释放
  if (websocket) {
    websocket.disconnect()
  }
  // 创建 WebSocket 实例
  websocket = new PictureEditWebSocket(pictureId)
  // 建立 WebSocket 连接
  websocket.connect()

  // 监听通知消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    message.info(msg.message)
  })

  // 监听错误消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误消息：', msg)
    message.error(msg.message)
  })

  // 监听进入编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态消息：', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  // 监听编辑操作消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作消息：', msg)
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        cropperRef.value.rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef.value.rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
    }
  })

  // 监听退出编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态消息：', msg)
    message.info(msg.message)
    editingUser.value = undefined
  })
}

onUnmounted(() => {
  // 断开连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})
watchEffect(() => {
  //only team space can edit
  if (!isTeamSpace.value) {
    return
  }
  initWebsocket()
})
// 关闭弹窗
const closeModal = () => {
  open.value = false
  // 断开连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
}
//编辑发送 WebSocket 消息的函数，包括进入编辑状态、退出编辑状态、执行编辑图片操作：
// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    // 发送进入编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (websocket) {
    // 发送编辑操作的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}

// region WebSocket

//endregion
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

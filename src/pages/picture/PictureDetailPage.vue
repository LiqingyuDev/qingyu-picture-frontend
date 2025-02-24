<template>
  <div class="PictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <div style="text-align: center" class="image-container">
            <a-image style="max-height: 600px; object-fit: contain" :src="picture.url" />
          </div>
        </a-card>
      </a-col>
      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.picName ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
          <a-space wrap>
            <a-button v-if="canEdit" type="default" @click="doEdit">
              编辑
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>
            <a-popconfirm
              title="确定要删除该图片吗？"
              @confirm="doDelete()"
              ok-text="删除"
              cancel-text="取消"
              class="button-spacing"
            >
              <a-button v-if="canDelete" danger
                >删除
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-popconfirm>
            <a-button type="default" @click="doDownload">
              下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-button type="default" @click="doShare">
              分享
              <template #icon>
                <ShareAltOutlined />
              </template>
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
  <!-- 图片分享     -->
  <share-modal ref="shareModalRef" :link="shareLink" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { downloadImage, formatSize } from '@/util'
import {
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

import { useRouter } from 'vue-router'
import ShareModal from '@/components/modal/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constants/space.ts'
// 定义 props
const props = defineProps<{
  id: number
}>()
//权限相关
// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 获取路由对象
// 定义响应式变量
const picture = ref<API.PictureVO>({})

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})

// 获取图片详情
onMounted(() => {
  fetchPictureDetail()
})

const loginUserStore = useLoginUserStore()

// 点击图片跳转至图片详情
const router = useRouter()
// 删除图片
const doDelete = async () => {
  const id = picture.value?.id
  if (!id) {
    message.error('图片不存在')
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0 && res.data.data) {
    // 跳转回首页
    await router.push({
      path: '/',
    })
    message.success('删除成功')
  } else {
    message.error('删除失败, ' + res.data.message)
  }
}
// 编辑图片
const doEdit = () => {
  const id = picture.value?.id
  if (!id) {
    message.error('图片不存在')
    return
  }
  router.push(`/add_picture/direct?id=${picture.value.id}`)
}
//下载图片
// 处理下载
const doDownload = () => {
  downloadImage(picture.value.url)
}

// 分享
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
const doShare = () => {
  // e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
.PictureDetailPage {
  padding: 10px;
}
</style>

<template>
  <div class="SpaceDetailPage">
    <a-row :gutter="[16, 16]">
      <!-- 空间展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="空间预览">
          <template #extra>
            <a-space>
              <a-button
                type="primary"
                :href="`/add_picture/direct?spaceId=${id}`"
                target="_blank"
                ghost
              >
                <PlusOutlined />
                添加图片
              </a-button>
              <a-button
                type="primary"
                :href="`/add_picture/url?spaceId=${id}`"
                target="_blank"
                ghost
              >
                <PlusOutlined />
                通过URL添加图片
              </a-button>
            </a-space>
          </template>
          <!-- 空间内图片 -->
          <div style="text-align: center" class="image-container">
            <!-- 图片列表 -->
            <PictureList
              :dataList="dataList"
              :loading="loading"
              :show-operation="true"
              :on-reload="fetchData"
            />
            <a-pagination
              style="text-align: right"
              v-model:current="searchParams.current"
              v-model:pageSize="searchParams.pageSize"
              :total="total"
              @change="onPageChange"
            />
          </div>
        </a-card>
      </a-col>
      <!-- 空间信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="空间信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="space.user?.userAvatar" />
                <div>{{ space.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ space.spaceName ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="空间级别">
              <a-tag color="green" v-if="space.spaceLevel === 0">普通版</a-tag>
              <a-tag color="blue" v-if="space.spaceLevel === 1">高级版</a-tag>
              <a-tag color="red" v-if="space.spaceLevel === 2">豪华版</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="空间容量">
              <a-tooltip
                :title="`占用空间 ${formatSize(space.totalSize)}/${formatSize(space.maxSize)}`"
              >
                <a-progress
                  v-if="space.totalSize !== undefined && space.maxSize !== undefined"
                  :stroke-color="{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }"
                  size="small"
                  :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
                />
              </a-tooltip>
            </a-descriptions-item>
            <a-descriptions-item label="最大上传数">
              {{ space.maxCount ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="当前上传数">
              {{ space.totalCount ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建用户ID">
              {{ space.userId ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ space.createTime ? new Date(space.createTime).toLocaleString() : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="编辑时间">
              {{ space.editTime ? new Date(space.editTime).toLocaleString() : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">
              {{ space.updateTime ? new Date(space.updateTime).toLocaleString() : '-' }}
            </a-descriptions-item>
          </a-descriptions>

<!--          <a-space wrap>
            <a-button v-if="canEdit" type="default" @click="doEdit">
              编辑
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>
            <a-popconfirm
              title="确定要删除该空间吗？"
              @confirm="doDelete()"
              ok-text="删除"
              cancel-text="取消"
              class="button-spacing"
            >
              <a-button v-if="canEdit" danger>
                删除
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-popconfirm>
          </a-space>-->
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { deleteSpaceUsingPost, getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { formatSize } from '@/util'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'

// 定义 props
const props = defineProps<{
  id: number
}>()

// 定义响应式变量
const space = ref<API.SpaceVO>({})
const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 计算属性
const canEdit = computed(() => {
  let loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    return false
  }
  // 判断是否是作者或管理员
  const user = space.value.user
  return user?.id === loginUser.id || loginUser.userRole === 'admin'
})

// 生命周期钩子
// 页面加载时请求空间详情和图片数据
onMounted(() => {
  fetchSpaceDetail()
  fetchData()
})

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}

// 获取图片数据
const fetchData = async () => {
  loading.value = true
  try {
    // 转换标签分类的搜索参数
    const params = {
      ...searchParams,
      spaceId: props.id,
    }

    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error(`查询列表数据失败, ${res.data.message}`)
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 分页改变时的处理方法
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 删除空间
const doDelete = async () => {
  const id = space.value?.id
  if (!id) {
    message.error('空间不存在')
    return
  }
  const res = await deleteSpaceUsingPost({ id })
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

// 编辑空间
const doEdit = () => {
  const id = space.value?.id
  if (!id) {
    message.error('空间不存在')
    return
  }
  router.push(`/add_space/direct?id=${space.value.id}`)
}
// 获取路由对象
const router = useRouter()

// 获取登录用户信息
const loginUserStore = useLoginUserStore()
</script>

<style scoped>
.SpaceDetailPage {
  padding: 10px;
}
</style>

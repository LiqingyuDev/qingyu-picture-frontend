<template>
  <div class="SpaceDetailPage">
    <a-row :gutter="[16, 16]">
      <!-- 空间展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <PictureSearchForm :onSearch="onSearch" />
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
          <div style="text-align: left" class="image-container">
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
        </a-card>
      </a-col>

    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { formatSize } from '@/util'
import {  PlusOutlined } from '@ant-design/icons-vue'
import PictureList from '@/components/PictureList.vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import PictureSearchForm from '@/components/PictureSearchForm.vue'


// 定义 props
const props = defineProps<{
  id: number
}>()

// 定义响应式变量
const space = ref<API.SpaceVO>({})
const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
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
      ...searchParams.value,
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
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}
//搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}
</script>

<style scoped>
.SpaceDetailPage {
  padding: 10px;
}
</style>

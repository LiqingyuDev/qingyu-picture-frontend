<template>
  <div id="myTeamListPage">
    <a-card
      title="我的团队空间"
      :bordered="false"
      style="background-color: rgba(255, 255, 255, 0.5); margin-bottom: 8px"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" href="/add_space" target="_blank">
            <PlusOutlined />
            创建空间
          </a-button>
        </a-space>
      </template>
    </a-card>

    <!-- 空间用户视图表格 -->
    <a-table :columns="columns" :data-source="dataList" :pagination="false">
      <template #bodyCell="{ column, record }">
        <!-- 空间级别 -->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div v-if="record.space">
            <a-tag>{{ SPACE_LEVEL_MAP[record.space.spaceLevel] }}</a-tag>
          </div>
        </template>
        <!-- 空间名称       -->
        <template v-else-if="column.dataIndex === 'spaceName'">
          {{ record.space.spaceName }}
        </template>
        <!-- 空间角色      -->
        <template v-else-if="column.dataIndex === 'spaceRole'">
          <template v-if="record.spaceRole === 'viewer'">
            <a-tag>浏览者</a-tag>
          </template>
          <template v-if="record.spaceRole === 'editor'">
            <a-tag color="blue">编辑者</a-tag>
          </template>
          <template v-else-if="record.spaceRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </template>
          <template v-else>
            <a-tag color="red">异常账号</a-tag>
          </template>
        </template>
        <!-- 最大总大小 -->
        <template v-else-if="column.dataIndex === 'maxSize'">
          {{ record.space.maxSize }} MB
        </template>
        <!-- 最大数量 -->
        <template v-else-if="column.dataIndex === 'maxCount'">
          {{ record.space.maxCount }}
        </template>
        <!-- 当前总大小 -->
        <template v-else-if="column.dataIndex === 'totalSize'">
          {{ record.space.totalSize }} MB
        </template>
        <!-- 当前数量 -->
        <template v-else-if="column.dataIndex === 'totalCount'">
          {{ record.space.totalCount }}
        </template>
        <!-- 时间格式化 -->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-button type="link" @click="navigateToSpace(record.space.id)"> 查看</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { SPACE_LEVEL_MAP } from '../../constants/space.ts'

import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'


const router = useRouter()
const loginUserStore = useLoginUserStore()

// 定义表格列
const columns = [
  { title: '空间ID', dataIndex: 'spaceId', width: '5%' },
  { title: '您的角色', dataIndex: 'spaceRole', width: '5%' },
  { title: '空间名称', dataIndex: 'spaceName', width: '10%' },
  { title: '空间级别', dataIndex: 'spaceLevel', width: '10%' },
  { title: '当前总大小', dataIndex: 'totalSize', width: '10%' },
  { title: '当前数量', dataIndex: 'totalCount', width: '10%' },
  { title: '最大总大小', dataIndex: 'maxSize', width: '10%' },
  { title: '最大数量', dataIndex: 'maxCount', width: '10%' },
  { title: '加入时间', dataIndex: 'createTime', width: '15%' },
  { title: '操作', dataIndex: 'action', width: '12%' },
]

// 定义展示数据
const dataList = ref<API.SpaceUserVO[]>([])

// 获取空间数据
const fetchData = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error(`查询列表数据失败, ${res.data.message}`)
  }
}
// 导航到空间详情页面
const navigateToSpace = (spaceId: number) => {
  router.push(`/space/${spaceId}`)
}
// 页面加载时请求一次数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.button-spacing {
  margin-right: 8px;
}

.search-form {
  width: 50%;
  justify-content: center;
  margin: 0 auto;
}
</style>

<template>
  <div id="spaceManagerPage">
    <a-card
      title="空间管理"
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
      <!-- 空间表格搜索表单 -->
      <a-form
        class="search-form"
        layout="inline"
        :model="searchParams"
        @finish="doSearch"
        style="margin-bottom: 16px"
      >
        <a-form-item label="空间级别">
          <a-select
            :options="SPACE_LEVEL_OPTIONS"
            v-model:value="searchParams.spaceLevel"
            placeholder="请选择空间级别"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="空间名称">
          <a-input
            v-model:value="searchParams.spaceName"
            placeholder="请输入空间名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" style="margin-right: 8px">
            <SearchOutlined />
            搜索
          </a-button>
          <a-button type="default" @click="doReset" style="margin-right: 8px" danger>
            <ReloadOutlined />
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 空间表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 空间级别 -->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div v-if="editableData[record.id]">
            <a-select
              v-model:value="editableData[record.id].spaceLevel"
              :options="SPACE_LEVEL_OPTIONS"
              placeholder="请输入空间级别"
              style="min-width: 120px"
              allow-clear
            />
          </div>
          <div v-else>
            <a-tag>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
          </div>
        </template>
        <!-- 时间格式化 -->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!-- 可编辑字段 -->
        <template
          v-else-if="['spaceName', 'spaceLevel', 'maxSize', 'maxCount'].includes(column.dataIndex)"
        >
          <div>
            <a-input
              v-if="editableData[record.id]"
              v-model:value="(editableData[record.id] as any)[column.dataIndex]"
              style="margin: -5px 0"
            />
            <template v-else>
              {{ record[column.dataIndex] }}
            </template>
          </div>
        </template>
        <!-- 操作按钮 -->
        <template v-else-if="column.key === 'action'">
          <div class="editable-row-operations">
            <span v-if="editableData[record.id]">
              <a-button @click="save(record)" class="button-spacing">保存</a-button>
              <a-popconfirm title="确定要取消吗？" @confirm="cancel(record)" class="button-spacing">
                <a-button>取消</a-button>
              </a-popconfirm>
            </span>
            <span v-else>
              <a-button @click="edit(record)" class="button-spacing">
                <template #icon><EditOutlined /></template>编辑</a-button
              >
              <a-popconfirm
                title="确定要删除该空间吗？"
                @confirm="doDelete(record.id)"
                ok-text="删除"
                cancel-text="取消"
                class="button-spacing"
              >
                <a-button danger
                  >删除<template #icon><DeleteOutlined /></template
                ></a-button>
              </a-popconfirm>
            </span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import {
  deleteSpaceUsingPost,
  listSpaceLevelUsingGet,
  listSpaceVoByPageUsingPost,
  updateSpaceUsingPost,
} from '@/api/spaceController.ts'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '../../constants/space.ts'

// 定义搜索参数
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})
//新建空间
const handleAdd = () => {}
// 定义表格列
const columns = [
  { title: '空间ID', dataIndex: 'id', width: '12%' },
  { title: '空间名称', dataIndex: 'spaceName' },
  { title: '空间级别', dataIndex: 'spaceLevel', width: '5%' },
  { title: '最大总大小', dataIndex: 'maxSize' },
  { title: '最大数量', dataIndex: 'maxCount' },
  { title: '当前总大小', dataIndex: 'totalSize' },
  { title: '当前数量', dataIndex: 'totalCount' },
  { title: '创建用户ID', dataIndex: 'userId', width: '5%' },
  { title: '创建时间', dataIndex: 'createTime', width: '10%' },
  { title: '编辑时间', dataIndex: 'editTime', width: '10%' },
  { title: '更新时间', dataIndex: 'updateTime', width: '10%' },
  { title: '操作', key: 'action', width: '12%' },
]

// 定义展示数据
const dataList = ref<API.SpaceVO[]>([])

// 定义总数
const total = ref(0)
// 可编辑数据
const editableData: Record<number, API.SpaceUpdateRequest> = reactive({})

// 分页配置
const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共${total}条数据`,
}))

// 动态修改分页
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取空间数据
const fetchData = async () => {
  const res = await listSpaceVoByPageUsingPost({ ...searchParams })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error(`查询列表数据失败, ${res.data.message}`)
  }
}

// 重置搜索条件
const doReset = () => {
  searchParams.spaceName = ''
  searchParams.spaceLevel = 0
  searchParams.current = 1
  fetchData()
}

// 搜索空间
const doSearch = () => {
  fetchData()
}

// 删除空间
const doDelete = async (id: number) => {
  if (!id) return
  const res = await deleteSpaceUsingPost({ id })
  if (res.data.code === 0 && res.data.data) {
    fetchData()
    message.success('删除成功')
  } else {
    message.error('删除失败, ' + res.data.message)
  }
}

// 编辑数据
const edit = (record: API.SpaceVO) => {
  if (record.id !== undefined) {
    editableData[record.id] = cloneDeep(record)
  } else {
    console.error('Record ID is undefined:', record)
  }
}

// 保存数据
const save = async (record: API.SpaceVO) => {
  if (record.id !== undefined) {
    // 使用 editableData 中的数据进行更新
    const updatedData = editableData[record.id]
    const res = await updateSpaceUsingPost({ ...updatedData })
    if (res.data.code === 0 && res.data.data) {
      fetchData()
      message.success('更新成功')
    } else {
      message.error('更新失败, ' + res.data.message)
    }
    delete editableData[record.id]
  } else {
    console.error('Record ID is undefined:', record)
  }
}

// 取消编辑
const cancel = (record: API.SpaceVO) => {
  if (record.id !== undefined) {
    delete editableData[record.id]
  } else {
    console.error('Record ID is undefined:', record)
  }
}

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('加载空间级别失败，' + res.data.message)
  }
}
// 页面加载时请求一次数据
onMounted(() => {
  fetchSpaceLevelList().then(() => fetchData())
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

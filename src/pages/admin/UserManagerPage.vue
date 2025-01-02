<template>
  <div id="userManagerPage">
    <div style="background: rgba(255, 255, 255, 0.3)">
      <a-card title="图片管理" :bordered="false" style="margin-bottom: 8px">
        <!--        <template #extra>
                  <a-button type="default" @click="()=>{
                    route.push({ name: 'pictureAdd' });
                  }">
                    <PlusOutlined />
                    添加用户
                  </a-button>
                  <a-button type="default" @click="doAdd">
                    <PlusOutlined />
                    批量添加图片
                  </a-button>
                </template>-->
        <!-- 用户表格搜索表单 -->
        <a-form
          class="search-form"
          layout="inline"
          :model="searchParams"
          @finish="doSearch"
          style="margin-bottom: 16px"
        >
          <a-form-item label="用户账号">
            <a-input v-model:value="searchParams.userAccount" placeholder="请输入账号" allow-clear />
          </a-form-item>
          <a-form-item label="用户昵称">
            <a-input v-model:value="searchParams.userName" placeholder="请输入用户昵称" allow-clear />
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
    </div>

      <!-- 用户表格 -->
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 头像显示 -->
          <template v-if="column.dataIndex === 'userAvatar'">
            <div v-if="record.userAvatar">
              <a-image :src="record.userAvatar" style="width: 81px" />
            </div>
            <div v-else>
              <a-image src="https://www.antdv.com/assets/logo.1ef800a8.svg" style="width: 81px" />
            </div>
          </template>
          <!-- 用户角色显示 -->
          <template v-else-if="column.dataIndex === 'userRole'">
            <template v-if="record.userRole === 'user'">
              <a-tag color="blue">普通用户</a-tag>
            </template>
            <template v-else-if="record.userRole === 'admin'">
              <a-tag color="green">管理员</a-tag>
            </template>
            <template v-else>
              <a-tag color="red">异常账号</a-tag>
            </template>
          </template>
          <!-- 时间格式化 -->
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.dataIndex === 'updateTime'">
            {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <!-- 可编辑字段 -->
          <template v-else-if="['userAccount', 'userName', 'userProfile'].includes(column.dataIndex)">
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
                title="确定要删除该用户吗？"
                @confirm="doDelete(record.id)"
                ok-text="删除"
                cancel-text="取消"
                class="button-spacing"
              >
                <template #icon><DeleteOutlined /></template>
                <a-button danger>删除</a-button>
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
import { ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import {
  deleteUserUsingPost,
  listUserVoByPageUsingPost,
  updateUserUsingPost
} from '@/api/userController.ts'

// 定义搜索参数
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend'
})

// 定义表格列
const columns = [
  { title: 'id', dataIndex: 'id', width: '12%' },
  { title: '头像', dataIndex: 'userAvatar', width: '5%' },
  { title: '账号', dataIndex: 'userAccount' },
  { title: '用户名', dataIndex: 'userName' },
  { title: '简介', dataIndex: 'userProfile' },
  { title: '用户角色', dataIndex: 'userRole', width: '5%' },
  { title: '创建时间', dataIndex: 'createTime', width: '10%' },
  { title: '更新时间', dataIndex: 'updateTime', width: '10%' },
  { title: '操作', key: 'action', width: '12%' }
]

// 定义展示数据
const dataList = ref<API.UserVO[]>([])

// 定义总数
const total = ref(0)
// 可编辑数据
const editableData: Record<number, API.UserUpdateRequest> = reactive({})

// 分页配置
const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共${total}条数据`
}))

// 动态修改分页
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取用户数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({ ...searchParams })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error(`查询列表数据失败, ${res.data.message}`)
  }
}

// 重置搜索条件
const doReset = () => {
  searchParams.userAccount = ''
  searchParams.userName = ''
  searchParams.current = 1
  fetchData()
}

// 搜索用户
const doSearch = () => {
  fetchData()
}

// 删除用户
const doDelete = async (id: number) => {
  if (!id) return
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0 && res.data.data) {
    fetchData()
    message.success('删除成功')
  } else {
    message.error('删除失败, ' + res.data.message)
  }
}

// 编辑数据
const edit = (record: API.UserVO) => {
  if (record.id !== undefined) {
    editableData[record.id] = cloneDeep(record)
  } else {
    console.error('Record ID is undefined:', record)
  }
}

// 保存数据
// 保存数据
const save = async (record: API.UserVO) => {
  if (record.id !== undefined) {
    // 使用 editableData 中的数据进行更新
    const updatedData = editableData[record.id]
    const res = await updateUserUsingPost({ ...updatedData })
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
const cancel = (record: API.UserVO) => {
  if (record.id !== undefined) {
    delete editableData[record.id]
  } else {
    console.error('Record ID is undefined:', record)
  }
}

// 页面加载时请求一次数据
onMounted(() => {
  searchParams.current = 1
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

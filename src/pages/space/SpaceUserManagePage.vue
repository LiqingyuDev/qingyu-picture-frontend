<template>
  <div id="spaceUserManagerPage">
    <a-card
      title="空间用户管理"
      :bordered="false"
      style="background-color: rgba(255, 255, 255, 0.5); margin-bottom: 8px"
    >
      <!-- 空间表格添加用户表单 -->
      <a-form layout="inline" :model="formData" @finish="handleSubmit" class="form-container">
        <a-form-item label="用户 id" name="userId">
          <a-input v-model:value="formData.userId" placeholder="请输入用户 id" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">添加用户</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 空间表格 -->
    <a-table :columns="columns" :data-source="dataList" :pagination="false">
      <template #bodyCell="{ column, record }">
        <!-- 用户信息 -->
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName }}
          </a-space>
        </template>
        <!-- 角色选择 -->
        <template v-else-if="column.dataIndex === 'spaceRole'">
          <div v-if="editableData[record.id]">
            <a-select
              v-model:value="editableData[record.id].spaceRole"
              :options="SPACE_ROLE_OPTIONS"
              style="margin: -5px 0"
            />
          </div>
          <div v-else>
            <a-tag :color="getRoleColor(record.spaceRole)">
              {{ getRoleLabel(record.spaceRole) }}
            </a-tag>
          </div>
        </template>
        <!-- 时间格式化 -->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
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
                <a-button danger
                  >删除
                  <template #icon><DeleteOutlined /></template>
                </a-button>
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
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import {
  addSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost
} from '@/api/spaceUserController.ts'
import { SPACE_ROLE_OPTIONS } from '../../constants/space.ts'
import { deleteSpaceUsingPost } from '@/api/spaceController.ts'

// 定义属性
interface Props {
  id: number
  userId: number
}

const props = defineProps<Props>()



// 定义表格列
const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 定义展示数据
const dataList = ref<API.SpaceUserVO[]>([])

// 可编辑数据
const editableData: Record<number, API.SpaceUserEditRequest> = reactive({})

// 获取用户数据
const fetchData = async () => {

  const res = await listSpaceUserUsingPost({ })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error(`查询列表数据失败, ${res.data.message}`)
  }
}

// 删除用户
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

// 添加用户
const formData = reactive<API.SpaceUserAddRequest>({
  spaceRole: 'viewer', // 设置默认角色为 'viewer'
})
const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId,
    ...formData,
  })
  if (res.data.code === 0) {
    message.success('添加成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('添加失败，' + res.data.message)
  }
}


// 编辑数据
const edit = (record: API.SpaceUserVO) => {
  if (record.id !== undefined) {
    editableData[record.id] = cloneDeep(record)
  } else {
    console.error('Record ID is undefined:', record)
  }
}

// 保存数据
const save = async (record: API.SpaceUserVO) => {
  if (record.id !== undefined) {
    // 使用 editableData 中的数据进行更新
    const updatedData = editableData[record.id]
    const res = await editSpaceUserUsingPost({ ...updatedData })
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
const cancel = (record: API.SpaceUserVO) => {
  if (record.id !== undefined) {
    delete editableData[record.id]
  } else {
    console.error('Record ID is undefined:', record)
  }
}

// 获取角色颜色
const getRoleColor = (role: string) => {
  switch (role) {
    case 'viewer':
      return 'default'
    case 'editor':
      return 'blue'
    case 'admin':
      return 'green'
    default:
      return 'red'
  }
}

// 获取角色标签
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'viewer':
      return '浏览者'
    case 'editor':
      return '编辑者'
    case 'admin':
      return '管理员'
    default:
      return '异常账号'
  }
}

// 页面加载时请求一次数据
onMounted(() => {
  fetchData()
})
</script>
<style scoped>.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px; /* 可选：添加一些底部间距 */
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

<template>
  <div id="pictureManagerPage">
    <!-- 图片表格搜索表单 -->
    <!-- 图片表格搜索表单 -->
    <a-form
      class="search-form"
      layout="inline"
      :model="searchParams"
      @finish="doSearch"
      style="margin-bottom: 16px"
    >
      <a-form-item label="关键词">
        <a-input v-model:value="searchParams.searchText" placeholder="请输入图片名称" allow-clear />
      </a-form-item>
      <a-form-item label="类型">
        <a-select
          v-model:value="searchParams.category"
          placeholder="请选择图片类型"
          allow-clear
          style="width: 150px"
        >
          <a-select-option
            v-for="option in categoryOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请选择标签"
          allow-clear
          style="width: 150px"
        >
          <a-select-option v-for="option in tagOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
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

    <!--    <a-form
          class="search-form"
          layout="inline"
          :model="searchParams"
          @finish="doSearch"
          style="margin-bottom: 16px"
        >
          <a-form-item label="关键词">
            <a-input v-model:value="searchParams.searchText" placeholder="请输入图片名称" allow-clear />
          </a-form-item>
          <a-form-item label="类型">
            <a-input v-model:value="searchParams.category" placeholder="请输入图片类型" allow-clear />
          </a-form-item>
          <a-form-item label="标签">
            <a-select
              v-model:value="searchParams.tags"
              mode="tags"
              style="width: 150px"
              placeholder="请输入标签"
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
        </a-form>-->

    <!-- 图片表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 图片信息 -->
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <!-- 图片显示 -->
        <template v-if="column.dataIndex === 'url'">
          <div v-if="record">
            <a-image :src="record.url" style="width: 81px" />
          </div>
          <div v-else>
            <a-image src="https://www.antdv.com/assets/logo.1ef800a8.svg" style="width: 81px" />
          </div>
        </template>
        <!--        分类格式化-->

        <template v-else-if="column.dataIndex === 'tags'">
          <div v-if="editableData[record.id]">
            <a-select
              mode="tags"
              :options="tagOptions"
              style="min-width: 120px"
              v-model:value="editableData[record.id].tags"
              placeholder="请选择标签"
              allow-clear
            />
          </div>
          <div v-else>
            <a-space>
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" :color="'pink'">
                {{ tag }}
              </a-tag>
            </a-space>
          </div>
        </template>
        <!--        标签格式化-->
        <template v-else-if="column.dataIndex === 'tags'">
          <div v-if="editableData[record.id]">
            <a-select
              v-if="editableData[record.id].tags"
              mode="tags"
              v-model:value="editableData[record.id].tags"
              placeholder="请选择标签"
              allow-clear
            />
          </div>
          <div v-else>
            <a-space>
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" :color="'pink'">
                {{ tag }}
              </a-tag>
            </a-space>
          </div>
        </template>
        <!-- 时间格式化 -->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!-- 可编辑字段 -->
        <template
          v-else-if="
            ['picName', 'dataIndex', 'category', 'tags', 'introduction'].includes(column.dataIndex)
          "
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
                title="确定要删除该图片吗？"
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
import { ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  listPictureTagCategoryUsingGet,
  updatePictureUsingPost,
} from '@/api/pictureController.ts'

// 定义图片管理表格列
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: '5%',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: '3%',
  },
  {
    title: '名称',
    dataIndex: 'picName',
    width: '5%',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: '10%',
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: '5%',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: '10%',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: '8%',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: '10%',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: '10%',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: '10%',
  },
  {
    title: '操作',
    key: 'action',
    width: '10%',
  },
]
// 定义搜索参数
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 定义展示数据
const dataList = ref<API.Picture[]>([])

// 定义总数
const total = ref(0)
// 可编辑数据
const editableData: Record<number, API.PictureUpdateRequest> = reactive({})

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

// 获取图片数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({ ...searchParams })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error(`查询列表数据失败, ${res.data.message}`)
  }
}
// 页面加载时请求一次数据
onMounted(() => {
  searchParams.current = 1
  fetchData()
})
// 重置搜索条件
const doReset = () => {
  searchParams.searchText = ''
  searchParams.category = ''
  searchParams.tags = []

  searchParams.current = 1
  fetchData()
}

// 搜索图片
const doSearch = () => {
  fetchData()
}

// 删除图片
const doDelete = async (id: number) => {
  if (!id) return
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0 && res.data.data) {
    fetchData()
    message.success('删除成功')
  } else {
    message.error('删除失败, ' + res.data.message)
  }
}
// 编辑数据
const edit = (record: API.Picture) => {
  if (record.id !== undefined) {
    const clonedRecord = cloneDeep(record)
    // 确保 tags 是一个数组
    if (typeof clonedRecord.tags === 'string') {
      clonedRecord.tags = JSON.parse(clonedRecord.tags)
    }
    //@ts-ignore
    editableData[record.id] = clonedRecord
  } else {
    console.error('Record ID is undefined:', record)
  }
}
// 保存数据
const save = async (record: API.Picture) => {
  if (record.id !== undefined) {
    // 使用 editableData 中的数据进行更新
    const updatedData = cloneDeep(editableData[record.id])

    // 确保 tags 是一个数组
    if (!Array.isArray(updatedData.tags)) {
      updatedData.tags = []
    }

    const res = await updatePictureUsingPost({ ...updatedData })
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
const cancel = (record: API.Picture) => {
  if (record.id !== undefined) {
    delete editableData[record.id]
  } else {
    console.error('Record ID is undefined:', record)
  }
}

/**
 * 获取类别和标签列表
 */
interface Option {
  value: string
  label: string
}

// 类别和标签列表
const categoryOptions = ref<Option[]>([])
const tagOptions = ref<Option[]>([])
// 获取类别和标签列表
const listPictureTagCategoryCategory = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      // message.success('获取标签、列表成功')
      categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
      tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
      //跳转到详情页
    } else {
      message.error('获取标签、列表成功,' + res.data.message)
    }
  } catch (error) {
    message.error('获取标签、列表成功发生错误，请重试')
  }
}
onMounted(() => {
  listPictureTagCategoryCategory()
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
  margin-right: 5px;
}

.search-form {
  width: 50%;
  justify-content: center;
  margin: 0 auto;
}
</style>

<template>
  <div id="pictureManagerPage">
    <div style="background: rgba(255, 255, 255, 0.3)">
      <a-card
        title="图片管理"
        :bordered="false"
        style="background-color: rgba(255, 255, 255, 0.5); margin-bottom: 8px"
      >
        <template #extra>
          <a-space>
            <a-button type="primary" href="/add_picture/direct" target="_blank" ghost>
              <PlusOutlined />
              添加图片
            </a-button>
            <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>
              <PlusOutlined />
              批量添加图片
            </a-button>
          </a-space>
        </template>
        <!-- 图片表格搜索表单 -->
        <a-form
          class="search-form"
          layout="inline"
          :model="searchParams"
          @finish="doSearch"
          style="margin-bottom: 8px"
        >
          <a-form-item label="关键词">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="请输入图片名称"
              allow-clear
            />
          </a-form-item>
          <!--    类型  -->
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
          <!--    审核状态  -->
          <a-form-item name="reviewStatus" label="审核状态">
            <a-select
              v-model:value="searchParams.reviewStatus"
              placeholder="请选择审核状态"
              allow-clear
              style="width: 150px"
            >
              <a-select-option
                v-for="option in PIC_REVIEW_STATUS_OPTIONS"
                :key="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <!--   标签   -->
          <a-form-item label="标签">
            <a-select
              v-model:value="searchParams.tags"
              mode="tags"
              placeholder="请选择标签"
              allow-clear
              style="width: 150px"
            >
              <a-select-option
                v-for="option in tagOptions"
                :key="option.value"
                :value="option.value"
              >
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
      </a-card>
    </div>

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
        <!-- 审核信息 -->
        <template v-if="column.dataIndex === 'reviewInfo'">
          <div v-if="record.reviewStatus">
            审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}
          </div>
          <div>审核人：{{ record.reviewerId }}</div>
          <div v-if="record.reviewTime">
            审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
          <div>审核消息：{{ record.reviewMessage }}</div>
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
        <template v-if="column.dataIndex === 'category'">
          <div v-if="editableData[record.id]">
            <a-select
              v-if="editableData[record.id].category"
              :options="categoryOptions"
              style="min-width: 120px"
              v-model:value="editableData[record.id].category"
              placeholder="请选择分类"
              allow-clear
            />
          </div>
        </template>

        <template v-else-if="column.dataIndex === 'tags'">
          <div v-if="editableData[record.id]">
            <a-select
              v-if="editableData[record.id].tags"
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

        <!-- 时间格式化 -->
        <template v-else-if="column.dataIndex === 'timeInfo'">
          <div>创建时间：{{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
          <div>编辑时间：{{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
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
              <a-button type="link" @click="edit(record)" class="button-spacing">
                <template #icon><EditOutlined /></template>编辑</a-button
              >
              <a-popconfirm
                title="确定要删除该图片吗？"
                @confirm="doDelete(record.id)"
                ok-text="删除"
                cancel-text="取消"
                class="button-spacing"
              >
                <a-button type="link" danger
                  >删除<template #icon><DeleteOutlined /></template
                ></a-button>
              </a-popconfirm>
              <a-button
                type="link"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
                class="button-spacing"
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              >
                <template #icon><CheckOutlined /></template>过审</a-button
              >
              <a-popconfirm
                title="确定要拒绝该图片吗？"
                @confirm="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
                ok-text="拒绝"
                cancel-text="取消"
                class="button-spacing"
              >
                <a-button
                  type="link"
                  class="button-spacing"
                  v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                  danger
                >
                  <template #icon><CloseOutlined /></template>拒绝</a-button
                >
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
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'

import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
  listPictureTagCategoryUsingGet,
  updatePictureUsingPost,
} from '@/api/pictureController.ts'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constants/picture.ts'

// 定义图片管理表格列
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: '5%',
  },
  {
    title: '创建者 id',
    dataIndex: 'userId',
    width: '10%',
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
    width: '5%',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: '8%',
  },

  {
    title: '审核信息',
    dataIndex: 'reviewInfo',
    width: '12%',
  },
  {
    title: '时间信息',
    dataIndex: 'timeInfo',
    width: '13%',
  },
  {
    title: '操作',
    key: 'action',
    width: '5%',
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
  //@ts-ignore
  searchParams.reviewStatus = ''

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
/**
 *
 * @param id
 * @param status
 */
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0 && res.data.data) {
    await fetchData()
    message.success('审核成功')
  } else {
    message.error('审核失败, ' + res.data.message)
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/*.button-spacing {
  margin-right: 5px;
}*/

.search-form {
  width: 80%;
  justify-content: center;
  margin: 0 auto;
}
</style>

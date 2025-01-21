<template>
  <div style="background: rgba(255, 255, 255, 0.3)">
    <a-card
      title="图片管理"
      :bordered="false"
      style="background-color: rgba(255, 255, 255, 0.5); margin-bottom: 8px"
    >
      <!-- 图片表格搜索表单 -->
      <div class="picture-search-form">
        <!-- 搜索表单 -->
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="分类" name="category">
            <a-auto-complete
              v-model:value="searchParams.category"
              style="min-width: 180px"
              :options="categoryOptions"
              placeholder="请输入分类"
              allowClear
            />
          </a-form-item>
          <a-form-item label="标签" name="tags">
            <a-select
              v-model:value="searchParams.tags"
              style="min-width: 180px"
              :options="tagOptions"
              mode="tags"
              placeholder="请输入标签"
              allowClear
            />
          </a-form-item>
          <a-form-item label="日期" name="">
            <a-range-picker
              style="width: 300px"
              show-time
              v-model:value="dateRange"
              :placeholder="['编辑开始日期', '编辑结束时间']"
              format="YYYY/MM/DD HH:mm:ss"
              :presets="rangePresets"
              @change="onRangeChange"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" style="width: 96px">
                <SearchOutlined />
                搜索
              </a-button>
              <a-button html-type="reset" @click="doReset" style="width: 96px">
                <ReloadOutlined />
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ReloadOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

// 获取数据
interface Option {
  value: string
  label: string
}

// 分类选项
const categoryOptions = ref<Option[]>([])

// 标签选项
const tagOptions = ref<Option[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

// 组件挂载后获取标签和分类选项
onMounted(() => {
  getTagCategoryOptions()
})

// 执行搜索操作
const doSearch = () => {
  props.onSearch?.(searchParams)
}

// 清理搜索条件
const doReset = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key as keyof API.PictureQueryRequest] = undefined
  })
  dateRange.value = []
  props.onSearch?.(searchParams)
}

// --------------------日期选择器-------------------

// 日期范围选择器的值
const dateRange = ref<[]>([])

/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates.length < 2) {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  } else {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  }
}

// 日期范围预设选项
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])
</script>
<style scoped>
.picture-search-form .ant-form-item {
  margin-top: 16px;
}
</style>

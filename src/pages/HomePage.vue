<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import PictureList from '@/components/PictureList.vue'

// 定义响应式变量
const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const selectedTags = ref<string[]>([])
// 分页改变时的处理方法
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}
// 生命周期钩子
// 页面加载时请求一次数据
onMounted(() => {
  searchParams.current = 1
  fetchData()
  listPictureTagCategoryCategory()
})

// 方法定义

// 获取图片数据
const fetchData = async () => {
  loading.value = true
  try {
    // 转换标签分类的搜索参数
    const params = {
      ...searchParams,
      tags: [] as string[], // 初始化 tagList 属性
    }

    if (selectedCategory.value !== 'all') {
      params.category = selectedCategory.value
    }

    if (selectedTags.value.length > 0) {
      selectedTags.value.forEach((useTag, index) => {
        if (useTag) {
          params.tags.push(tagList.value[index])
        }
      })
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

/**
 * 获取类别和标签列表
 */
const listPictureTagCategoryCategory = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      categoryList.value = res.data.data.categoryList ?? []
      tagList.value = res.data.data.tagList ?? []
    } else {
      message.error('获取标签列表成功,' + res.data.message)
    }
  } catch (error) {
    message.error('获取标签、列表发生错误，请重试')
  }
}

// 搜索图片
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}
</script>

<template>
  <div class="homePage">
    <!-- 图片搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        :loading="loading"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类筛选 -->
    <div class="category-filter">
      <a-tabs v-model:activeKey="selectedCategory" type="card" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane :key="category" v-for="category in categoryList" :tab="category" force-render />
      </a-tabs>
    </div>
    <!-- 标签筛选 -->
    <div class="tags-filter">
      <span style="margin-right: 8px">标签:</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTags[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>

<style scoped>
.homePage > .search-bar {
  max-width: 50%;
  margin: 0 auto 16px;
}

.homePage > .category-filter {
  max-width: 50%;
  margin: 0 auto;
}

.homePage > .tags-filter {
  max-width: 50%;
  margin: 0 auto 16px;
}
</style>

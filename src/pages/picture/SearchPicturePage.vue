<template>
  <div class="search-picture-page">
    <a-row :gutter="[16, 16]">
      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="原图预览">
          <div style="text-align: center" class="image-container">
            <a-image style="max-height: 600px; object-fit: contain" :src="picture.url" />
          </div>
        </a-card>
      </a-col>
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="相似图片">
          <!-- 图片列表 -->
          <a-list
            :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
            :data-source="dataList"
          >
            <template #renderItem="{ item }">
              <a-list-item style="padding: 0">
                <a :href="item.fromUrl" target="_blank">
                  <a-card>
                    <template #cover>
                      <img style="height: 180px; object-fit: cover" :src="item.thumbUrl" />
                    </template>
                  </a-card>
                </a>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { formatSize } from '../../utils'

const route = useRoute()

// 图片 id
const pictureId = computed(() => {
  return route.query?.pictureId
})

const picture = ref<API.PictureVO>({})

// 获取老数据
const getOldPicture = async () => {
  // 获取数据
  const id = route.query?.pictureId
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
    }
  }
}
const dataList = ref<API.ImageSearchResult[]>([])
// 获取搜图结果
const fetchData = async () => {
  const res = await searchPictureByPictureUsingPost({
    pictureId: pictureId.value,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  getOldPicture()
  fetchData()
})
</script>
<style scoped>
.search-picture-page {
  padding: 10px;
}
</style>

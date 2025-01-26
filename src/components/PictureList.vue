<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                style="height: 180px; object-fit: cover"
                :alt="picture.picName"
                :src="picture.thumbnailUrl ?? picture.url"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.picName">
              <template #description>
                <a-flex>
                  <a-tag color="red">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag color="green" v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>

            <template #actions v-if="showOperation == true">
              <a-space @click="(e: Event) => doEdit(picture, e)">
                <edit-outlined />
                编辑
              </a-space>
              <a-space @click="(e: Event) => doSearchPictureByPicture(picture, e)">
                <ChromeOutlined />
                搜索
              </a-space>
              <a-space @click="(e: Event) => doDelete(picture, e)">
                <delete-outlined />
                删除
              </a-space>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { EditOutlined, ChromeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOperation?: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
})

// 跳转至图片详情
const router = useRouter()
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑图片
const doEdit = (picture: API.PictureVO, e: Event) => {
  // 阻止图片点击事件
  e.stopPropagation()
  router.push({
    path: `/add_picture/direct`,
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}
//以图搜图
const doSearchPictureByPicture = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 删除图片
const doDelete = async (picture: API.PictureVO, e: Event) => {
  // 阻止图片点击事件
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    message.error('图片不存在')
    return
  }

  try {
    const res = await deletePictureUsingPost({ id })
    if (res.data.code === 0 && res.data.data) {
      message.success('删除成功')
      props.onReload?.()
    } else {
      message.error(`删除失败: ${res.data.message || '未知错误'}`)
    }
  } catch (error) {
    message.error('删除图片时发生错误，请稍后再试')
  }
}
</script>

<style scoped></style>

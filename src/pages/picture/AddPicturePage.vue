<template>
  <div id="addPicturePage">
    <!-- 使用 PictureUpload 组件，并传递 picture 和 onSuccess 属性 -->

    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <!-- 标题 -->
        <a-card :title="route.query?.id ? '图片预览' : '上传图片'">
          <template #extra>
            <a-space>
              <a-button type="primary" @click="editPicture">
                <ScissorOutlined />
                裁切图片
              </a-button>
              <a-button type="primary" @click="imageOutPaintingPicture">
                <ArrowsAltOutlined />
                AI扩图
              </a-button>
            </a-space>
          </template>
          <!--        空间-->
          <a-typography-paragraph v-if="spaceId" type="secondary"
            >上传至私有空间:
            <a :href="`/space/${spaceId}`">{{ spaceId }}</a>
          </a-typography-paragraph>
          <!--          图片上传组件-->
          <PictureUpload :picture="picture" :spaceId="spaceId" :on-success="onSuccess" />
        </a-card>
      </a-col>

      <!--    裁切图片的组件-->
      <ImageCropper
        ref="imageCropperRef"
        :picture="picture"
        :spaceId="spaceId"
        :space="space"
        :onSuccess="onCropSuccess"
      />
      <!--    AI扩图的组件-->
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :onSuccess="onCropSuccess"
      />

      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card v-if="picture" title="图片信息">
          <!--    表单-->
          <a-form
            v-if="picture"
            class="edit-form"
            layout="vertical"
            :model="pictureForm"
            @finish="handleSubmit"
            style="margin-bottom: 16px"
          >
            <!-- 图片名输入框 -->
            <a-form-item label="图片名" name="picName">
              <a-input v-model:value="pictureForm.picName" placeholder="请输入图片名" allow-clear />
            </a-form-item>

            <!-- 类别输入框 -->
            <a-form-item label="类别" name="category">
              <a-auto-complete
                v-model:value="pictureForm.category"
                placeholder="请选择类别"
                :options="categoryOptions"
                allow-clear
              />
            </a-form-item>

            <!-- 简介输入框 -->
            <a-form-item label="简介" name="introduction">
              <a-textarea
                v-model:value="pictureForm.introduction"
                placeholder="请输入简介"
                allow-clear
                :auto-size="{ minRows: 2, maxRows: 4 }"
              />
            </a-form-item>

            <!-- 标签输入框 -->
            <a-form-item label="标签" name="tags">
              <a-select
                mode="tags"
                v-model:value="pictureForm.tags"
                placeholder="请选择标签，用回车分隔"
                :options="tagOptions"
                allow-clear
              />
            </a-form-item>

            <!-- 操作按钮 -->
            <a-form-item class="edit-button">
              <!-- 搜索按钮 -->
              <a-button type="primary" html-type="submit" style="width: 100%; margin-top: 32px">
                <template #icon>
                  <CloudUploadOutlined />
                </template>
                提交
              </a-button>

              <!-- 重置按钮 -->
              <a-button
                type="default"
                @click="doReset"
                style="width: 100%; margin-top: 16px"
                danger
              >
                <template #icon>
                  <ReloadOutlined />
                </template>
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import {
  CloudUploadOutlined,
  ScissorOutlined,
  ReloadOutlined,
  ArrowsAltOutlined,
} from '@ant-design/icons-vue'

import { useRoute, useRouter } from 'vue-router'
import ImageCropper from '@/components/modal/ImageCropper.vue'
import ImageOutPainting from '@/components/modal/ImageOutPainting.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'

// 定义一个响应式的 picture 变量，用于存储上传的图片信息
const picture = ref<API.PictureVO>()

// 定义 onSuccess 回调函数，当图片上传成功时更新 picture 的值
const onSuccess = (newPicture: API.PictureVO) => {
  // 更新 picture 的值为新上传的图片信息
  picture.value = newPicture
  pictureForm.value.picName = newPicture.picName
}
const onCropSuccess = (newPicture: API.PictureVO) => {
  // 更新 picture 的值为新修改的图片信息
  picture.value = newPicture
  pictureForm.value.picName = newPicture.picName
}
const router = useRouter()
const pictureForm = ref<API.PictureQueryRequest>({})
//提交表单之后的逻辑
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    message.info('请先上传图片')
    return
  }
  try {
    const res = await editPictureUsingPost({
      ...pictureForm.value,
      id: pictureId,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('编辑成功')
      //跳转到详情页
      await router.push({
        path: `/picture/${pictureId}`,
      })
    } else {
      message.error('编辑失败,' + res.data.message)
    }
  } catch (error) {
    message.error('编辑过程中发生错误，请重试')
  }
  console.log('提交的表单值:', values)
}
// 重置操作
const doReset = () => {
  // 重置表单数据
  pictureForm.value = {
    category: '',
    id: undefined,
    introduction: '',
    picName: '',
    tags: [],
  }
}

// 类别和标签列表
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
 * 获取图片信息
 */
const route = useRoute()
const pictureId = route.query?.id
const spaceId = route.query?.spaceId
const getOldPictureInfo = async () => {
  if (!pictureId) {
    message.info('请先上传图片')
    return
  } else {
    const res = await getPictureVoByIdUsingGet({
      // @ts-ignore
      id: pictureId,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('获取图片信息成功')
      picture.value = res.data.data
      pictureForm.value = {
        category: res.data.data.category,
        id: res.data.data.id,
        introduction: res.data.data.introduction,
        picName: res.data.data.picName,
        tags: res.data.data.tags,
      }
    } else {
      message.error('获取图片信息失败,' + res.data.message)
    }
  }
}
onMounted(() => {
  getOldPictureInfo()
})

//图片裁切相关
const imageCropperRef = ref()
const editPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

const space = ref<API.SpaceVO>()

// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId) {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})

//AI扩图相关
const imageOutPaintingRef = ref()
const imageOutPaintingPicture = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}
</script>

<style scoped>
#addPicturePage {
  padding: 10px;
}

.edit-button {
  flex-direction: column;
  align-items: center; /* 使表单项垂直居中 */
}
</style>

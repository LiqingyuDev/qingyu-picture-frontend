<template>
  <div id="addSpaceBatchPage">
    <a-row :gutter="[16, 16]">
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="创建私有空间" :bordered="false" style="">
          <a-form layout="vertical" :model="formData" @finish="handleSubmit">
            <a-form-item label="空间名称" name="spaceName">
              <a-input
                v-model:value="formData.spaceName"
                placeholder="请输入空间名称"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="空间级别" name="spaceLevel">
              <a-select
                v-model:value="formData.spaceLevel"
                :options="SPACE_LEVEL_OPTIONS"
                placeholder="请输入空间级别"
                style="min-width: 180px"
                allow-clear
              />
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                style="width: 100%"
                :loading="loading"
              >
                提交
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="空间级别介绍" style="background-color: rgba(255, 255, 255, 0.5)">
          <a-typography-paragraph>
            * 目前仅支持开通普通版，如需升级空间，请联系
            <a href="https://github.com/LiqingyuDev" target="_blank">qingyu</a>。
          </a-typography-paragraph>
          <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
            {{ spaceLevel.text }}： 大小 {{ formatSize(spaceLevel.maxSize) }}， 上传次数
            {{ spaceLevel.maxCount }}
          </a-typography-paragraph>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { addSpaceUsingPost, listSpaceLevelUsingGet } from '@/api/spaceController.ts'
import { useRouter } from 'vue-router'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constants/space.ts'
import { formatSize } from '../../util'

const formData = reactive<API.SpaceUpdateRequest | API.SpaceAddRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref(false)

const router = useRouter()

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

onMounted(() => {
  fetchSpaceLevelList()
})

const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await addSpaceUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
#addSpaceBatchPage {
  padding: 10px;
}
</style>

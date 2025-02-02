<script setup lang="ts">
import { ref } from 'vue'
import { defineExpose } from "vue";

const open = ref<boolean>(false)
// 显示对话框
const openModal = () => {
  open.value = true
}
/**
 * 组件接收一个link属性，用于显示图片链接
 */
const props = defineProps({
  link: {
    type: String,
    default: 'https://next.antdv.com/assets/logo.1ef800a8.svg',
  },
})

// 暴露函数给父组件
defineExpose({
  openModal,
});

</script>

<template>
  <!--二维码分享对话框-->
  <div class="share-modal">
    <a-modal v-model:open="open" title="分享图片" :footer="false">
      <p />
      <h3>图片链接:</h3>
      <a-typography-link style="margin: 16px" copyable>
        {{ link }}
      </a-typography-link>
      <h3>手机扫码查看:</h3>
      <a-qrcode :value="link" :size="128" style="margin: 0 auto" />
    </a-modal>
  </div>
</template>

<style scoped></style>

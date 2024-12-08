<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a
          href="https://account.bilibili.com/account/home?spm_id_from=333.1007.0.0"
          target="_blank"
        >
          by 轻语
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style scoped>
#basicLayout {
}

#basicLayout .header {
  padding-inline: 20px; /* 内联方向的内边距，左右各 20px */
  margin-bottom: 16px; /* 底部外边距为 16px */
  color: unset; /* 颜色继承自父元素 */
  background: white; /* 背景颜色为白色 */
}


#basicLayout .content {
  background: linear-gradient(to right, #fefefe, rgba(35, 161, 251, 0.13));
  margin-bottom: 28px;
  padding: 20px;
}

#basicLayout .footer {
  background: white;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>

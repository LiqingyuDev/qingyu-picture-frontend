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
        <div>© 2025 轻语. All rights reserved.</div>
      </a-layout-footer>
    </a-layout>
  </div>
  <!--  主题色-->
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#4caf50', // 绿色
        colorTextBase: '#333333', // 深灰色
        colorLink: '#2196f3', // 蓝色
        colorError: '#f44336', // 红色
        colorWarning: '#ff9800', // 橙色
        colorSuccess: '#4caf50', // 绿色
        colorInfo: '#2196f3', // 蓝色
        colorBorderBase: '#e0e0e0', // 浅灰色
      },
    }"
  >
    <a-button />
  </a-config-provider>
</template>

<style scoped>
#basicLayout {
}

#basicLayout .header {
  padding-inline: 20px; /* 内联方向的内边距，左右各 20px */
  margin-bottom: 4px; /* 底部外边距为 16px */
  color: unset; /* 颜色继承自父元素 */
  background: white; /* 背景颜色为白色 */
}

/* 定义关键帧动画 */
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 应用动画到 .content 类 */
#basicLayout .content {
  background-image: linear-gradient(-225deg, #69eacb 0%, #eaccf8 48%, #6654f1 100%);
  background-size: 200% 200%; /* 确保背景有足够的空间进行移动 */
  animation: gradientAnimation 10s ease infinite; /* 设置动画持续时间、过渡效果和重复次数 */
  padding: 20px;
}

#basicLayout .footer {
  background: rgba(255, 255, 255, 0.81); /* 半透明白色背景 */
  padding: 9px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  border-top: 1px solid #e0e0e0; /* 添加顶部边框 */
}
</style>

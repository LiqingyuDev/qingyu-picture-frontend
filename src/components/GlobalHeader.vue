<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="160px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="~@/assets/logo.png" alt="logo" />
            <div class="title">轻语云图库</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">

          <div v-if="loginUserStore.loginUser.id">
            {{ loginUserStore.loginUser.username ?? '默认昵称' }}
          </div>
          <div v-else>
            <a-button type="primary" href="/user/register">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import {
  InfoCircleOutlined,
  GithubOutlined,
  HomeOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
// @ts-ignore
import { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const doMenuClick = ({ key }: any) => {
  router.push({ path: key })
}
// 钩子,监听路由变化
const current = ref<string[]>(['/'])
//更新高亮菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const loginUserStore = useLoginUserStore()
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '首页',
    title: '首页',
  },

  {
    key: '/admin',
    icon: () => h(CrownOutlined),
    label: '管理',
    title: '管理',
  },
  {
    key: '/setting',
    icon: () => h(SettingOutlined),
    label: '设置',
    title: '设置',
  },
  {
    key: '/about',
    icon: () => h(InfoCircleOutlined),
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    icon: () => h(GithubOutlined),
    label: h('a', { href: 'https://www.antdv.com' }, 'Github'),
    title: '其他',
  },
])
</script>
<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 10px; /* 图片和标题之间的间距 */
}

.title {
  color: #272a3c;
  font-size: 1.25rem;
  font-weight: bold;
}
</style>

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
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>
                <a-avatar
                  :size="40"
                  :src="
                    loginUserStore.loginUser.userAvatar || 'https://aliyuncdn.antdv.com/vue.png'
                  "
                />
                {{ loginUserStore.loginUser.userName ?? '默认昵称' }}
                <DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-button type="default" style="width: 100%" @click="doLogout" danger>
                    注销
                    <LogoutOutlined />
                  </a-button>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div
            v-else-if="
              router.currentRoute.value.path !== '/user/login' &&
              router.currentRoute.value.path !== '/user/register'
            "
          >
            <a-button type="primary" href="/user/login">
              <LoginOutlined />
              登录
            </a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, computed } from 'vue'
import {
  InfoCircleOutlined,
  GithubOutlined,
  HomeOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
// @ts-ignore
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

import {
  DownOutlined,
  LoginOutlined,
  LogoutOutlined,
  PictureOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()

const doMenuClick = ({ key }: any) => {
  router.push({ path: key })
}

// 注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    message.success('退出登录成功')
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    await router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('退出登录失败' + res.data.message)
  }
}

// 钩子,监听路由变化
const current = ref<string[]>(['/'])

// 更新高亮菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'

const loginUserStore = useLoginUserStore()

const originItems = [
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
    children: [
      {
        key: '/admin/user',
        icon: () => h(TeamOutlined),
        label: '用户管理',
        title: '用户管理',
      },
      {
        key: '/admin/picture',
        icon: () => h(PictureOutlined),
        label: '图片管理',
        title: '图片管理',
      },
    ],
  },
  {
    key: '/add_picture',
    icon: () => h(PictureOutlined),
    label: '创建图片',
    title: '创建图片',
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
]

// 过滤菜单项
const filterMenus = (menus: MenuProps['items'] = []) => {
  return menus.filter((menu) => {
    if (menu) {
      // 检查 menu 是否为 null 或 undefined
      if (typeof menu.key === 'string' && menu.key.startsWith('/admin')) {
        const loginUser = loginUserStore.loginUser
        if (!loginUser || loginUser.userRole !== 'admin') {
          return false
        }
      }
      return true
    }
    return false
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))
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

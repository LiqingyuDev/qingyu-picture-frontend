<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="160px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="~@/assets/logo.png" alt="logo" />
            <div class="title">万象云影</div>
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
                  <a-menu-item>
                    <a-button type="link" size="small" style="width: 100%" @click="doLogout" danger>
                      退出登录
                      <LogoutOutlined />
                    </a-button>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/my_space">
                      <a-button type="link" size="small" style="width: 100%">
                        我的空间
                        <FolderOpenOutlined />
                      </a-button>
                    </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/setting">
                      <a-button type="link" size="small" style="width: 100%">
                        个人设置
                        <SettingOutlined />
                      </a-button>
                    </router-link>
                  </a-menu-item>
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
import { h, ref, computed, watchEffect } from 'vue'
// @ts-ignore
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

import {
  HomeOutlined,
  CrownOutlined,
  DownOutlined,
  LoginOutlined,
  LogoutOutlined,
  PictureOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  LockOutlined,
  FolderOutlined,
  GithubOutlined,
  LinkOutlined,
  FolderAddOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
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
router.afterEach((to,) => {
  current.value = [to.path]
})

import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

const loginUserStore = useLoginUserStore()

const fixedMenuItems = [
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
        icon: () => h(FileImageOutlined),
        label: '图片管理',
        title: '图片管理',
      },
      {
        key: '/admin/space',
        icon: () => h(FolderOpenOutlined),
        label: '空间管理',
        title: '空间管理',
      },
    ],
  },
  {
    key: '/add_picture',
    icon: () => h(UploadOutlined),
    label: '上传图片',
    title: '上传图片',
    children: [
      {
        key: '/add_picture/direct', // 唯一的 key
        icon: () => h(PictureOutlined),
        label: '直接上传图片',
        title: '直接上传图片',
      },
      {
        key: '/add_picture/url',
        icon: () => h(LinkOutlined),
        label: 'URL上传图片',
        title: 'URL上传图片',
      },
    ],
  },
  {
    icon: () => h(LockOutlined),
    label: '私有空间',
    title: '私有空间',
    children: [
      {
        key: '/add_space',
        icon: () => h(FolderAddOutlined),
        label: '创建空间',
        title: '创建空间',
      },
      {
        key: '/my_space',
        icon: () => h(FolderOutlined),
        label: '我的空间',
        title: '我的空间',
      },
    ],
  },
  {
    icon: () => h(LockOutlined),
    label: '团队空间',
    title: '团队空间',
    children: [
      {
        key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
        label: '创建团队',
        title: '创建空间',
        icon: () => h(TeamOutlined),
      },
      {
        key: '/my_team_list',
        label: '我的团队',
        title: '我的团队',
        icon: () => h(TeamOutlined),
      },
    ],
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
    label: h('a', { href: 'https://github.com/LiqingyuDev/qingyu-picture-backend' }, 'Github'),
    title: 'Github',
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
const items = computed<MenuProps['items']>(() => filterMenus(fixedMenuItems))
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

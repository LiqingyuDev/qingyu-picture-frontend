import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagerPage from '@/pages/admin/UserManagerPage.vue'
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'
import PictureManagerPage from '@/pages/admin/PictureManagerPage.vue'
import PictureDetailPage from '@/pages/picture/PictureDetailPage.vue'
import AddPictureByUrlPage from '@/pages/picture/AddPictureByUrlPage.vue'
import AddPictureByBatchPage from '@/pages/admin/AddPictureByBatchPage.vue'
import SpaceManagePage from '@/pages/admin/SpaceManagePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '首页',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: '登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '注册',
      component: UserRegisterPage,
    },
    {
      path: '/add_picture/direct', // 修改路径
      name: '直接创建图片', // 修改名称
      component: AddPicturePage,
      props: true,
    },
    {
      path: '/add_picture/url', // 保持路径不变
      name: '通过URL创建图片', // 保持名称不变
      component: AddPictureByUrlPage,
      props: true,
    },
    {
      path: '/add_picture/batch', // 保持路径不变
      name: '批量爬取创建图片', // 保持名称不变
      component: AddPictureByBatchPage,
      props: true,
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true,
    },
    {
      path: '/admin/user',
      name: '用户管理',
      component: UserManagerPage,
    },
    {
      path: '/admin/picture',
      name: '图片管理',
      component: PictureManagerPage,
    },
    {
      path: '/admin/space',
      name: '空间管理',
      component: SpaceManagePage,
    },
    {
      path: '/about',
      name: '关于',
      // 路由级别的代码分割
      // 这将为该路由生成一个单独的块 (About.[hash].js)
      // 当访问该路由时，该块将被懒加载。
      component: () => import('../pages/AboutPage.vue'),
    },
  ],
})

export default router

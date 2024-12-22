import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagerPage from '@/pages/admin/UserManagerPage.vue'
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'

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
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage,
    },

    {
      path: '/admin/user',
      name: '用户管理',
      component: UserManagerPage,
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

import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'

// 标记是否为首次获取登录用户信息
let firstFetchLoginUser = true;

/**
 * 全局权限校验
 * 在每次路由跳转前，检查用户是否已登录以及是否有权限访问目标页面
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;

  // 如果是首次获取登录用户信息，等待从后端获取用户信息
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
    firstFetchLoginUser = false;
  }

  const toUrl = to.fullPath;

  // 检查目标路径是否以 '/admin' 开头
  if (toUrl.startsWith('/admin')) {
    // 如果用户未登录或不是管理员，提示错误并重定向到登录页面
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error('没有权限');
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
  }

  // 如果用户有权限，继续导航
  next();
});

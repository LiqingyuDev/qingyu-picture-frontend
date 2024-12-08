import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

//定义存储用户登录信息的store状态
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<any>({
    username: '未登录',
  })

  /**
   * 获取登录用户
   */
  async function fetchLoginUser() {
    //TODO:后端还没写, 先写死
    // return loginUser.value
    //5秒钟后,假设登录成功
      setTimeout(() => {
        loginUser.value = {
          username: 'admin',
          id: 1,
        }
      }, 5000)
  }

  /**
   * 设置登录用户
   */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})

<template>
  <div id="userLoginPage">
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">


      <h1 class="title">轻语云图库-用户登录</h1>
      <div class="desc">企业智能协同云图库</div>
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号">
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码!' },
          { min: 8, message: '密码不能小于8位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码">
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>
      <div class="tips">
        没有账号?
        <router-link to="/user/register">去注册!</router-link>
      </div>

      <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

interface FormState {
  userAccount: string
  password: string
  remember: boolean
}

//接收表单输入的值
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
const loginUserStore = useLoginUserStore()

//提交表单之后的逻辑
const handleSubmit = async (values: any) => {
  try {
    const res = await userLoginUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      // 再从远程获取全局登录状态
      await loginUserStore.fetchLoginUser()
      message.success('登录成功')
      router.push({
        path: '/',
        replace: true,
      })
    } else {
      message.error('登录失败,' + res.data.message)
    }
  } catch (error) {
    console.error('登录过程中发生错误:', error)
    message.error('登录过程中发生错误，请重试')
  }
  console.log('提交的表单值:', values)
}
</script>
<style scoped>
#userLoginPage {
  max-width: 420px;
  margin: 100px auto;
}

.title {
  text-align: center;
  margin-bottom: 36px;
  color: #333;
}

.desc {
  text-align: center;
  color: #666;
  margin-bottom: 16px;
}

.tips {
  text-align: right;
  margin-bottom: 16px;
  color: #999;
}
</style>

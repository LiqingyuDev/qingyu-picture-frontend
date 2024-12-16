<template>
  <div id="userRegisterPage">
    <a-form :model="formState" name="register" autocomplete="off" @finish="handleSubmit">
      <h1 class="title">轻语云图库-用户注册</h1>
      <div class="desc">企业智能协同云图库</div>
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入用户账号!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入用户账号">
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

      <a-form-item
        name="checkPassword"
        :rules="[
/*          { required: true, message: '请再次确认密码!' },*/
          { validator: validateConfirmPassword },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请再次确认密码">
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>
      <div class="tips">
        已有账号?
        <router-link to="/user/login">去登录!</router-link>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLoginUsingPost, userRegisterUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

interface FormState {
  userAccount: string
  password: string
  checkPassword: string
}


//接收表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})


//提交表单之后的逻辑
const handleSubmit = async (values: any) => {
  try {
    const res = await userRegisterUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功')
      router.push({
        path: '/user/login',
        replace: true,
      })
    } else {
      message.error('注册失败，请稍后再试' + res.data.message)
    }
  } catch (error) {
    message.error('网络请求出错，请稍后再试')
  }
}
const validateConfirmPassword = (rule: any, value: string) => {
  if (!value) {
    console.log('再次确认密码为空');
    return Promise.reject('请再次确认密码!');
  }
  if (value !== formState.userPassword) {
    console.log('两次输入的密码不一致');
    return Promise.reject('两次输入的密码不一致!');
  }
  console.log('密码验证通过');
  return Promise.resolve();
};

</script>

<style scoped>
#userRegisterPage {
  width: 360px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 32px;
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

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">邮件登录</h2>
        <p class="mt-2 text-sm text-gray-600">输入邮箱账号和密码获取邮件</p>
      </div>
      
      <div class="mt-8 space-y-6">
        <div v-if="errorMsg" class="text-red-500 text-sm text-center">
          {{ errorMsg }}
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">邮箱地址</label>
          <input 
            v-model="email" 
            id="email"
            type="email" 
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入邮箱地址"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
          <input 
            v-model="password" 
            id="password"
            type="password" 
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入密码"
          >
        </div>

        <button 
          @click="fetchEmails" 
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">处理中...</span>
          <span v-else>获取邮件</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const fetchEmails = async () => {
  console.log('fetchEmails 被调用')
  if (!email.value || !password.value) {
    errorMsg.value = '请输入邮箱和密码'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMsg.value = '请输入有效的邮箱地址'
    return
  }

  loading.value = true
  errorMsg.value = ''
  
  try {
    const { data, error } = await useFetch('/api/email', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (error.value) {
      throw new Error(error.value?.message || '获取邮件失败')
    }

    // 存储邮件数据
    if (data.value?.data) {
      localStorage.setItem('emails', JSON.stringify(data.value.data))
    }
    // 跳转到列表页
    router.push('/email-list')
    
  } catch (error: any) {
    console.error('获取邮件失败：', error)
    errorMsg.value = error.message || '获取邮件失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
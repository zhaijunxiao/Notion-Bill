<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">系统设置</h2>
        <p class="mt-2 text-sm text-gray-600">请填写邮箱和 Notion 相关配置</p>
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
          <label for="authCode" class="block text-sm font-medium text-gray-700">邮箱授权码</label>
          <input 
            v-model="authCode" 
            id="authCode"
            type="password" 
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入邮箱授权码"
          >
        </div>

        <div>
          <label for="notionToken" class="block text-sm font-medium text-gray-700">Notion Token</label>
          <input 
            v-model="notionToken" 
            id="notionToken"
            type="password" 
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入 Notion Token"
          >
        </div>

        <div>
          <label for="databaseId" class="block text-sm font-medium text-gray-700">Database ID</label>
          <input 
            v-model="databaseId" 
            id="databaseId"
            type="text" 
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入 Notion Database ID"
          >
        </div>

        <!-- 按钮组 -->
        <div class="flex space-x-4">
          <button 
            @click="saveSettings" 
            :disabled="loading"
            class="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">保存中...</span>
            <span v-else>保存设置</span>
          </button>

          <button 
            @click="fetchEmails" 
            :disabled="fetchingEmails || !hasValidSettings"
            class="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <template v-if="fetchingEmails">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              获取中...
            </template>
            <span v-else>获取邮件列表</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '~/stores/settings'
import { useMyEmailtopStore } from '~/stores/emailtop'
import type { EmailTop } from '~/stores/emailtop'

const router = useRouter()
const settingsStore = useSettingsStore()
const emailtopStore = useMyEmailtopStore()

// 使用 store 中的值初始化
const email = ref(settingsStore.email)
const authCode = ref(settingsStore.authCode)
const notionToken = ref(settingsStore.notionToken)
const databaseId = ref(settingsStore.databaseId)
const loading = ref(false)
const errorMsg = ref('')
const fetchingEmails = ref(false)

// 计算属性：检查是否有有效的设置
const hasValidSettings = computed(() => {
  return email.value && authCode.value && notionToken.value && databaseId.value
})


onMounted(() => {
  email.value = settingsStore.email
  authCode.value = settingsStore.authCode
  notionToken.value = settingsStore.notionToken
  databaseId.value = settingsStore.databaseId
})

const saveSettings = async () => {
  if (!email.value || !authCode.value || !notionToken.value || !databaseId.value) {
    errorMsg.value = '请填写所有必填项'
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
    // 使用 Pinia store 保存设置
    settingsStore.setSettings({
      email: email.value,
      authCode: authCode.value,
      notionToken: notionToken.value,
      databaseId: databaseId.value
    })
    errorMsg.value = '设置保存成功'
    
  } catch (error: any) {
    console.error('保存设置失败：', error)
    errorMsg.value = error.message || '保存设置失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 获取邮件列表
const fetchEmails = async () => {
  if (!hasValidSettings.value) {
    errorMsg.value = '请先完成所有设置'
    return
  }

  fetchingEmails.value = true
  errorMsg.value = ''

  try {
    //调用api/email接口
    const { data } = await useFetch('/api/email', {
      method: 'POST',
      body: {
        email: email.value,
        authCode: authCode.value
      }
    })

    if (data.value && data.value.code !== 200) {
      // 使用类型守卫检查 message 属性是否存在
      const errorMessage = 'message' in data.value ? data.value.message : '获取邮件列表失败，请稍后重试'
      errorMsg.value = errorMessage as string
      return
    }

    // 添加类型检查
    if (data.value && 'data' in data.value) {
      emailtopStore.setEmails(data.value.data as EmailTop[])
    }
    
    // 获取成功后跳转到邮件列表页面
    router.push('/email-list')
  } catch (error: any) {
    console.error('获取邮件列表失败：', error)
    errorMsg.value = error.message || '获取邮件列表失败，请稍后重试'
  } finally {
    fetchingEmails.value = false
  }
}
</script>